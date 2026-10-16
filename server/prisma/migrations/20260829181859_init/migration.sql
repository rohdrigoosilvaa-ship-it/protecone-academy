-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'ALUNO');

-- CreateEnum
CREATE TYPE "StatusCurso" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoConteudoAula" AS ENUM ('VIDEO', 'TEXTO', 'PDF', 'IMAGEM', 'LINK');

-- CreateEnum
CREATE TYPE "ProvedorVideo" AS ENUM ('YOUTUBE', 'VIMEO', 'URL');

-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "StatusMatricula" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO', 'REPROVADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'ALUNO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem_capa_url" TEXT,
    "carga_horaria_minutos" INTEGER NOT NULL DEFAULT 0,
    "categoria_id" INTEGER,
    "status" "StatusCurso" NOT NULL DEFAULT 'RASCUNHO',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "percentual_minimo_aula" INTEGER NOT NULL DEFAULT 90,
    "nota_minima_quiz" INTEGER NOT NULL DEFAULT 70,
    "nota_minima_prova" INTEGER NOT NULL DEFAULT 70,
    "max_tentativas" INTEGER NOT NULL DEFAULT 3,
    "tempo_prova_minutos" INTEGER,
    "num_questoes_prova" INTEGER NOT NULL DEFAULT 20,
    "certificado_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" SERIAL NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas" (
    "id" SERIAL NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoConteudoAula" NOT NULL DEFAULT 'VIDEO',
    "provedor_video" "ProvedorVideo",
    "video_id" TEXT,
    "video_url" TEXT,
    "conteudo_texto" TEXT,
    "duracao_segundos" INTEGER,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" SERIAL NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "status" "StatusMatricula" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "progresso_pct" INTEGER NOT NULL DEFAULT 0,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_aulas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "percentual_assistido" INTEGER NOT NULL DEFAULT 0,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "ultima_posicao_segundos" INTEGER NOT NULL DEFAULT 0,
    "concluida_em" TIMESTAMP(3),
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progresso_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" SERIAL NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "modulo_id" INTEGER,
    "enunciado" TEXT NOT NULL,
    "alternativas" JSONB NOT NULL,
    "resposta_correta_index" INTEGER NOT NULL,
    "explicacao" TEXT,
    "pontuacao" INTEGER NOT NULL DEFAULT 1,
    "dificuldade" "Dificuldade" NOT NULL DEFAULT 'MEDIO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_tentativas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "respostas_json" JSONB NOT NULL,
    "nota" INTEGER NOT NULL,
    "aprovado" BOOLEAN NOT NULL,
    "tentativa_num" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_tentativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prova_tentativas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "questoes_snapshot_json" JSONB NOT NULL,
    "respostas_json" JSONB,
    "nota" INTEGER,
    "aprovado" BOOLEAN,
    "tentativa_num" INTEGER NOT NULL,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" TIMESTAMP(3),

    CONSTRAINT "prova_tentativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "carga_horaria_minutos" INTEGER NOT NULL,
    "emitido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "cursos_status_idx" ON "cursos"("status");

-- CreateIndex
CREATE INDEX "modulos_curso_id_idx" ON "modulos"("curso_id");

-- CreateIndex
CREATE INDEX "aulas_modulo_id_idx" ON "aulas"("modulo_id");

-- CreateIndex
CREATE INDEX "materiais_aula_id_idx" ON "materiais"("aula_id");

-- CreateIndex
CREATE INDEX "matriculas_curso_id_idx" ON "matriculas"("curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_usuario_id_curso_id_key" ON "matriculas"("usuario_id", "curso_id");

-- CreateIndex
CREATE INDEX "progresso_aulas_aula_id_idx" ON "progresso_aulas"("aula_id");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_aulas_usuario_id_aula_id_key" ON "progresso_aulas"("usuario_id", "aula_id");

-- CreateIndex
CREATE INDEX "questoes_curso_id_idx" ON "questoes"("curso_id");

-- CreateIndex
CREATE INDEX "questoes_modulo_id_idx" ON "questoes"("modulo_id");

-- CreateIndex
CREATE INDEX "quiz_tentativas_usuario_id_modulo_id_idx" ON "quiz_tentativas"("usuario_id", "modulo_id");

-- CreateIndex
CREATE INDEX "prova_tentativas_usuario_id_curso_id_idx" ON "prova_tentativas"("usuario_id", "curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_codigo_key" ON "certificados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_usuario_id_curso_id_key" ON "certificados"("usuario_id", "curso_id");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_lida_idx" ON "notificacoes"("usuario_id", "lida");

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aulas" ADD CONSTRAINT "progresso_aulas_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_tentativas" ADD CONSTRAINT "quiz_tentativas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_tentativas" ADD CONSTRAINT "quiz_tentativas_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prova_tentativas" ADD CONSTRAINT "prova_tentativas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prova_tentativas" ADD CONSTRAINT "prova_tentativas_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
