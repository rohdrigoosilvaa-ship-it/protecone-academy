// Ponto de entrada da função serverless do Vercel — todo o tráfego (/api/* e
// o app React) passa por aqui, porque o Express (server/src/app.js) já sabe
// rotear e servir o build do client. Mesmo padrão usado no Portal SSMA.
import { criarApp } from "../server/src/app.js";

const app = criarApp();

export default app;
