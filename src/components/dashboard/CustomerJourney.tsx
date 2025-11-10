import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserPlus, 
  Eye, 
  ShoppingCart, 
  CreditCard, 
  Heart,
  ArrowRight,
  Filter
} from 'lucide-react';

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  icon: React.ElementType;
  color: string;
}

export function CustomerJourney() {
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  const journeyStages: JourneyStage[] = [
    {
      id: 'leads',
      name: 'Leads',
      description: 'Novos contatos',
      count: 3847,
      percentage: 100,
      icon: UserPlus,
      color: 'bg-blue-500/20 text-blue-900 dark:text-blue-100 border-blue-500/30'
    },
    {
      id: 'engaged',
      name: 'Engajados',
      description: 'Abriram campanhas',
      count: 2621,
      percentage: 68,
      icon: Eye,
      color: 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border-purple-500/30'
    },
    {
      id: 'cart',
      name: 'Carrinho',
      description: 'Adicionaram produtos',
      count: 1247,
      percentage: 32,
      icon: ShoppingCart,
      color: 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border-orange-500/30'
    },
    {
      id: 'purchase',
      name: 'Compradores',
      description: 'Finalizaram compra',
      count: 892,
      percentage: 23,
      icon: CreditCard,
      color: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-500/30'
    },
    {
      id: 'loyal',
      name: 'Fiéis',
      description: '2+ compras',
      count: 423,
      percentage: 11,
      icon: Heart,
      color: 'bg-pink-500/20 text-pink-900 dark:text-pink-100 border-pink-500/30'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">Jornada do Cliente</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso dos seus clientes no funil
          </p>
        </div>
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-[220px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por campanha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as campanhas</SelectItem>
            <SelectItem value="black-friday">Promoção Black Friday</SelectItem>
            <SelectItem value="carrinho">Carrinho Abandonado</SelectItem>
            <SelectItem value="novos-produtos">Novos Produtos</SelectItem>
            <SelectItem value="newsletter">Newsletter Semanal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {journeyStages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="relative flex items-center">
                <Card className="p-6 flex-1">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center",
                      stage.color.replace('/20', '/30')
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{stage.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold">
                        {stage.count.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {stage.percentage}%
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                {/* Arrow between stages - centered */}
                {index < journeyStages.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center px-2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4 bg-muted/30">
          <p className="text-sm font-medium">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">23%</p>
          <p className="text-xs text-muted-foreground">Lead → Comprador</p>
        </Card>
        <Card className="p-4 bg-muted/30">
          <p className="text-sm font-medium">Taxa de Fidelização</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">47%</p>
          <p className="text-xs text-muted-foreground">Comprador → Fiel</p>
        </Card>
        <Card className="p-4 bg-muted/30">
          <p className="text-sm font-medium">Abandono de Carrinho</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">28%</p>
          <p className="text-xs text-muted-foreground">Carrinho → Não comprou</p>
        </Card>
      </div>
    </div>
  );
}
