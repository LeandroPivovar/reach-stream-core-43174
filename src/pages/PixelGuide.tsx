import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Layout } from '@/components/layout/Layout';

const CodeBlock = ({ code }: { code: string }) => {
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Código copiado!",
            description: "O snippet foi copiado para sua área de transferência.",
        });
    };

    return (
        <div className="relative mt-2 group">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const PixelGuide = () => {
    const navigate = useNavigate();

    return (
        <Layout title="Documentação Pixel">
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/rastreamento')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documentação Avançada do Pixel</h1>
                        <p className="text-muted-foreground">Guia completo para desenvolvedores e implementação técnica.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Como funciona?</CardTitle>
                        <CardDescription>
                            O Pixel do Núcleo CRM é baseado em uma função global chamada <code className="bg-muted px-1 rounded">internalPixel</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Esta função é injetada automaticamente no seu site quando você instala o snippet básico.
                            Você pode invocá-la em qualquer parte do seu código JavaScript para registrar eventos personalizados.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <h3 className="font-semibold flex items-center gap-2 mb-2">
                                    <Terminal className="h-4 w-4 text-blue-500" />
                                    Assinatura da Função
                                </h3>
                                <code className="text-sm font-mono">internalPixel(eventName, data?)</code>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <ul className="text-sm space-y-2 list-disc list-inside">
                                    <li><strong>eventName</strong>: String (Obrigatório)</li>
                                    <li><strong>data</strong>: Objeto JSON (Opcional)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Eventos de E-commerce</h2>
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">🛍️ Compra (Purchase)</CardTitle>
                                    <CardDescription>Dispare este evento na página de "Obrigado" ou após a confirmação do pagamento.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={`internalPixel('Purchase', {
  value: 299.80,
  currency: 'BRL',
  transaction_id: 'TRX-987654',
  items: [
    { sku: 'SKU-001', quantity: 2 },
    { sku: 'SKU-002', quantity: 1 }
  ],
  // Dados do Cliente (Opcional - Cria/Atualiza contato)
  customer_name: 'João Silva',
  customer_email: 'joao@email.com',
  customer_phone: '(11) 99999-9999',
  customer_address: 'Rua das Flores, 123',
  customer_city: 'São Paulo',
  customer_state: 'SP'
});`} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">🛒 Adicionar ao Carrinho (AddToCart)</CardTitle>
                                    <CardDescription>Registre quando um usuário coloca um item no carrinho de compras.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={`internalPixel('AddToCart', {
  content_ids: ['SKU-123'],
  content_name: 'Camiseta Preta',
  value: 49.90,
  currency: 'BRL'
});`} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">💳 Iniciar Checkout (InitiateCheckout)</CardTitle>
                                    <CardDescription>Quando o usuário clica em "Finalizar Compra" ou entra na página de pagamento.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={`internalPixel('InitiateCheckout', {
  num_items: 2,
  value: 179.80,
  currency: 'BRL'
});`} />
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Eventos de Lead e Contato</h2>
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">🎯 Geração de Lead (Lead)</CardTitle>
                                    <CardDescription>Ideal para formulários de cadastro, newsletters ou captura de e-mail.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={`internalPixel('Lead', {
  content_name: 'Ebook Gratuito',
  content_category: 'Download',
  source: 'Instagram Orgânico'
});`} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">📞 Contato (Contact)</CardTitle>
                                    <CardDescription>Rastreie cliques em botões de WhatsApp, telefone ou e-mail.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={`// Exemplo em um botão HTML
<button onclick="internalPixel('Contact', { type: 'whatsapp' })">
  Falar no WhatsApp
</button>`} />
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">FAQ e Solução de Problemas</h2>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">O pixel funciona em localhost?</h3>
                                    <p className="text-sm text-muted-foreground">Sim! O script detecta automaticamente o ambiente. Em localhost, ele envia os eventos para <code>http://localhost:3000</code>. Em produção, ele usará a URL do seu domínio configurado.</p>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Como verificar se está funcionando?</h3>
                                    <p className="text-sm text-muted-foreground">Abra o <strong>Console do Desenvolvedor</strong> (F12) no seu navegador e vá para a aba <strong>Network</strong>. Ao disparar um evento, você verá uma requisição <code>POST</code> para <code>/api/pixels/events</code> com status <code>201 Created</code>.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default PixelGuide;
