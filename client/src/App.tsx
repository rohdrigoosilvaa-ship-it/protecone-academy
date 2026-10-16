import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireAdmin } from "./components/layout/RouteGuards";
import { AlunoLayout } from "./components/layout/AlunoLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

import { LoginPage } from "./pages/public/LoginPage";
import { ValidarCertificadoPage } from "./pages/public/ValidarCertificadoPage";

import { DashboardPage } from "./pages/aluno/DashboardPage";
import { MeusCursosPage } from "./pages/aluno/MeusCursosPage";
import { CursoPage } from "./pages/aluno/CursoPage";
import { AulaPage } from "./pages/aluno/AulaPage";
import { QuizPage } from "./pages/aluno/QuizPage";
import { ProvaFinalPage } from "./pages/aluno/ProvaFinalPage";
import { CertificadosPage } from "./pages/aluno/CertificadosPage";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { CursosListPage } from "./pages/admin/CursosListPage";
import { CursoFormPage } from "./pages/admin/CursoFormPage";
import { QuestoesIndexPage } from "./pages/admin/QuestoesIndexPage";
import { AlunosPage } from "./pages/admin/AlunosPage";
import { AlunoDetalhePage } from "./pages/admin/AlunoDetalhePage";
import { CertificadosAdminPage } from "./pages/admin/CertificadosAdminPage";
import { RelatoriosPage } from "./pages/admin/RelatoriosPage";
import { ConfiguracoesPage } from "./pages/admin/ConfiguracoesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/certificados/validar" element={<ValidarCertificadoPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AlunoLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/treinamentos" element={<MeusCursosPage />} />
          <Route path="/cursos/:id" element={<CursoPage />} />
          <Route path="/cursos/:id/aulas/:aulaId" element={<AulaPage />} />
          <Route path="/cursos/:id/modulos/:moduloId/quiz" element={<QuizPage />} />
          <Route path="/cursos/:id/prova-final" element={<ProvaFinalPage />} />
          <Route path="/certificados" element={<CertificadosPage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/cursos" element={<CursosListPage />} />
            <Route path="/admin/cursos/:id" element={<CursoFormPage />} />
            <Route path="/admin/questoes" element={<QuestoesIndexPage />} />
            <Route path="/admin/alunos" element={<AlunosPage />} />
            <Route path="/admin/alunos/:usuarioId" element={<AlunoDetalhePage />} />
            <Route path="/admin/certificados" element={<CertificadosAdminPage />} />
            <Route path="/admin/relatorios" element={<RelatoriosPage />} />
            <Route path="/admin/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
