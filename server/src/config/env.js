import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3002,
  jwtSecret: process.env.JWT_SECRET || "protecseg-academy-dev-secret",
  adminEmail: process.env.ADMIN_EMAIL || "admin@protecseg.com.br",
  adminPass: process.env.ADMIN_PASS || "admin123",
  appUrl: process.env.APP_URL || "http://localhost:5174",
};
