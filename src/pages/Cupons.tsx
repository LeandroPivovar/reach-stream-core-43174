import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tag, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Cupons() {
    const [platform, setPlatform] = useState<'shopify' | 'nuvemshop'>('shopify');
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [value, setValue] = useState('');
    const [valueType, setValueType] = useState<'percentage' | 'fixed'>('percentage');
    const [endsAt, setEndsAt] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isTitleRequired = platform === 'shopify';
            if ((isTitleRequired && !title) || !code || !value) {
                toast({ title: 'Erro', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
                return;
            }

            if (platform === 'shopify') {
                const data = {
                    title, code, value, valueType,
                    ...(endsAt ? { endsAt: new Date(endsAt).toISOString() } : {})
                };
                await api.createCoupon(data);
            } else {
                const data = {
                    code,
                    type: valueType === 'percentage' ? 'percentage' : 'absolute' as any,
                    value,
                    start_date: new Date().toISOString(),
                    ...(endsAt ? { end_date: new Date(endsAt).toISOString() } : {})
                };
                await api.createNuvemshopCoupon(data);
            }

            toast({
                title: 'Sucesso',
                description: `Cupom criado com sucesso na ${platform === 'shopify' ? 'Shopify' : 'Nuvemshop'}!`,
            });
            setTitle('');
            setCode('');
            setValue('');
        } catch (error: any) {
            toast({
                title: 'Erro ao criar cupom',
                description: error.message || `Falha na comunicação com a ${platform === 'shopify' ? 'Shopify' : 'Nuvemshop'}.`,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Criar Cupom (Isolado)</h2>
            </div>

            <Card className="bg-[#12141a] border-[#1e212b] text-white">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary" />
                        Novo Cupom de Desconto
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Crie um cupom de desconto diretamente na sua loja integrada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateCoupon} className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Plataforma de Destino</Label>
                            <Select value={platform} onValueChange={(val: 'shopify' | 'nuvemshop') => setPlatform(val)}>
                                <SelectTrigger className="bg-[#1a1d24] border-[#2a2d35]">
                                    <SelectValue placeholder="Selecione a plataforma..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1d24] border-[#2a2d35] text-white">
                                    <SelectItem value="shopify">Shopify</SelectItem>
                                    <SelectItem value="nuvemshop">Nuvemshop / Tiendanube</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {platform === 'shopify' && (
                            <div className="space-y-2">
                                <Label className="text-gray-300">Título do Desconto (Interno Shopify)</Label>
                                <Input
                                    placeholder="Ex: PROMO10"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-[#1a1d24] border-[#2a2d35]"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-gray-300">Código do Cupom {platform === 'nuvemshop' && '(Interno e para o cliente)'}</Label>
                            <Input
                                placeholder="Ex: ESPECIAL10"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="bg-[#1a1d24] border-[#2a2d35]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Tipo de Desconto</Label>
                                <Select value={valueType} onValueChange={(val: 'percentage' | 'fixed') => setValueType(val)}>
                                    <SelectTrigger className="bg-[#1a1d24] border-[#2a2d35]">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1d24] border-[#2a2d35] text-white">
                                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Valor</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={valueType === 'percentage' ? 'Ex: 15' : 'Ex: 50.00'}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="bg-[#1a1d24] border-[#2a2d35]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Data de Expiração (Opcional)</Label>
                            <Input
                                type="datetime-local"
                                value={endsAt}
                                onChange={(e) => setEndsAt(e.target.value)}
                                className="bg-[#1a1d24] border-[#2a2d35]"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? 'Criando...' : `Gerar Cupom ${platform === 'shopify' ? 'Shopify' : 'Nuvemshop'}`}
                            {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
