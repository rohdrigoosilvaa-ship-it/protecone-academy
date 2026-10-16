import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/src/app.js -> ../../../client/dist
const clientDir = path.join(__dirname, "..", "..", "client", "dist");

export function criarApp() {
  const app = express();

  app.use(cors());
  // limite maior por causa da imagem de capa do curso, guardada como data-URI
  app.use(express.json({ limit: "6mb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api", routes);

  // build de produção do client (React) — servido pelo mesmo processo,
  // igual ao Portal SSMA (server/src/app.js de app/)
  app.use(express.static(clientDir));

  // fallback do react-router: qualquer rota que não seja /api/* cai no
  // index.html, para o roteamento do lado do cliente assumir
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(clientDir, "index.html"), (err) => {
      if (err) res.status(404).send("Build do client não encontrado. Rode `npm run build` em client/.");
    });
  });

  // tratador de erro central — services lançam ErroApi(status, mensagem).
  // erros 5xx não previstos (ex.: falha de conexão do Prisma) não devem
  // vazar detalhes internos para o cliente, só para o log do servidor.
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) {
      console.error(err);
      return res.status(status).json({ erro: "Erro interno do servidor" });
    }
    res.status(status).json({ erro: err.message || "Erro" });
  });

  return app;
}
