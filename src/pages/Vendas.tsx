import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Vendas() {
  const [period, setPeriod] = useState('15');

  // Dados mock - em produção viriam de uma API
  const salesData = {
    '7': {
      faturamento: 45800,
      vendas: 127,
      ticketMedio: 360.63,
      trends: {
        faturamento: 15.3,
        vendas: 12.8,
        ticketMedio: 2.2
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 18500, vendas: 52 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 12300, vendas: 38 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 8900, vendas: 24 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 6100, vendas: 13 }
      ]
    },
    '15': {
      faturamento: 98700,
      vendas: 284,
      ticketMedio: 347.54,
      trends: {
        faturamento: 22.4,
        vendas: 18.6,
        ticketMedio: 3.2
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 38200, vendas: 112 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 26500, vendas: 81 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 18900, vendas: 54 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 15100, vendas: 37 }
      ]
    },
    '30': {
      faturamento: 187500,
      vendas: 542,
      ticketMedio: 345.94,
      trends: {
        faturamento: 18.7,
        vendas: 15.2,
        ticketMedio: 3.0
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 72400, vendas: 218 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 51200, vendas: 156 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 38700, vendas: 108 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 25200, vendas: 60 }
      ]
    }
  };

  const currentData = salesData[period as keyof typeof salesData];

  const stats = [
    {
      title: 'Faturamento Total',
      value: `R$ ${currentData.faturamento.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      trend: { value: currentData.trends.faturamento, isPositive: true },
      description: `Últimos ${period} dias`
    },
    {
      title: 'Vendas Realizadas',
      value: currentData.vendas.toString(),
      icon: ShoppingCart,
      trend: { value: currentData.trends.vendas, isPositive: true },
      description: 'Total de transações'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${currentData.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: { value: currentData.trends.ticketMedio, isPositive: true },
      description: 'Valor médio por venda'
    }
  ];

  const getChannelColor = (canal: string) => {
    switch (canal) {
      case 'WhatsApp':
        return 'bg-green-500';
      case 'E-mail':
        return 'bg-blue-500';
      case 'SMS':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout 
      title="Vendas" 
      subtitle="Acompanhe o faturamento das suas campanhas"
      actions={
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Sales by Campaign */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendas por Campanha</CardTitle>
              <Badge variant="outline">
                Comparado aos {period} dias anteriores
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Campanha</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Canal</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Vendas</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Faturamento</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.campanhas.map((campanha, index) => {
                    const ticketMedio = campanha.faturamento / campanha.vendas;
                    return (
                      <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2">
                          <div className="font-medium">{campanha.nome}</div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getChannelColor(campanha.canal)}`}></div>
                            <span className="text-sm">{campanha.canal}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right font-medium">
                          {campanha.vendas}
                        </td>
                        <td className="py-4 px-2 text-right font-semibold text-success">
                          R$ {campanha.faturamento.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-2 text-right text-muted-foreground">
                          R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-border">
                  <tr className="font-semibold">
                    <td className="py-4 px-2" colSpan={2}>Total</td>
                    <td className="py-4 px-2 text-right">{currentData.vendas}</td>
                    <td className="py-4 px-2 text-right text-success">
                      R$ {currentData.faturamento.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">
                      R$ {currentData.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['WhatsApp', 'E-mail', 'SMS'].map((canal) => {
                const campanhasCanal = currentData.campanhas.filter(c => c.canal === canal);
                const totalFaturamento = campanhasCanal.reduce((acc, c) => acc + c.faturamento, 0);
                const totalVendas = campanhasCanal.reduce((acc, c) => acc + c.vendas, 0);
                const percentual = (totalFaturamento / currentData.faturamento) * 100;
                
                return (
                  <div key={canal} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getChannelColor(canal)}`}></div>
                        <span className="font-medium">{canal}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          R$ {totalFaturamento.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {totalVendas} vendas ({percentual.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getChannelColor(canal)}`}
                        style={{ width: `${percentual}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
