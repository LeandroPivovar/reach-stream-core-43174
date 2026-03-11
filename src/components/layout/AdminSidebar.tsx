import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoNucleocrm from '@/assets/logo-nucleocrm.png';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Tags,
    Terminal,
    Settings,
    LogOut,
    ArrowLeft,
    ShieldCheck,
    Bell,
    Filter
} from 'lucide-react';

const adminMenuItems = [
    { title: 'Dashboard Admin', href: '/admin', icon: LayoutDashboard },
    { title: 'Categorias', href: '/admin/categories', icon: Tags },
    { title: 'Usuários', href: '/admin/users', icon: Users },
    { title: 'Webhook Logs', href: '/admin/webhooks', icon: Terminal },
    { title: 'Segmentações', href: '/admin/segmentations', icon: Filter },
    { title: 'Notificações', href: '/admin/notifications', icon: Bell },
    { title: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="w-64 flex flex-col h-screen fixed left-0 top-0 z-50 bg-slate-900 border-r border-slate-800">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex flex-col items-center justify-center gap-2">
                    <img
                        src={logoNucleocrm}
                        alt="Núcleo CRM"
                        className="h-5 w-auto brightness-0 invert"
                    />
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Painel Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Admin Menu Footer */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar ao Sistema</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
}
