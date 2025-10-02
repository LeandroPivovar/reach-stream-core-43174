import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Campanhas from "./pages/Campanhas";
import Contatos from "./pages/Contatos";
import Conexoes from "./pages/Conexoes";
import Trackeamento from "./pages/Trackeamento";
import Integracoes from "./pages/Integracoes";
import Assinaturas from "./pages/Assinaturas";
import Indicacoes from "./pages/Indicacoes";
import MinhaConta from "./pages/MinhaConta";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/campanhas" element={<Campanhas />} />
          <Route path="/contatos" element={<Contatos />} />
          <Route path="/conexoes" element={<Conexoes />} />
          <Route path="/trackeamento" element={<Trackeamento />} />
          <Route path="/integracoes" element={<Integracoes />} />
          <Route path="/assinaturas" element={<Assinaturas />} />
          <Route path="/indicacoes" element={<Indicacoes />} />
          <Route path="/conta" element={<MinhaConta />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
