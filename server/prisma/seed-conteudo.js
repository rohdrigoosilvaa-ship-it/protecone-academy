// Carrega o banco de questões e (opcionalmente) os vídeos do curso inicial.
//
//   npm run seed:conteudo            -> cria as questões (não duplica se já existirem)
//   npm run seed:conteudo -- --videos -> só atualiza os vídeos da lista VIDEOS abaixo
//
// Pré-requisito: já ter rodado `npm run seed` (cria o curso e os módulos).
//
// Regras do projeto:
//  - questão com módulo  => compõe o quiz daquele módulo (3 por módulo)
//  - questão sem módulo  => só entra no sorteio da prova final
//  - a prova final sorteia as questões de TODO o banco do curso
// Revise tudo no painel admin antes de publicar o curso.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NOME_CURSO = "Integração de Segurança e Saúde no Trabalho";

// ───────────────────────── VÍDEOS ─────────────────────────
// Cole o link de cada aula entre aspas. Aceita YouTube, Vimeo ou link direto (.mp4).
// A chave é "Nome do módulo | Nome da aula". Aulas com "" ficam sem vídeo.
const VIDEOS = {
  "Integração de SST | Apresentação": "",
  "Integração de SST | Conceitos de Segurança": "",
  "Integração de SST | Responsabilidades": "",
  "Conceitos de Segurança | O que é SST": "",
  "Conceitos de Segurança | Legislação básica (NRs)": "",
  "Identificação de Riscos | O que são riscos ocupacionais": "",
  "Identificação de Riscos | Mapa de riscos": "",
  "Riscos Físicos | Ruído, calor e vibração": "",
  "Riscos Físicos | Radiações": "",
  "Riscos Químicos | Agentes químicos comuns": "",
  "Riscos Químicos | Ficha de segurança (FISPQ)": "",
  "Riscos Biológicos | Agentes biológicos": "",
  "Riscos Biológicos | Medidas de controle": "",
  "EPIs e EPCs | Equipamentos de proteção": "",
  "EPIs e EPCs | Uso e conservação correta": "",
  "Comportamento Seguro | Cultura de segurança": "",
  "Comportamento Seguro | Atos e condições inseguras": "",
  "Emergências e Condutas | Planos de emergência": "",
  "Emergências e Condutas | Primeiros socorros básicos": "",
  "Avaliação Final | Revisão geral do conteúdo": "",
};

function interpretarVideo(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { provedorVideo: "YOUTUBE", videoId: yt[1], videoUrl: url };
  const vi = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vi) return { provedorVideo: "VIMEO", videoId: vi[1], videoUrl: url };
  return { provedorVideo: "URL", videoId: null, videoUrl: url };
}

// ──────────────────────── QUESTÕES ────────────────────────
// [enunciado, [4 alternativas], índice da correta (0-3), explicação, dificuldade]
// quiz  = 3 questões do quiz do módulo | banco = 2 questões extras, só para a prova final
const F = "FACIL", M = "MEDIO", D = "DIFICIL";

const CONTEUDO = {
  "Integração de SST": {
    quiz: [
      ["Qual é a principal responsabilidade do trabalhador em relação à sua segurança?",
        ["Cumprir as orientações de segurança e usar corretamente os EPIs fornecidos", "Deixar a segurança apenas para o técnico de segurança", "Usar o EPI somente quando houver fiscalização", "Escolher quais normas da empresa vai seguir"],
        0, "O trabalhador deve cumprir as normas e ordens de serviço e usar os EPIs corretamente.", F],
      ["Diante de uma situação de risco grave e iminente à sua vida ou saúde, o que o trabalhador deve fazer?",
        ["Continuar a tarefa para não atrasar a produção", "Interromper a atividade e comunicar imediatamente o superior", "Esperar o fim do turno para relatar", "Resolver o problema sozinho, sem avisar ninguém"],
        1, "Há direito de interromper a atividade em risco grave e iminente, comunicando de imediato o superior.", M],
      ["Para que serve o treinamento de integração em SST?",
        ["Apenas cumprir uma formalidade burocrática", "Apresentar os riscos do ambiente e as regras para trabalhar com segurança", "Substituir o uso de EPIs", "Dispensar a supervisão no trabalho"],
        1, "A integração apresenta riscos, regras e condutas antes do início das atividades.", F],
    ],
    banco: [
      ["Quem deve fornecer gratuitamente os EPIs necessários ao trabalhador?",
        ["O próprio trabalhador", "O empregador", "O sindicato", "A CIPA, com recursos próprios"],
        1, "O empregador deve fornecer o EPI adequado ao risco, gratuitamente e em perfeito estado.", F],
      ["Ao sofrer ou presenciar um acidente de trabalho, qual deve ser a primeira atitude em relação à comunicação?",
        ["Avisar somente no dia seguinte", "Comunicar imediatamente o superior ou a área de segurança", "Não comunicar se a lesão for pequena", "Comunicar apenas se houver testemunhas"],
        1, "Todo acidente, mesmo sem lesão aparente, deve ser comunicado imediatamente.", F],
    ],
  },

  "Conceitos de Segurança": {
    quiz: [
      ["Qual das alternativas descreve melhor um acidente de trabalho?",
        ["Qualquer evento fora do horário de expediente", "Evento ocorrido pelo exercício do trabalho a serviço da empresa que cause lesão ou perturbação funcional", "Somente acidentes que causam a morte", "Apenas acidentes dentro do prédio da empresa"],
        1, "Acidente de trabalho decorre do exercício do trabalho a serviço da empresa e provoca lesão, doença ou morte.", M],
      ["Um piso molhado e sem sinalização é um exemplo de:",
        ["Ato inseguro", "Condição insegura", "Equipamento de proteção", "Treinamento obrigatório"],
        1, "Condição insegura é a falha no ambiente ou equipamento que pode provocar acidente.", F],
      ["Qual Norma Regulamentadora trata da CIPA (Comissão Interna de Prevenção de Acidentes)?",
        ["NR-5", "NR-6", "NR-10", "NR-35"],
        0, "A NR-5 dispõe sobre a CIPA.", M],
    ],
    banco: [
      ["Qual Norma Regulamentadora trata dos Equipamentos de Proteção Individual?",
        ["NR-5", "NR-6", "NR-7", "NR-12"],
        1, "A NR-6 regulamenta os EPIs.", M],
      ["O que significa a sigla SST?",
        ["Serviço de Segurança Total", "Segurança e Saúde no Trabalho", "Sistema de Saúde e Transporte", "Setor de Segurança Técnica"],
        1, "SST é Segurança e Saúde no Trabalho.", F],
    ],
  },

  "Identificação de Riscos": {
    quiz: [
      ["Quais são os cinco grupos de riscos ocupacionais do mapa de riscos?",
        ["Físicos, químicos, biológicos, ergonômicos e de acidentes", "Leves, médios, graves, críticos e fatais", "Internos, externos, naturais, sociais e técnicos", "Elétricos, mecânicos, térmicos, sonoros e visuais"],
        0, "O mapa de riscos classifica em físicos, químicos, biológicos, ergonômicos e de acidentes.", M],
      ["No mapa de riscos, qual é a cor associada aos riscos químicos?",
        ["Verde", "Vermelho", "Marrom", "Azul"],
        1, "Físicos: verde; químicos: vermelho; biológicos: marrom; ergonômicos: amarelo; acidentes: azul.", M],
      ["Qual é a diferença entre perigo e risco?",
        ["Não há diferença", "Perigo é a fonte com potencial de causar dano; risco é a combinação da probabilidade e da gravidade desse dano", "Perigo só existe em fábricas; risco só em escritórios", "Risco é sempre maior que o perigo"],
        1, "Perigo é a fonte; risco considera probabilidade e severidade.", D],
    ],
    banco: [
      ["Levantamento de peso e postura inadequada são exemplos de qual tipo de risco?",
        ["Químico", "Biológico", "Ergonômico", "Físico"],
        2, "Postura, esforço e levantamento de carga são riscos ergonômicos.", F],
      ["Uma máquina sem proteção nas partes móveis representa principalmente um risco:",
        ["De acidentes (mecânico)", "Biológico", "Químico", "Ergonômico"],
        0, "Partes móveis desprotegidas são risco de acidente.", F],
    ],
  },

  "Riscos Físicos": {
    quiz: [
      ["Qual alternativa é um exemplo de agente de risco físico?",
        ["Poeira de sílica", "Ruído", "Bactérias", "Vírus"],
        1, "Ruído, calor, vibração e radiações são agentes físicos.", F],
      ["Qual EPI é indicado para proteção contra ruído excessivo?",
        ["Luvas de raspa", "Óculos de proteção", "Protetor auricular", "Máscara PFF2"],
        2, "O protetor auricular reduz a exposição ao ruído.", F],
      ["Qual medida é importante para quem trabalha exposto a calor excessivo?",
        ["Evitar beber água", "Hidratar-se com frequência e fazer pausas em local fresco", "Aumentar o ritmo de trabalho", "Usar roupas pesadas"],
        1, "Hidratação e pausas ajudam a prevenir a exaustão e o golpe de calor.", M],
    ],
    banco: [
      ["A radiação ionizante, usada por exemplo em aparelhos de raio-X, é classificada como risco:",
        ["Físico", "Químico", "Biológico", "Ergonômico"],
        0, "Radiações são agentes físicos.", M],
      ["Qual a cor do grupo de riscos físicos no mapa de riscos?",
        ["Vermelho", "Verde", "Amarelo", "Azul"],
        1, "Riscos físicos são representados na cor verde.", M],
    ],
  },

  "Riscos Químicos": {
    quiz: [
      ["Por quais vias os agentes químicos podem entrar no organismo?",
        ["Apenas pela boca", "Respiratória, cutânea (pele) e digestiva", "Somente pelos olhos", "Somente pela pele"],
        1, "As principais vias são inalação, contato com a pele e ingestão.", M],
      ["A FISPQ (atualmente chamada de FDS) serve para:",
        ["Controlar o ponto dos funcionários", "Informar propriedades, riscos e cuidados no uso de um produto químico", "Registrar acidentes de trânsito", "Comprovar a compra do produto"],
        1, "A Ficha de Dados de Segurança traz os perigos, o manuseio seguro e as medidas de emergência.", M],
      ["Qual é a conduta correta quanto à embalagem de produtos químicos?",
        ["Reaproveitar garrafas de refrigerante para guardá-los", "Manter o produto na embalagem original ou em recipiente identificado", "Retirar o rótulo para não manchar", "Misturar produtos diferentes no mesmo recipiente"],
        1, "Nunca armazene químicos em embalagens de alimentos, nem sem identificação.", F],
    ],
    banco: [
      ["Poeiras, fumos, névoas, gases e vapores são exemplos de agentes de risco:",
        ["Químico", "Biológico", "Ergonômico", "Mecânico"],
        0, "São formas de apresentação de agentes químicos.", F],
      ["Os pictogramas presentes no rótulo de um produto químico servem para:",
        ["Enfeitar a embalagem", "Indicar visualmente os perigos do produto", "Informar o preço", "Mostrar o fabricante"],
        1, "Os pictogramas do sistema GHS indicam os perigos do produto.", M],
    ],
  },

  "Riscos Biológicos": {
    quiz: [
      ["Qual é um exemplo de agente de risco biológico?",
        ["Ruído", "Bactérias e vírus", "Poeira de cimento", "Calor"],
        1, "Bactérias, vírus, fungos e parasitas são agentes biológicos.", F],
      ["Qual é uma das medidas mais simples e eficazes para reduzir a contaminação por agentes biológicos?",
        ["Lavar bem as mãos", "Trabalhar sem luvas", "Dividir o mesmo copo com colegas", "Evitar qualquer higiene"],
        0, "A higienização das mãos é uma das principais medidas de controle.", F],
      ["Onde devem ser descartados materiais perfurocortantes, como agulhas?",
        ["No lixo comum", "Em coletor rígido próprio para perfurocortantes", "No banheiro", "Em saco plástico comum"],
        1, "Perfurocortantes vão em coletor rígido, identificado e resistente a perfuração.", M],
    ],
    banco: [
      ["Qual a cor do grupo de riscos biológicos no mapa de riscos?",
        ["Verde", "Vermelho", "Marrom", "Azul"],
        2, "Riscos biológicos são representados na cor marrom.", M],
      ["A vacinação dos trabalhadores expostos é uma medida:",
        ["De controle e prevenção contra agentes biológicos", "Sem relação com a saúde ocupacional", "Proibida em ambiente de trabalho", "Apenas estética"],
        0, "A imunização é medida importante de prevenção para riscos biológicos.", M],
    ],
  },

  "EPIs e EPCs": {
    quiz: [
      ["Qual é a diferença entre EPI e EPC?",
        ["EPI protege o trabalhador individualmente; EPC protege coletivamente", "São a mesma coisa", "EPC é de uso pessoal; EPI é de uso coletivo", "EPI só vale para escritórios"],
        0, "EPI é individual (capacete, luvas); EPC é coletivo (guarda-corpo, exaustor).", F],
      ["Para ser utilizado, todo EPI deve possuir:",
        ["Cor chamativa", "Certificado de Aprovação (CA)", "Nome do trabalhador gravado", "Embalagem original lacrada para sempre"],
        1, "O EPI precisa ter CA válido, emitido pelo órgão competente.", M],
      ["Se o seu EPI estiver danificado ou desgastado, você deve:",
        ["Continuar usando até acabar", "Comunicar o responsável e solicitar a substituição", "Consertar por conta própria com fita adesiva", "Emprestar para um colega"],
        1, "EPI danificado não protege; deve ser trocado e a situação comunicada.", F],
    ],
    banco: [
      ["Qual é a ordem de prioridade das medidas de proteção?",
        ["EPI antes de qualquer medida coletiva", "Medidas coletivas primeiro, e EPI quando elas não forem suficientes", "Nenhuma ordem", "Somente treinamento"],
        1, "Prioriza-se eliminar o risco e adotar proteção coletiva; o EPI complementa.", D],
      ["O capacete de segurança protege principalmente:",
        ["As mãos", "A cabeça", "Os pés", "Os ouvidos"],
        1, "O capacete protege a cabeça contra impactos e queda de objetos.", F],
    ],
  },

  "Comportamento Seguro": {
    quiz: [
      ["O que significa ter uma cultura de segurança na empresa?",
        ["Todos, da liderança aos colaboradores, valorizam e praticam a segurança no dia a dia", "Existir apenas um cartaz na parede", "Só o técnico de segurança se preocupa", "Seguir as regras apenas quando há fiscalização"],
        0, "Cultura de segurança é o compromisso coletivo e contínuo com a prevenção.", M],
      ["Qual é um exemplo de ato inseguro?",
        ["Usar o EPI corretamente", "Remover a proteção de uma máquina para trabalhar mais rápido", "Sinalizar uma área em manutenção", "Participar do treinamento"],
        1, "Ato inseguro é a falha de comportamento que expõe a pessoa ao risco.", F],
      ["Ao ver um colega executando uma tarefa de forma insegura, o correto é:",
        ["Ignorar, pois não é problema seu", "Alertá-lo de forma respeitosa e, se necessário, comunicar o responsável", "Rir da situação", "Esperar que algo aconteça"],
        1, "Cuidar uns dos outros faz parte da cultura de segurança.", F],
    ],
    banco: [
      ["O que é um DDS (Diálogo Diário de Segurança)?",
        ["Uma conversa curta, antes do trabalho, sobre riscos e cuidados da atividade", "Um relatório financeiro", "Uma pausa para almoço", "Uma prova obrigatória"],
        0, "O DDS é uma breve reunião para reforçar a prevenção.", F],
      ["Por que é importante relatar os quase acidentes?",
        ["Para punir quem errou", "Porque revelam falhas que podem ser corrigidas antes de causar lesões", "Porque não têm importância", "Apenas para preencher formulários"],
        1, "Quase acidentes são avisos: tratá-los evita acidentes reais.", M],
    ],
  },

  "Emergências e Condutas": {
    quiz: [
      ["Ao ouvir o alarme de incêndio, qual a conduta correta?",
        ["Correr para o elevador", "Manter a calma, seguir a rota de fuga sinalizada e ir ao ponto de encontro", "Voltar para pegar objetos pessoais", "Ficar no local aguardando"],
        1, "Siga a rota de fuga e dirija-se ao ponto de encontro sem correr nem voltar.", F],
      ["Por que não se deve usar o elevador em caso de incêndio?",
        ["Porque é mais lento que a escada", "Porque pode parar, faltar energia e ficar tomado pela fumaça", "Porque é proibido por lei em qualquer situação", "Porque só funciona com chave"],
        1, "O elevador pode falhar e se tornar uma armadilha; use as escadas de emergência.", M],
      ["Qual é o número do SAMU para chamar socorro médico de urgência?",
        ["190", "192", "193", "199"],
        1, "SAMU: 192. Bombeiros: 193. Polícia: 190.", F],
    ],
    banco: [
      ["Em um acidente com suspeita de lesão na coluna, o correto é:",
        ["Mover a vítima rapidamente", "Não movimentar a vítima e acionar o socorro especializado", "Sentá-la imediatamente", "Dar água para ela"],
        1, "Mover a vítima pode agravar a lesão; acione o socorro e aguarde orientação.", M],
      ["O extintor de classe A é indicado para incêndios em:",
        ["Líquidos inflamáveis", "Materiais sólidos comuns, como madeira e papel", "Equipamentos elétricos energizados", "Metais combustíveis"],
        1, "Classe A: sólidos comuns; B: líquidos inflamáveis; C: elétricos energizados.", D],
    ],
  },
};

// ──────────────────────── EXECUÇÃO ────────────────────────
async function carregarVideos(curso) {
  let atualizadas = 0;
  const modulos = await prisma.modulo.findMany({ where: { cursoId: curso.id }, include: { aulas: true } });
  for (const [chave, url] of Object.entries(VIDEOS)) {
    if (!url.trim()) continue;
    const [nomeModulo, nomeAula] = chave.split(" | ");
    const aula = modulos.find((m) => m.nome === nomeModulo)?.aulas.find((a) => a.nome === nomeAula);
    if (!aula) { console.warn(`⚠ Aula não encontrada: ${chave}`); continue; }
    await prisma.aula.update({ where: { id: aula.id }, data: { tipo: "VIDEO", ...interpretarVideo(url.trim()) } });
    atualizadas++;
  }
  console.log(`✔ ${atualizadas} vídeo(s) atualizado(s).`);
}

async function carregarQuestoes(curso) {
  const existentes = await prisma.questao.count({ where: { cursoId: curso.id } });
  if (existentes > 0) {
    console.log(`✔ O curso já tem ${existentes} questão(ões). Nada foi duplicado.`);
    return;
  }
  const modulos = await prisma.modulo.findMany({ where: { cursoId: curso.id } });
  let total = 0;
  // gira as alternativas para que a resposta correta não fique sempre na mesma posição
  const girar = (alternativas, correta, n) => {
    const r = n % 4;
    return [alternativas.map((_, i) => alternativas[(i - r + 4) % 4]), (correta + r) % 4];
  };
  for (const [nomeModulo, { quiz, banco }] of Object.entries(CONTEUDO)) {
    const modulo = modulos.find((m) => m.nome === nomeModulo);
    if (!modulo) { console.warn(`⚠ Módulo não encontrado: ${nomeModulo}`); continue; }
    const grupos = [[quiz, modulo.id], [banco, null]];
    for (const [lista, moduloId] of grupos) {
      for (const [enunciado, alts, correta, explicacao, dificuldade] of lista) {
        const [alternativas, respostaCorretaIndex] = girar(alts, correta, total);
        await prisma.questao.create({
          data: { cursoId: curso.id, moduloId, enunciado, alternativas, respostaCorretaIndex, explicacao, dificuldade },
        });
        total++;
      }
    }
  }
  console.log(`✔ ${total} questões criadas (quiz por módulo + banco da prova final).`);
}

async function main() {
  const curso = await prisma.curso.findFirst({ where: { nome: NOME_CURSO } });
  if (!curso) throw new Error(`Curso "${NOME_CURSO}" não encontrado. Rode antes: npm run seed`);

  if (process.argv.includes("--videos")) await carregarVideos(curso);
  else await carregarQuestoes(curso);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
