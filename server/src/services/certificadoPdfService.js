import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { env } from "../config/env.js";

const VERDE = rgb(0 / 255, 102 / 255, 61 / 255); // --color-institutional
const VERDE_CLARO = rgb(0 / 255, 153 / 255, 76 / 255); // --color-green
const CINZA = rgb(0.3, 0.3, 0.3);

// logo da marca — vem do build do cliente (client/dist) ou, em dev, de client/public
async function carregarLogo() {
  const aqui = path.dirname(fileURLToPath(import.meta.url));
  const candidatos = [
    path.resolve(aqui, "../../../client/dist/logo/protechub.png"),
    path.resolve(aqui, "../../../client/public/logo/protechub.png"),
    path.resolve(process.cwd(), "client/dist/logo/protechub.png"),
  ];
  for (const caminho of candidatos) {
    try { return await readFile(caminho); } catch { /* tenta o próximo */ }
  }
  return null;
}

export async function gerarPdfCertificado(certificado) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 paisagem
  const { width, height } = page.getSize();

  const fontTitulo = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontTexto = await doc.embedFont(StandardFonts.Helvetica);

  // moldura
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: VERDE, borderWidth: 3 });
  page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: VERDE });
  page.drawRectangle({ x: 0, y: 0, width, height: 14, color: VERDE });

  const centro = (texto, tamanho, font, y, cor = CINZA) => {
    const w = font.widthOfTextAtSize(texto, tamanho);
    page.drawText(texto, { x: (width - w) / 2, y, size: tamanho, font, color: cor });
  };

  const logoBytes = await carregarLogo();
  if (logoBytes) {
    const logo = await doc.embedPng(logoBytes);
    const altura = 72;
    const largura = (logo.width / logo.height) * altura;
    page.drawImage(logo, { x: (width - largura) / 2, y: height - 40 - altura, width: largura, height: altura });
  } else {
    centro("PROTECHUB", 20, fontTitulo, height - 90, VERDE);
  }
  centro("CERTIFICADO DE CONCLUSÃO", 14, fontTexto, height - 132, CINZA);

  centro("Certificamos que", 13, fontTexto, height - 190);
  centro(certificado.usuario.nome, 28, fontTitulo, height - 230, VERDE_CLARO);
  centro("concluiu com aproveitamento o treinamento", 13, fontTexto, height - 262);
  centro(certificado.curso.nome, 20, fontTitulo, height - 296);

  const dataStr = new Date(certificado.emitidoEm).toLocaleDateString("pt-BR");
  centro(`Carga horária: ${certificado.cargaHoraria}   ·   Data de conclusão: ${dataStr}`, 12, fontTexto, height - 340);

  centro(`Código de validação: ${certificado.codigo}`, 11, fontTexto, 90, CINZA);

  const urlValidacao = `${env.appUrl}/certificados/validar?codigo=${encodeURIComponent(certificado.codigo)}`;
  const qrDataUrl = await QRCode.toDataURL(urlValidacao, { margin: 0, width: 200 });
  const qrPng = await doc.embedPng(qrDataUrl);
  page.drawImage(qrPng, { x: width - 150, y: 40, width: 90, height: 90 });

  return doc.save();
}
