import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@protecseg.com.br";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

// seção 35 do escopo — primeiro curso da plataforma
const MODULOS = [
  { nome: "Integração de SST", aulas: ["Apresentação", "Conceitos de Segurança", "Responsabilidades"] },
  { nome: "Conceitos de Segurança", aulas: ["O que é SST", "Legislação básica (NRs)"] },
  { nome: "Identificação de Riscos", aulas: ["O que são riscos ocupacionais", "Mapa de riscos"] },
  { nome: "Riscos Físicos", aulas: ["Ruído, calor e vibração", "Radiações"] },
  { nome: "Riscos Químicos", aulas: ["Agentes químicos comuns", "Ficha de segurança (FISPQ)"] },
  { nome: "Riscos Biológicos", aulas: ["Agentes biológicos", "Medidas de controle"] },
  { nome: "EPIs e EPCs", aulas: ["Equipamentos de proteção", "Uso e conservação correta"] },
  { nome: "Comportamento Seguro", aulas: ["Cultura de segurança", "Atos e condições inseguras"] },
  { nome: "Emergências e Condutas", aulas: ["Planos de emergência", "Primeiros socorros básicos"] },
  { nome: "Avaliação Final", aulas: ["Revisão geral do conteúdo"] },
];

async function main() {
  const senhaHash = await bcrypt.hash(ADMIN_PASS, 10);
  const admin = await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { nome: "Administrador", email: ADMIN_EMAIL, senhaHash, perfil: "ADMIN" },
  });
  console.log(`✔ Admin: ${admin.email}`);

  const categoria = await prisma.categoria.upsert({
    where: { nome: "Segurança do Trabalho" },
    update: {},
    create: { nome: "Segurança do Trabalho" },
  });

  const cursoExistente = await prisma.curso.findFirst({ where: { nome: "Integração de Segurança e Saúde no Trabalho" } });
  if (cursoExistente) {
    console.log("✔ Curso inicial já existe, seed não duplicado.");
    return;
  }

  const curso = await prisma.curso.create({
    data: {
      nome: "Integração de Segurança e Saúde no Trabalho",
      descricao: "Conheça os principais conceitos, riscos e orientações necessários para iniciar suas atividades com segurança.",
      categoriaId: categoria.id,
      cargaHoraria: "2h30",
      status: "RASCUNHO",
      numQuestoesProva: 20,
      notaMinimaProva: 70,
      notaMinimaQuiz: 70,
      percentualMinimoAula: 90,
      maxTentativas: 3,
      certificadoHabilitado: true,
    },
  });

  for (let i = 0; i < MODULOS.length; i++) {
    const m = MODULOS[i];
    const modulo = await prisma.modulo.create({ data: { cursoId: curso.id, nome: m.nome, ordem: i } });
    for (let j = 0; j < m.aulas.length; j++) {
      await prisma.aula.create({
        data: { moduloId: modulo.id, nome: m.aulas[j], tipo: "VIDEO", ordem: j },
      });
    }
  }

  console.log(`✔ Curso "${curso.nome}" criado com ${MODULOS.length} módulos (rascunho — adicione vídeos e questões antes de publicar).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
