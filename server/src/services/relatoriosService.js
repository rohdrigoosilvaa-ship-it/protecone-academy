import prisma from "../db/prisma.js";

export async function dashboardAdmin() {
  const ha15Dias = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const ha30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalAlunos, totalCursos, cursosAtivos, cursosRascunho, totalMatriculas, matriculasAndamento, matriculasConcluidas,
    certificadosEmitidos, alunosNovos30d, tentativasFinais, matriculas,
  ] = await Promise.all([
    prisma.usuario.count({ where: { perfil: "ALUNO" } }),
    prisma.curso.count(),
    prisma.curso.count({ where: { status: "PUBLICADO" } }),
    prisma.curso.count({ where: { status: "RASCUNHO" } }),
    prisma.matricula.count(),
    prisma.matricula.count({ where: { status: "ATIVA" } }),
    prisma.matricula.count({ where: { status: "CONCLUIDA" } }),
    prisma.certificado.count(),
    prisma.usuario.count({ where: { perfil: "ALUNO", criadoEm: { gte: ha30Dias } } }),
    prisma.provaTentativa.findMany({ where: { finalizadoEm: { not: null } }, select: { aprovado: true, nota: true, cursoId: true, finalizadoEm: true } }),
    prisma.matricula.findMany({ select: { cursoId: true, progressoPct: true, status: true } }),
  ]);

  const taxaAprovacao = tentativasFinais.length
    ? Math.round((tentativasFinais.filter((t) => t.aprovado).length / tentativasFinais.length) * 100)
    : 0;
  const reprovacoes = tentativasFinais.filter((t) => !t.aprovado).length;
  const conclusoesMes = tentativasFinais.filter((t) => t.aprovado && new Date(t.finalizadoEm) >= inicioMes).length;

  const cursos = await prisma.curso.findMany({ include: { _count: { select: { matriculas: true } } } });
  const alunosPorCurso = cursos
    .map((c) => ({ nome: c.nome, alunos: c._count.matriculas }))
    .sort((a, b) => b.alunos - a.alunos)
    .slice(0, 8);

  const notaMediaPorCurso = {};
  const tentativasPorCurso = {};
  for (const t of tentativasFinais) {
    (notaMediaPorCurso[t.cursoId] ??= []).push(t.nota);
    (tentativasPorCurso[t.cursoId] ??= []).push(t);
  }
  const notasMedias = cursos
    .filter((c) => notaMediaPorCurso[c.id]?.length)
    .map((c) => ({ nome: c.nome, notaMedia: Math.round(notaMediaPorCurso[c.id].reduce((a, b) => a + b, 0) / notaMediaPorCurso[c.id].length) }));

  const conclusoesPorMes = {};
  for (const t of tentativasFinais.filter((t) => t.aprovado)) {
    const chave = new Date(t.finalizadoEm).toISOString().slice(0, 7);
    conclusoesPorMes[chave] = (conclusoesPorMes[chave] || 0) + 1;
  }
  const conclusoesPorPeriodo = Object.entries(conclusoesPorMes).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([mes, total]) => ({ mes, total }));

  // tabela "desempenho dos cursos"
  const matriculasPorCurso = {};
  for (const m of matriculas) (matriculasPorCurso[m.cursoId] ??= []).push(m);
  const desempenhoPorCurso = cursos.map((c) => {
    const ms = matriculasPorCurso[c.id] || [];
    const ts = tentativasPorCurso[c.id] || [];
    const concluidas = ms.filter((m) => m.status === "CONCLUIDA").length;
    const aprovadas = ts.filter((t) => t.aprovado).length;
    return {
      id: c.id,
      nome: c.nome,
      status: c.status,
      alunos: ms.length,
      progressoMedio: ms.length ? Math.round(ms.reduce((a, m) => a + m.progressoPct, 0) / ms.length) : 0,
      taxaConclusao: ms.length ? Math.round((concluidas / ms.length) * 100) : 0,
      taxaAprovacao: ts.length ? Math.round((aprovadas / ts.length) * 100) : null,
      notaMedia: ts.length ? Math.round(ts.reduce((a, t) => a + t.nota, 0) / ts.length) : null,
    };
  }).sort((a, b) => b.alunos - a.alunos);

  // seção "Atenção"
  const alunosInativos = await prisma.usuario.findMany({
    where: { perfil: "ALUNO", matriculas: { some: { status: "ATIVA" } }, OR: [{ ultimoLoginEm: null }, { ultimoLoginEm: { lt: ha15Dias } }] },
    select: { id: true, nome: true, email: true, ultimoLoginEm: true },
    take: 10,
  });
  const cursosRascunhoLista = cursos.filter((c) => c.status === "RASCUNHO").map((c) => ({ id: c.id, nome: c.nome }));
  const aprovadosSemCertificado = await prisma.provaTentativa.count({
    where: { aprovado: true, finalizadoEm: { not: null }, usuario: { certificados: { none: {} } } },
  });

  return {
    indicadores: {
      totalAlunos, totalCursos, cursosAtivos, totalMatriculas, matriculasAndamento, matriculasConcluidas, certificadosEmitidos, taxaAprovacao,
      cursosRascunho, alunosNovos30d, conclusoesMes, reprovacoes,
    },
    alunosPorCurso,
    notasMedias,
    conclusoesPorPeriodo,
    desempenhoPorCurso,
    atencao: { alunosInativos, cursosRascunho: cursosRascunhoLista, aprovadosSemCertificado },
    cursosMaisRealizados: alunosPorCurso,
  };
}

export async function relatorioAluno(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
  if (!usuario) return null;

  const matriculas = await prisma.matricula.findMany({ where: { usuarioId: usuario.id }, include: { curso: true } });
  const provaTentativas = await prisma.provaTentativa.findMany({ where: { usuarioId: usuario.id, finalizadoEm: { not: null } }, include: { curso: true } });
  const certificados = await prisma.certificado.findMany({ where: { usuarioId: usuario.id }, include: { curso: true } });
  const quizTentativas = await prisma.quizTentativa.findMany({ where: { usuarioId: usuario.id }, include: { modulo: true } });

  const { senhaHash, ...usuarioPublico } = usuario;
  return { usuario: usuarioPublico, matriculas, provaTentativas, certificados, quizTentativas };
}

export async function buscarAlunos(termo) {
  return prisma.usuario.findMany({
    where: { perfil: "ALUNO", OR: [{ nome: { contains: termo, mode: "insensitive" } }, { email: { contains: termo, mode: "insensitive" } }] },
    take: 30,
    orderBy: { nome: "asc" },
  });
}

export async function relatorioCurso(cursoId) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(cursoId) } });
  if (!curso) return null;

  const matriculas = await prisma.matricula.findMany({ where: { cursoId: curso.id } });
  const tentativas = await prisma.provaTentativa.findMany({ where: { cursoId: curso.id, finalizadoEm: { not: null } } });

  const numAlunos = matriculas.length;
  const concluidos = matriculas.filter((m) => m.status === "CONCLUIDA").length;
  const andamento = matriculas.filter((m) => m.status === "ATIVA").length;
  const cancelados = matriculas.filter((m) => m.status === "CANCELADA").length;
  const expirados = matriculas.filter((m) => m.status === "EXPIRADA").length;
  const reprovados = tentativas.filter((t) => !t.aprovado).length;
  const aprovados = tentativas.filter((t) => t.aprovado).length;

  const temposConclusao = matriculas
    .filter((m) => m.concluidoEm)
    .map((m) => (new Date(m.concluidoEm) - new Date(m.matriculadoEm)) / (1000 * 60 * 60 * 24));
  const tempoMedioDias = temposConclusao.length ? Math.round(temposConclusao.reduce((a, b) => a + b, 0) / temposConclusao.length) : null;

  return {
    curso,
    numAlunos,
    concluidos,
    andamento,
    cancelados,
    expirados,
    reprovados,
    taxaConclusaoPct: numAlunos ? Math.round((concluidos / numAlunos) * 100) : 0,
    taxaAprovacaoPct: tentativas.length ? Math.round((aprovados / tentativas.length) * 100) : 0,
    notaMedia: tentativas.length ? Math.round(tentativas.reduce((a, t) => a + t.nota, 0) / tentativas.length) : null,
    tempoMedioDias,
  };
}
