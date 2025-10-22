import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  Tag,
  Users,
  MapPin,
  Activity,
  Download,
  FileSpreadsheet,
  CreditCard,
  Target,
  ShoppingCart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Purchase {
  id: number;
  date: string;
  value: number;
  product: string;
}

interface ContactDetail {
  paymentMethod: string;
  sourceCampaign: string;
  purchases: Purchase[];
  ltv: number;
}

export default function Contatos() {
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    group: '',
    status: 'Ativo',
    tags: [] as string[],
    state: '',
    city: ''
  });

  // Mock data for contact details with LTV information
  const contactDetails: Record<number, ContactDetail> = {
    1: {
      paymentMethod: 'Cartão de crédito',
      sourceCampaign: 'Black Friday 2025',
      purchases: [
        { id: 1, date: '2025-11-28', value: 199.00, product: 'Produto Premium' },
        { id: 2, date: '2025-12-15', value: 89.90, product: 'Produto Básico' },
      ],
      ltv: 288.90
    },
    2: {
      paymentMethod: 'PIX',
      sourceCampaign: 'Newsletter Semanal',
      purchases: [
        { id: 1, date: '2025-10-05', value: 149.00, product: 'Produto Standard' },
      ],
      ltv: 149.00
    },
    3: {
      paymentMethod: 'Boleto',
      sourceCampaign: 'Campanha Fidelidade',
      purchases: [
        { id: 1, date: '2025-09-10', value: 299.00, product: 'Kit Premium' },
        { id: 2, date: '2025-11-20', value: 189.90, product: 'Upgrade Plus' },
        { id: 3, date: '2025-12-30', value: 99.90, product: 'Add-on Extra' },
      ],
      ltv: 588.80
    }
  };

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      email: 'ana.silva@email.com',
      group: 'VIP',
      status: 'Ativo',
      tags: ['Black Friday', 'Newsletter'],
      state: 'SP',
      city: 'São Paulo',
      lastInteraction: '2024-03-20'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      phone: '(21) 88888-8888',
      email: 'carlos.santos@email.com',
      group: 'Regular',
      status: 'Inativo',
      tags: ['Promoção'],
      state: 'RJ',
      city: 'Rio de Janeiro',
      lastInteraction: '2024-03-15'
    },
    {
      id: 3,
      name: 'Mariana Costa',
      phone: '(31) 77777-7777',
      email: 'mariana.costa@email.com',
      group: 'VIP',
      status: 'Ativo',
      tags: ['Newsletter', 'Fidelidade'],
      state: 'MG',
      city: 'Belo Horizonte',
      lastInteraction: '2024-03-22'
    }
  ]);

  const [groups] = useState(['VIP', 'Regular', 'Novos', 'Inativos']);
  const [tags] = useState(['Black Friday', 'Newsletter', 'Promoção', 'Fidelidade', 'Carrinho Abandonado']);
  const [states] = useState(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE']);
  const [statuses] = useState(['Ativo', 'Inativo', 'Bloqueado', 'Aguardando']);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-500';
      case 'Inativo': return 'bg-gray-500';
      case 'Bloqueado': return 'bg-red-500';
      case 'Aguardando': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSaveContact = () => {
    const contactToAdd = {
      id: contacts.length + 1,
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      group: newContact.group,
      status: newContact.status,
      tags: newContact.tags,
      state: newContact.state,
      city: newContact.city,
      lastInteraction: new Date().toISOString().split('T')[0]
    };
    setContacts([...contacts, contactToAdd]);
    setIsNewContactOpen(false);
    setNewContact({
      name: '',
      phone: '',
      email: '',
      group: '',
      status: 'Ativo',
      tags: [],
      state: '',
      city: ''
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Grupo', 'Status', 'Etiquetas', 'Estado', 'Cidade'].join(','),
      ...contacts.map(c => [
        c.name,
        c.phone,
        c.email,
        c.group,
        c.status,
        c.tags.join(';'),
        c.state,
        c.city
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contatos.csv';
    a.click();
    setIsExportOpen(false);
  };

  const actions = (
    <>
      <HeaderActions.Filter onClick={() => console.log('Filter clicked')} />
      <HeaderActions.Export onClick={() => setIsExportOpen(true)} />
      <Button variant="outline" onClick={() => setIsImportOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Importar
      </Button>
      <HeaderActions.Add onClick={() => setIsNewContactOpen(true)}>
        Novo Contato
      </HeaderActions.Add>
    </>
  );

  return (
    <Layout 
      title="Contatos" 
      subtitle="Gerencie sua base de leads e clientes"
      actions={actions}
      showSearch
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Contatos</p>
                <p className="text-2xl font-bold text-foreground">8.247</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contatos Ativos</p>
                <p className="text-2xl font-bold text-foreground">6.834</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos (30 dias)</p>
                <p className="text-2xl font-bold text-foreground">421</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Grupos</p>
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="tags">Etiquetas</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Contato</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Grupo</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Etiquetas</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Localização</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-border last:border-0">
                        <td className="py-4 px-2">
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Último contato: {new Date(contact.lastInteraction).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div>
                            <div className="text-sm">{contact.phone}</div>
                            <div className="text-sm text-muted-foreground">{contact.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant="outline">{contact.group}</Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`}></div>
                            <span className="text-sm">{contact.status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{contact.city}, {contact.state}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedContactId(contact.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Ações do Contato</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-2">
                                  <Button 
                                    variant="ghost" 
                                    className="justify-start"
                                    onClick={() => {
                                      setSelectedContactId(contact.id);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Visualizar Perfil
                                  </Button>
                                  <Button variant="ghost" className="justify-start">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Contato
                                  </Button>
                                  <Button variant="ghost" className="justify-start text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir Contato
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Grupos de Contatos</h3>
                <Button>
                  <Tag className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card key={group} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{group}</h4>
                        <p className="text-sm text-muted-foreground">
                          1.247 contatos
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Etiquetas</h3>
                <Button>
                  <Tag className="w-4 h-4 mr-2" />
                  Nova Etiqueta
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Captação via Webhook</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input 
                    id="webhook-url"
                    value="https://api.nucleo.com/webhook/capture"
                    readOnly
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use esta URL para integrar com formulários externos
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Exemplo de Payload</h4>
                  <pre className="text-sm text-muted-foreground">
{`{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "group": "Novos",
  "tags": ["Landing Page", "Newsletter"]
}`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Novo Contato */}
      <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="group">Grupo</Label>
                <Select 
                  value={newContact.group} 
                  onValueChange={(value) => setNewContact({ ...newContact, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newContact.status} 
                  onValueChange={(value) => setNewContact({ ...newContact, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Select 
                value={newContact.tags[0] || ''} 
                onValueChange={(value) => {
                  if (!newContact.tags.includes(value)) {
                    setNewContact({ ...newContact, tags: [...newContact.tags, value] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione etiquetas" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newContact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newContact.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setNewContact({ 
                        ...newContact, 
                        tags: newContact.tags.filter(t => t !== tag) 
                      })}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Select 
                  value={newContact.state} 
                  onValueChange={(value) => setNewContact({ ...newContact, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newContact.city}
                  onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                  placeholder="Digite a cidade"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact}>
              Salvar Contato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Exportar */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Contatos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Baixe todos os seus contatos em formato CSV (planilha).
            </p>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">contatos.csv</p>
                <p className="text-sm text-muted-foreground">{contacts.length} contatos</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Planilha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Importar */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Faça upload de uma planilha CSV com seus contatos.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Arraste e solte seu arquivo aqui</p>
              <p className="text-sm text-muted-foreground mb-4">ou</p>
              <Button variant="outline">
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos aceitos: CSV (até 5MB)
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2 text-sm">Formato esperado do CSV:</p>
              <p className="text-xs text-muted-foreground font-mono">
                Nome,Telefone,Email,Grupo,Status,Etiquetas,Estado,Cidade
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancelar
            </Button>
            <Button>
              Importar Contatos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sheet Detalhes do Contato com LTV */}
      <Sheet open={selectedContactId !== null} onOpenChange={(open) => !open && setSelectedContactId(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          {selectedContactId && (
            <>
              <SheetHeader>
                <SheetTitle>Perfil Completo do Lead</SheetTitle>
                <SheetDescription>
                  {contacts.find(c => c.id === selectedContactId)?.name}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Informações Básicas */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Informações de Contato
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{contacts.find(c => c.id === selectedContactId)?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{contacts.find(c => c.id === selectedContactId)?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localização:</span>
                      <span className="font-medium">
                        {contacts.find(c => c.id === selectedContactId)?.city}, 
                        {contacts.find(c => c.id === selectedContactId)?.state}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* LTV Total */}
                {contactDetails[selectedContactId] && (
                  <>
                    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          LTV Total
                        </h3>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          R$ {contactDetails[selectedContactId].ltv.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor total gerado pelo cliente
                      </p>
                    </Card>

                    {/* Forma de Pagamento */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Forma de Pagamento
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {contactDetails[selectedContactId].paymentMethod}
                        </Badge>
                      </div>
                    </Card>

                    {/* Campanha de Origem */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Campanha de Origem
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          {contactDetails[selectedContactId].sourceCampaign}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Primeira interação com a marca
                      </p>
                    </Card>

                    {/* Histórico de Compras */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Histórico de Compras
                      </h3>
                      <div className="space-y-3">
                        {contactDetails[selectedContactId].purchases.map((purchase) => (
                          <div 
                            key={purchase.id} 
                            className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{purchase.product}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(purchase.date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="font-semibold text-sm text-primary">
                              R$ {purchase.value.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total de Compras:</span>
                          <span className="text-lg font-bold text-primary">
                            {contactDetails[selectedContactId].purchases.length}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </>
                )}

                {!contactDetails[selectedContactId] && (
                  <Card className="p-6 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma compra registrada ainda
                    </p>
                  </Card>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}