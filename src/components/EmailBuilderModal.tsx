import React, { useState, useRef, useEffect } from 'react';
import '@/pages/admin/AdminEmailBuilder.css';
import { initEmailBuilder } from '@/pages/admin/emailBuilderApp';
import { EmailBuilderCore } from '@/pages/admin/EmailBuilderCore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { X, Loader2, LayoutTemplate, PenLine } from 'lucide-react';

interface EmailTemplate {
  id: number;
  name: string;
  subject?: string;
  html: string;
  category: string;
}

interface EmailBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (html: string) => void;
  initialHtml?: string;
  campaignVariables?: { label: string; value: string }[];
}

const DEFAULT_VARIABLES = [
  { label: '{{nome}}', value: '{{nome}}' },
  { label: '{{cupom_nome}}', value: '{{cupom_nome}}' },
  { label: '{{cupom_valor}}', value: '{{cupom_valor}}' },
  { label: '{{cupom_validade}}', value: '{{cupom_validade}}' },
  { label: '{{link_rastreio}}', value: '{{link_rastreio}}' },
];

function insertVariableAtCursor(text: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  // Only insert if the selection is inside a contenteditable
  let node: Node | null = range.startContainer;
  while (node) {
    if (node instanceof Element && node.getAttribute('contenteditable') === 'true') {
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      // Trigger input event so builder saves state
      node.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    node = node.parentNode;
  }
}

function extractCanvasContent(html: string): string {
  const match = html.match(/<div class="email-container">([\s\S]*?)<\/div>\s*<\/td>\s*<\/tr>/);
  if (match) return match[1];
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
  if (bodyMatch) return bodyMatch[1];
  return html;
}

function buildFullHtml(canvasContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-mail</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
    .email-wrapper { width: 100%; background-color: #f4f4f7; padding: 20px 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <div class="email-container">
            ${canvasContent}
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function EmailBuilderModal({
  open,
  onClose,
  onApply,
  initialHtml,
  campaignVariables,
}: EmailBuilderModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const builderInitialized = useRef(false);
  const { toast } = useToast();

  const variables = campaignVariables ?? DEFAULT_VARIABLES;

  useEffect(() => {
    if (open) {
      loadTemplates();
    } else {
      builderInitialized.current = false;
      setActiveTemplateId(null);
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await api.getEmailTemplates();
      setTemplates(Array.isArray(res) ? res : []);
    } catch {
      // Non-critical — builder still works without templates
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const canvasRef = (node: HTMLDivElement | null) => {
    if (node && !builderInitialized.current) {
      builderInitialized.current = true;
      initEmailBuilder();
      // Load initial HTML if provided
      if (initialHtml) {
        setTimeout(() => {
          if (typeof (window as any).loadCanvasHTML === 'function') {
            (window as any).loadCanvasHTML(extractCanvasContent(initialHtml));
          }
        }, 80);
      }
    }
    if (!node) {
      builderInitialized.current = false;
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setActiveTemplateId(template.id);
    const content = extractCanvasContent(template.html);
    if (typeof (window as any).loadCanvasHTML === 'function') {
      (window as any).loadCanvasHTML(content);
    } else {
      toast({ title: 'Aguarde', description: 'O editor ainda está inicializando. Tente novamente.' });
    }
  };

  const handleStartFromScratch = () => {
    setActiveTemplateId(null);
    if (typeof (window as any).loadCanvasHTML === 'function') {
      (window as any).loadCanvasHTML('');
    }
  };

  const handleApply = () => {
    const canvas = document.getElementById('email-canvas');
    const html = canvas?.innerHTML || '';
    if (!html || html.includes('canvas-empty-state')) {
      toast({ title: 'Aviso', description: 'O canvas está vazio. Crie ou selecione um template antes de aplicar.', variant: 'destructive' });
      return;
    }
    onApply(buildFullHtml(html));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-[98vw] w-[98vw] p-0 gap-0 overflow-hidden"
        style={{ height: '96vh', maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top bar: template picker */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-2 text-sm font-medium flex-shrink-0">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Templates:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pb-0.5">
            {/* Scratch option */}
            <button
              onClick={handleStartFromScratch}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                activeTemplateId === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <PenLine className="w-3 h-3" />
              Do zero
            </button>

            {isLoadingTemplates && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
            )}

            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  activeTemplateId === t.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                {t.name}
              </button>
            ))}

            {!isLoadingTemplates && templates.length === 0 && (
              <span className="text-xs text-muted-foreground">Nenhum template salvo ainda.</span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Builder area */}
        <div className="flex-1 overflow-hidden">
          <EmailBuilderCore
            canvasRef={canvasRef}
            wrapperStyle={{ height: '100%', width: '100%', position: 'relative' }}
          />
        </div>

        {/* Footer: variables + actions */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 border-t bg-background">
          <span className="text-xs text-muted-foreground mr-1 flex-shrink-0">Inserir variável:</span>
          {variables.map((v) => (
            <button
              key={v.value}
              onMouseDown={(e) => {
                // Prevent focus loss from canvas contenteditable
                e.preventDefault();
                insertVariableAtCursor(v.value);
              }}
              className="px-2 py-1 text-xs font-mono rounded border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors flex-shrink-0"
              title={`Inserir ${v.value}`}
            >
              {v.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleApply} className="flex items-center gap-2">
              Usar este E-mail
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
