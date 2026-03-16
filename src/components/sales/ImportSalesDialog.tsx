import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';

interface ImportSalesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportComplete?: () => void;
}

export function ImportSalesDialog({ open, onOpenChange, onImportComplete }: ImportSalesDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Selecione uma planilha para importar');
            return;
        }

        setIsImporting(true);
        try {
            const data = await api.importSales(file);
            setResult(data);
            if (data.created > 0) {
                toast.success(`${data.created} vendas importadas com sucesso!`);
                if (onImportComplete) onImportComplete();
            }
            if (data.errors.length > 0) {
                toast.warning(`${data.errors.length} erros encontrados durante a importação.`);
            }
        } catch (error) {
            console.error('Erro ao importar vendas:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao importar vendas');
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                Email: 'cliente@exemplo.com',
                Nome: 'João Silva',
                Produto: 'Camiseta Premium',
                SKU: 'CAM-001',
                Quantidade: 2,
                'Valor Unitario': 50.00,
                'Valor Total': 100.00,
                'Metodo Pagamento': 'credit_card',
                Status: 'completed',
                Canal: 'manual',
                Data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            },
            {
                Email: 'maria@teste.com',
                Nome: 'Maria Souza',
                Produto: 'Calça Jeans',
                SKU: 'CAL-002',
                Quantidade: 1,
                'Valor Unitario': 180.00,
                'Valor Total': 180.00,
                'Metodo Pagamento': 'pix',
                Status: 'completed',
                Canal: 'instagram',
                Data: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');
        XLSX.writeFile(workbook, 'modelo_importacao_vendas.xlsx');
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!isImporting) {
                onOpenChange(val);
                if (!val) {
                    setFile(null);
                    setResult(null);
                }
            }
        }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="w-5 h-5" />
                        Importar Vendas
                    </DialogTitle>
                    <DialogDescription>
                        Importe suas vendas a partir de uma planilha Excel ou CSV.
                        O sistema usará o email do cliente para vincular a compra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!result ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="file">Selecione o arquivo (.xlsx, .xls ou .csv)</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <FileUp className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        {file ? file.name : 'Arraste ou clique para selecionar'}
                                    </p>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-xs">
                                    <Download className="w-3 h-3 mr-1" />
                                    Baixar Modelo de Planilha
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">{result.created} vendas importadas com sucesso!</span>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">{result.errors.length} vendas não puderam ser importadas:</span>
                                    </div>
                                    <div className="max-h-[150px] overflow-y-auto border rounded-md p-2 bg-muted/30 text-xs space-y-1">
                                        {result.errors.map((error, idx) => (
                                            <p key={idx} className="text-red-500">• {error}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {!result ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
                                Cancelar
                            </Button>
                            <Button onClick={handleImport} disabled={!file || isImporting}>
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <FileUp className="w-4 h-4 mr-2" />
                                        Importar
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => onOpenChange(false)}>
                            Fechar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function format(date: Date, fmt: string) {
    // Simple format helper
    return date.toISOString().replace('T', ' ').split('.')[0];
}
