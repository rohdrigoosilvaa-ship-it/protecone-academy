export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// wrapper para não repetir try/catch em cada controller
export function assincrono(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
