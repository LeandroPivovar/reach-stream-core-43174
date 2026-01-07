import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResendVerification from "./pages/auth/ResendVerification";
import Campanhas from "./pages/Campanhas";
import Vendas from "./pages/Vendas";
import Contatos from "./pages/Contatos";
import Conexoes from "./pages/Conexoes";
import Rastreamento from "./pages/Rastreamento";
import Integracoes from "./pages/Integracoes";
import Assinaturas from "./pages/Assinaturas";
import Indicacoes from "./pages/Indicacoes";
import MinhaConta from "./pages/MinhaConta";
import Produtos from "./pages/Produtos";
import NotFound from "./pages/NotFound";
import ShopifyCallback from "./pages/integrations/ShopifyCallback";
import NuvemshopCallback from "./pages/integrations/NuvemshopCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Rotas públicas (apenas para não autenticados) */}
                  <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path="/auth/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                  <Route path="/auth/resend-verification" element={<PublicRoute><ResendVerification /></PublicRoute>} />
            
            {/* Rotas protegidas (apenas para autenticados) */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/campanhas" element={<ProtectedRoute><Campanhas /></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/contatos" element={<ProtectedRoute><Contatos /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/conexoes" element={<ProtectedRoute><Conexoes /></ProtectedRoute>} />
            <Route path="/rastreamento" element={<ProtectedRoute><Rastreamento /></ProtectedRoute>} />
            <Route path="/integracoes" element={<ProtectedRoute><Integracoes /></ProtectedRoute>} />
            <Route path="/integrations/shopify/callback" element={<ProtectedRoute><ShopifyCallback /></ProtectedRoute>} />
            <Route path="/integrations/nuvemshop/callback" element={<NuvemshopCallback />} />
            <Route path="/assinaturas" element={<ProtectedRoute><Assinaturas /></ProtectedRoute>} />
            <Route path="/indicacoes" element={<ProtectedRoute><Indicacoes /></ProtectedRoute>} />
            <Route path="/conta" element={<ProtectedRoute><MinhaConta /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
