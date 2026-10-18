import { criarApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const app = criarApp();

app.listen(env.port, () => {
  console.log(`ProtecHub — servidor rodando na porta ${env.port}`);
});
