import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
    const { isOpen, isCollapsed, closeMobile } = useSidebar();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
            <AdminSidebar />

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[35] lg:hidden animate-in fade-in duration-300" 
                    onClick={closeMobile}
                />
            )}

            <div 
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out overflow-hidden",
                    isCollapsed ? "lg:ml-20" : "lg:ml-64"
                )}
            >
                <Header
                    title={title}
                    subtitle={subtitle}
                    actions={actions}
                />

                <main className="flex-1 p-4 md:p-6 overflow-auto custom-scrollbar bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <div className="animate-fade-in max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
