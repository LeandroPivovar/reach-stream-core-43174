import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export function Layout({ children, title, subtitle, actions, showSearch, onSearchChange, searchValue }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header 
          title={title} 
          subtitle={subtitle} 
          actions={actions} 
          showSearch={showSearch}
          onSearchChange={onSearchChange}
          searchValue={searchValue}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}