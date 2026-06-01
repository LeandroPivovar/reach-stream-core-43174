import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ImageNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { imageUrl: evt.target.value });
  };

  return (
    <div className="bg-background border-2 border-green-500 rounded-xl shadow-md min-w-[250px] overflow-hidden">
      <div className="bg-green-500/10 p-3 border-b flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-green-500" />
        <span className="font-semibold text-sm">Imagem</span>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`img-${id}`} className="text-xs text-muted-foreground">URL da Imagem</Label>
          <Input 
            id={`img-${id}`}
            placeholder="https://exemplo.com/imagem.jpg" 
            className="text-sm h-8 nodrag"
            value={data.imageUrl || ''}
            onChange={onChange}
          />
        </div>
        
        {data.imageUrl && (
          <div className="w-full h-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            <img 
              src={data.imageUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Imagem+Inválida';
              }}
            />
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
});

ImageNode.displayName = 'ImageNode';
