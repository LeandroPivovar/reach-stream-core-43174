import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoNucleocrm from '@/assets/logo-nucleocrm.png';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  BarChart3,
  MessageSquare,
  Users,
  Plug,
  Target,
  Puzzle,
  CreditCard,
  Share2,
  User,
  LogOut,
  DollarSign,
  Package,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Visão Geral', href: '/visao-geral', icon: BarChart3 },
  { title: 'Campanhas', href: '/campanhas', icon: MessageSquare },
  { title: 'Rastreamento', href: '/rastreamento', icon: Target },
  { title: 'Vendas', href: '/vendas', icon: DollarSign },
  { title: 'Contatos', href: '/contatos', icon: Users },
  { title: 'Produtos', href: '/produtos', icon: Package },
  { title: 'Conexões', href: '/conexoes', icon: Plug },
  { title: 'Integrações', href: '/integracoes', icon: Puzzle },
  { title: 'Assinaturas', href: '/assinaturas', icon: CreditCard },
  { title: 'Indicações', href: '/indicacoes', icon: Share2 },
  { title: 'Minha Conta', href: '/conta', icon: User },
  { title: 'Administração', href: '/admin', icon: ShieldCheck },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen, isCollapsed, toggleOpen } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out border-r border-white/10",
        isCollapsed ? "w-20" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )} 
      style={{ backgroundColor: 'hsl(247 90% 65%)' }}
    >
      {/* Logo & Mobile Close */}
      <div className={cn(
        "p-4 md:p-6 border-b border-white/20 flex items-center justify-between min-h-[73px]",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center overflow-hidden transition-all duration-300">
            <img
              src={logoNucleocrm}
              alt="Núcleo CRM"
              className="h-5 w-auto"
            />
          </div>
        )}
        
        {/* Mobile Close Button - Always show on mobile if open, regardless of collapse state */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-white hover:bg-white/10 shrink-0"
          onClick={toggleOpen}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems
          .filter(item => {
            if (item.href === '/admin') {
              return user?.role === 'admin';
            }
            return true;
          })
          .map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center" : "space-x-3",
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-white/20">
        <div className={cn("flex items-center px-3 py-2", isCollapsed ? "justify-center" : "space-x-3")}>
          <div className="w-8 h-8 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Usuário'}
              </p>
              <p className="text-xs text-white/70 truncate">
                {user?.email || 'usuario@email.com'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center mt-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
            isCollapsed ? "justify-center" : "space-x-3"
          )}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}