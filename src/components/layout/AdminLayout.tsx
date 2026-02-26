import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            <AdminSidebar />

            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Header
                    title={title}
                    subtitle={subtitle}
                    actions={actions}
                />

                <main className="flex-1 p-6 overflow-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <div className="animate-fade-in max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
