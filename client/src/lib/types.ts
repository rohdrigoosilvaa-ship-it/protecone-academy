export type Perfil = "ADMIN" | "ALUNO";
export type StatusCurso = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
export type TipoConteudoAula = "VIDEO" | "TEXTO" | "PDF" | "IMAGEM" | "LINK";
export type ProvedorVideo = "YOUTUBE" | "VIMEO" | "URL";
export type Dificuldade = "FACIL" | "MEDIO" | "DIFICIL";
export type StatusMatricula = "ATIVA" | "CONCLUIDA" | "CANCELADA" | "EXPIRADA";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface Curso {
  id: number;
  nome: string;
  descricao: string;
  imagemCapaUrl: string | null;
  cargaHoraria: string;
  categoriaId: number | null;
  categoria: Categoria | null;
  status: StatusCurso;
  ordem: number;
  instrutor: string | null;
  objetivos: string | null;
  publicoAlvo: string | null;
  preRequisitos: string | null;
  competencias: string | null;
  percentualMinimoAula: number;
  notaMinimaQuiz: number;
  notaMinimaProva: number;
  maxTentativas: number;
  tempoProvaMinutos: number | null;
  numQuestoesProva: number;
  certificadoHabilitado: boolean;
  criadoEm: string;
  _count?: { modulos: number; matriculas: number };
  matricula?: Matricula | null;
  modulos?: Modulo[];
}

export interface Matricula {
  id: number;
  usuarioId: number;
  cursoId: number;
  curso?: Curso;
  usuario?: Usuario;
  status: StatusMatricula;
  progressoPct: number;
  matriculadoEm: string;
  iniciadoEm: string | null;
  concluidoEm: string | null;
  expiraEm: string | null;
}

export interface Material {
  id: number;
  aulaId: number;
  nome: string;
  tipo: string;
  url: string;
}

export interface Aula {
  id: number;
  moduloId: number;
  nome: string;
  descricao: string | null;
  tipo: TipoConteudoAula;
  provedorVideo: ProvedorVideo | null;
  videoId: string | null;
  videoUrl: string | null;
  conteudoTexto: string | null;
  duracaoSegundos: number | null;
  ordem: number;
  materiais: Material[];
  // enriquecido pelo endpoint de progresso
  percentualAssistido?: number;
  ultimaPosicaoSegundos?: number;
  concluida?: boolean;
  bloqueada?: boolean;
}

export interface Questao {
  id: number;
  cursoId: number;
  moduloId: number | null;
  enunciado: string;
  alternativas: string[];
  respostaCorretaIndex?: number;
  explicacao: string | null;
  pontuacao: number;
  dificuldade: Dificuldade;
}

export interface Modulo {
  id: number;
  cursoId: number;
  nome: string;
  descricao: string | null;
  ordem: number;
  aulas: Aula[];
  questoes?: Questao[];
  // enriquecido pelo endpoint de progresso — sempre presente quando o Modulo
  // vem de GET /api/cursos/:id/progresso (aluno); ausente nas listagens
  // administrativas puras (que não usam estes dois campos)
  liberado: boolean;
  quiz: {
    temQuestoes: boolean;
    totalQuestoes: number;
    liberado: boolean;
    aprovado: boolean;
    tentativasUsadas: number;
    ultimaNota: number | null;
  };
}

export interface ProgressoCurso {
  curso: Curso;
  modulos: Modulo[];
  progressoPct: number;
  aulaAtual: Aula | null;
  moduloAtualId: number | null;
  provaFinalLiberada: boolean;
  provaFinalAprovada: boolean;
  provaTentativasUsadas: number;
}

export interface Certificado {
  id: number;
  codigo: string;
  usuarioId: number;
  usuario?: Usuario;
  cursoId: number;
  curso: Curso;
  cargaHoraria: string;
  emitidoEm: string;
}

export interface Notificacao {
  id: number;
  usuarioId: number;
  tipo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadoEm: string;
}

export interface ProvaTentativa {
  id: number;
  usuarioId: number;
  cursoId: number;
  curso?: Curso;
  tentativaNum: number;
  nota: number | null;
  aprovado: boolean | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
}

export interface CorrecaoQuestao {
  questaoId: number;
  enunciado: string;
  alternativas: string[];
  suaResposta: number | undefined;
  respostaCorretaIndex: number;
  correta: boolean;
  explicacao: string | null;
}

export interface ResultadoQuiz {
  nota: number;
  aprovado: boolean;
  notaMinima: number;
  correcao: CorrecaoQuestao[];
}

export interface TentativaProva {
  id: number;
  tentativaNum: number;
  iniciadoEm: string;
  tempoLimiteMinutos: number | null;
  notaMinima: number;
  questoes: { questaoId: number; enunciado: string; alternativas: string[] }[];
}

export interface ResultadoProva {
  nota: number;
  aprovado: boolean;
  notaMinima: number;
  tentativaNum: number;
  correcao: CorrecaoQuestao[];
  certificadoId: number | null;
}
