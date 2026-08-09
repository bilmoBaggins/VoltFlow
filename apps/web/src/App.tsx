import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { AiAdvisorPage } from "./pages/AiAdvisorPage";
import { LoginPage } from "./pages/LoginPage";
import { ReimbursementsPage } from "./pages/ReimbursementsPage";
import { SessionsPage } from "./pages/SessionsPage";
import { VehiclePage } from "./pages/VehiclePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="vehicle/:id" element={<VehiclePage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="reimbursements" element={<ReimbursementsPage />} />
          <Route path="ai" element={<AiAdvisorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
