import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoNucleocrm from '@/assets/logo-nucleocrm.png';
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
} from 'lucide-react';

const menuItems = [
  { title: 'Visão Geral', href: '/', icon: BarChart3 },
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
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth/login');
  };

  return (
    <div className="w-64 flex flex-col h-screen fixed left-0 top-0 z-50" style={{ backgroundColor: 'hsl(247 90% 65%)' }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-center">
          <img 
            src={logoNucleocrm} 
            alt="Núcleo CRM" 
            className="h-6 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Usuário
            </p>
            <p className="text-xs text-white/70 truncate">
              usuario@email.com
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}