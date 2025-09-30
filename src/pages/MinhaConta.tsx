import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Lock,
  CreditCard,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Calendar
} from 'lucide-react';

export default function MinhaConta() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  
  const [profileData, setProfileData] = useState({
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    billing: true,
    security: true,
    marketing: false
  });

  const transactions = [
    {
      id: 1,
      date: '2024-03-22',
      description: 'Plano Pro - Março/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'Cartão ****1234'
    },
    {
      id: 2,
      date: '2024-02-22',
      description: 'Plano Pro - Fevereiro/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'PIX'
    },
    {
      id: 3,
      date: '2024-01-22',
      description: 'Plano Pro - Janeiro/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'Cartão ****1234'
    }
  ];

  const handleProfileSave = () => {
    console.log('Saving profile:', profileData);
    // Handle profile save
  };

  const handlePasswordChange = () => {
    console.log('Changing password');
    // Handle password change
  };

  const handleNotificationsSave = () => {
    console.log('Saving notifications:', notifications);
    // Handle notifications save
  };

  return (
    <Layout 
      title="Minha Conta" 
      subtitle="Gerencie suas informações pessoais e configurações"
    >
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="billing">Pagamentos</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  <Badge variant="default" className="mt-1">
                    Plano Pro
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        firstName: e.target.value 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        lastName: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      email: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      phone: e.target.value 
                    }))}
                  />
                </div>

                <Button onClick={handleProfileSave} className="w-full md:w-auto">
                  Salvar Alterações
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              {/* Change Password */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Alterar Senha
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          currentPassword: e.target.value 
                        }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        newPassword: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                    />
                  </div>

                  <Button onClick={handlePasswordChange}>
                    Alterar Senha
                  </Button>
                </div>
              </Card>

              {/* Two Factor Authentication */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Autenticação de Dois Fatores</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-sm">2FA Ativo</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Códigos de verificação serão enviados para seu e-mail
                    </p>
                    <Button variant="outline" size="sm">
                      Reconfigurar 2FA
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Plano Atual</h3>
                      <p className="text-sm text-muted-foreground">
                        Plano Pro - R$ 97,00/mês
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Próxima Cobrança</span>
                    </div>
                    <p className="text-lg font-semibold">22 de Abril, 2024</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      Alterar Plano
                    </Button>
                    <Button variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Payment History */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Histórico de Pagamentos</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Descrição</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Método</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border last:border-0">
                          <td className="py-4 px-2">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 px-2">
                            <div className="font-medium">{transaction.description}</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{transaction.method}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="default">
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-right font-medium">
                            {transaction.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Preferências de Notificação
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações de Campanhas</p>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações sobre o status das suas campanhas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.campaignUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, campaignUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Faturamento</p>
                    <p className="text-sm text-muted-foreground">
                      Avisos sobre cobranças e faturas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.billing}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, billing: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Segurança</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas de segurança e tentativas de acesso
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, security: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing</p>
                    <p className="text-sm text-muted-foreground">
                      Novidades, recursos e dicas sobre o Núcleo
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>

                <Button onClick={handleNotificationsSave}>
                  Salvar Preferências
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}