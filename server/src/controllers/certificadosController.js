import * as certificadosService from "../services/certificadosService.js";
import { gerarPdfCertificado } from "../services/certificadoPdfService.js";
import { assincrono } from "../utils/erros.js";

export const minhas = assincrono(async (req, res) => res.json(await certificadosService.listarMinhas(req.user.id)));

export const todas = assincrono(async (req, res) => res.json(await certificadosService.listarTodos()));

export const validar = assincrono(async (req, res) => {
  const r = await certificadosService.validarPorCodigo(req.params.codigo);
  if (!r) return res.status(404).json({ valido: false, erro: "Certificado não encontrado" });
  res.json(r);
});

export const baixarPdf = assincrono(async (req, res) => {
  const certificado = await certificadosService.obterParaEmissao(req.params.id, req.user.id, req.user.perfil);
  const pdfBytes = await gerarPdfCertificado(certificado);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificado-${certificado.codigo}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

export const reemitir = assincrono(async (req, res) => res.json(await certificadosService.reemitir(req.params.id)));
