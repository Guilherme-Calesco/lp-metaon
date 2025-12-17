import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  bucket, 
  folder = '', 
  label = 'Foto',
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`p-1 rounded text-[10px] transition-colors ${
              mode === 'upload' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
            title="Upload de arquivo"
          >
            <Upload className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`p-1 rounded text-[10px] transition-colors ${
              mode === 'url' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
            title="Inserir URL"
          >
            <LinkIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id={`file-upload-${bucket}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs flex-1"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Selecionar imagem
              </>
            )}
          </Button>
        </div>
      ) : (
        <Input
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}

      {value && (
        <div className="flex items-center gap-2">
          <img 
            src={value} 
            alt="Preview" 
            className="h-8 w-8 rounded object-cover border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-[10px] text-muted-foreground truncate flex-1">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-destructive hover:text-destructive"
            onClick={() => onChange('')}
          >
            Remover
          </Button>
        </div>
      )}
    </div>
  );
}
