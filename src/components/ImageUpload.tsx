import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectRatio?: string;
}

const ImageUpload = ({ value, onChange, folder = 'general', label, className = '', aspectRatio = 'aspect-square' }: ImageUploadProps) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল গ্রহণযোগ্য' : 'Only image files are accepted');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bn' ? 'ফাইল সাইজ ৫MB এর বেশি হতে পারবে না' : 'File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('website-assets')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('website-assets')
        .getPublicUrl(fileName);

      onChange(data.publicUrl);
      toast.success(language === 'bn' ? 'ছবি আপলোড সফল!' : 'Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || (language === 'bn' ? 'আপলোড ব্যর্থ' : 'Upload failed'));
    }
    setUploading(false);
  };

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>}
      <div className={`relative inline-block ${aspectRatio}`}>
        {value ? (
          <div className="relative group h-full w-full">
            <img src={value} alt="" className="h-full w-full object-cover rounded-lg border border-border" />
            <button
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-full w-full rounded-lg border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground text-center px-1">
                  {language === 'bn' ? 'আপলোড' : 'Upload'}
                </span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
