import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Impersonate from "./pages/auth/Impersonate";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResendVerification from "./pages/auth/ResendVerification";
import Campanhas from "./pages/Campanhas";
import Vendas from "./pages/Vendas";
import Contatos from "./pages/Contatos";
import Conexoes from "./pages/Conexoes";
import Rastreamento from "./pages/Rastreamento";
import PixelGuide from "./pages/PixelGuide";
import Integracoes from "./pages/Integracoes";
import Assinaturas from "./pages/Assinaturas";
import Indicacoes from "./pages/Indicacoes";
import MinhaConta from "./pages/MinhaConta";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Suporte from "./pages/Suporte";
import NotFound from "./pages/NotFound";
import ShopifyCallback from "./pages/integrations/ShopifyCallback";
import NuvemshopCallback from "./pages/integrations/NuvemshopCallback";
import TrayCallback from "./pages/integrations/TrayCallback";
import Cupons from "./pages/Cupons";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import WebhookLogs from "./pages/admin/WebhookLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminSegmentations from "./pages/admin/AdminSegmentations";
import AdminCapacity from "./pages/admin/AdminCapacity";
import AdminEmailRequests from "./pages/admin/AdminEmailRequests";
import AdminSystemOverview from "./pages/admin/AdminSystemOverview";
import AdminLeadRequests from "./pages/admin/AdminLeadRequests";
import AdminTwilioRequests from "./pages/admin/AdminTwilioRequests";
import AdminTemplateRequests from "./pages/admin/AdminTemplateRequests";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminKnowledgeBase from "./pages/admin/AdminKnowledgeBase";
import Checkout from "./pages/Checkout";
import CancelarAssinatura from "./pages/CancelarAssinatura";
import LandingPage from "./pages/LandingPage";
import { AnalyticsTracker } from "./components/analytics/AnalyticsTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            
            {/* Rotas públicas (apenas para não autenticados) */}
            <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/impersonate" element={<PublicRoute><Impersonate /></PublicRoute>} />
            <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/auth/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
            <Route path="/auth/resend-verification" element={<PublicRoute><ResendVerification /></PublicRoute>} />

            {/* Rotas protegidas (apenas para autenticados) */}
            <Route path="/visao-geral" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/campanhas" element={<ProtectedRoute><Campanhas /></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/contatos" element={<ProtectedRoute><Contatos /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path="/conexoes" element={<ProtectedRoute><Conexoes /></ProtectedRoute>} />
            <Route path="/rastreamento" element={<ProtectedRoute><Rastreamento /></ProtectedRoute>} />
            <Route path="/rastreamento/documentacao" element={<ProtectedRoute><PixelGuide /></ProtectedRoute>} />
            <Route path="/integracoes" element={<ProtectedRoute><Integracoes /></ProtectedRoute>} />
            <Route path="/integrations/shopify/callback" element={<ProtectedRoute><ShopifyCallback /></ProtectedRoute>} />
            <Route path="/integrations/nuvemshop/callback" element={<ProtectedRoute><NuvemshopCallback /></ProtectedRoute>} />
            <Route path="/integrations/tray/callback" element={<ProtectedRoute><TrayCallback /></ProtectedRoute>} />
            <Route path="/assinaturas" element={<ProtectedRoute><Assinaturas /></ProtectedRoute>} />
            <Route path="/checkout/:planId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/cancelar-assinatura" element={<ProtectedRoute><CancelarAssinatura /></ProtectedRoute>} />
            <Route path="/indicacoes" element={<ProtectedRoute><Indicacoes /></ProtectedRoute>} />
            <Route path="/conta" element={<ProtectedRoute><MinhaConta /></ProtectedRoute>} />
            <Route path="/cupons" element={<ProtectedRoute><Cupons /></ProtectedRoute>} />
            <Route path="/suporte" element={<ProtectedRoute><Suporte /></ProtectedRoute>} />

            {/* Rotas Administrativas */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/overview" element={<ProtectedRoute><AdminSystemOverview /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/webhooks" element={<ProtectedRoute><WebhookLogs /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/plans" element={<ProtectedRoute><AdminPlans /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute><AdminFinance /></ProtectedRoute>} />
            <Route path="/admin/capacity" element={<ProtectedRoute><AdminCapacity /></ProtectedRoute>} />
            <Route path="/admin/segmentations" element={<ProtectedRoute><AdminSegmentations /></ProtectedRoute>} />
            <Route path="/admin/email-requests" element={<ProtectedRoute><AdminEmailRequests /></ProtectedRoute>} />
            <Route path="/admin/twilio-requests" element={<ProtectedRoute><AdminTwilioRequests /></ProtectedRoute>} />
            <Route path="/admin/lead-requests" element={<ProtectedRoute><AdminLeadRequests /></ProtectedRoute>} />
            <Route path="/admin/template-requests" element={<ProtectedRoute><AdminTemplateRequests /></ProtectedRoute>} />
            <Route path="/admin/campaigns" element={<ProtectedRoute><AdminCampaigns /></ProtectedRoute>} />
            <Route path="/admin/tickets" element={<ProtectedRoute><AdminTickets /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
            <Route path="/admin/knowledge-base" element={<ProtectedRoute><AdminKnowledgeBase /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
