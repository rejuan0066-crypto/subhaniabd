import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Image as ImageIcon, Loader2, RotateCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPhotoTools = () => {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [originalInfo, setOriginalInfo] = useState({ width: 0, height: 0, size: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) {
      toast.error(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল গ্রহণযোগ্য' : 'Only image files');
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setPreview(src);
      const img = new window.Image();
      img.onload = () => {
        setOriginalInfo({ width: img.width, height: img.height, size: f.size });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const onWidthChange = (v: number) => {
    setWidth(v);
    if (keepRatio && originalInfo.width > 0) {
      setHeight(Math.round((v / originalInfo.width) * originalInfo.height));
    }
  };

  const onHeightChange = (v: number) => {
    setHeight(v);
    if (keepRatio && originalInfo.height > 0) {
      setWidth(Math.round((v / originalInfo.height) * originalInfo.width));
    }
  };

  const processImage = () => {
    if (!preview) return;
    setProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = `image/${format}`;
      const q = format === 'png' ? undefined : quality / 100;
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResult({ url, size: blob.size, width, height });
        }
        setProcessing(false);
      }, mimeType, q);
    };
    img.src = preview;
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `resized-${Date.now()}.${format}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setOriginalInfo({ width: 0, height: 0, size: 0 });
    setWidth(0);
    setHeight(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {language === 'bn' ? '📷 ফটো টুলস' : '📷 Photo Tools'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'bn' ? 'ছবি রিসাইজ, কম্প্রেস ও ফরম্যাট পরিবর্তন করুন' : 'Resize, compress & convert images'}
          </p>
        </div>

        {!preview ? (
          <div className="card-elevated p-8">
            <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Upload className="w-12 h-12 text-muted-foreground mb-3" />
              <span className="text-lg font-medium text-foreground">{language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Select an Image'}</span>
              <span className="text-sm text-muted-foreground mt-1">{language === 'bn' ? 'JPG, PNG, WebP সাপোর্টেড' : 'JPG, PNG, WebP supported'}</span>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="card-elevated p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{language === 'bn' ? 'সেটিংস' : 'Settings'}</h3>
                <Button size="sm" variant="ghost" onClick={reset}><Trash2 className="w-4 h-4 mr-1" /> {language === 'bn' ? 'নতুন ছবি' : 'New Image'}</Button>
              </div>

              {/* Original info */}
              <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
                <p><span className="text-muted-foreground">{language === 'bn' ? 'মূল সাইজ:' : 'Original:'}</span> {originalInfo.width} × {originalInfo.height}px</p>
                <p><span className="text-muted-foreground">{language === 'bn' ? 'ফাইল সাইজ:' : 'File size:'}</span> {formatSize(originalInfo.size)}</p>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="mb-2 block font-medium">{language === 'bn' ? 'ডাইমেনশন (px)' : 'Dimensions (px)'}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{language === 'bn' ? 'প্রস্থ' : 'Width'}</Label>
                    <Input type="number" min={1} max={10000} value={width} onChange={e => onWidthChange(Number(e.target.value))} className="bg-background mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{language === 'bn' ? 'উচ্চতা' : 'Height'}</Label>
                    <Input type="number" min={1} max={10000} value={height} onChange={e => onHeightChange(Number(e.target.value))} className="bg-background mt-1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)} className="rounded" />
                  {language === 'bn' ? 'অনুপাত বজায় রাখুন' : 'Keep aspect ratio'}
                </label>
              </div>

              {/* Quick presets */}
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">{language === 'bn' ? 'দ্রুত রিসাইজ' : 'Quick Resize'}</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '50%', factor: 0.5 },
                    { label: '75%', factor: 0.75 },
                    { label: '150%', factor: 1.5 },
                    { label: '200%', factor: 2 },
                  ].map(p => (
                    <Button key={p.label} size="sm" variant="outline" className="text-xs" onClick={() => {
                      const w = Math.round(originalInfo.width * p.factor);
                      const h = Math.round(originalInfo.height * p.factor);
                      setWidth(w);
                      setHeight(h);
                    }}>{p.label}</Button>
                  ))}
                  {[
                    { label: '128px', size: 128 },
                    { label: '256px', size: 256 },
                    { label: '512px', size: 512 },
                    { label: '1024px', size: 1024 },
                  ].map(p => (
                    <Button key={p.label} size="sm" variant="outline" className="text-xs" onClick={() => {
                      const ratio = originalInfo.width / originalInfo.height;
                      if (ratio >= 1) { setWidth(p.size); setHeight(Math.round(p.size / ratio)); }
                      else { setHeight(p.size); setWidth(Math.round(p.size * ratio)); }
                    }}>{p.label}</Button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <Label className="mb-2 block font-medium">{language === 'bn' ? `কোয়ালিটি: ${quality}%` : `Quality: ${quality}%`}</Label>
                <Slider value={[quality]} min={10} max={100} step={5} onValueChange={([v]) => setQuality(v)} />
                <p className="text-xs text-muted-foreground mt-1">{language === 'bn' ? 'কম কোয়ালিটি = ছোট ফাইল' : 'Lower quality = smaller file'}</p>
              </div>

              {/* Format */}
              <div>
                <Label className="mb-2 block font-medium">{language === 'bn' ? 'ফরম্যাট' : 'Format'}</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-primary-gradient w-full" onClick={processImage} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCw className="w-4 h-4 mr-2" />}
                {language === 'bn' ? 'প্রসেস করুন' : 'Process'}
              </Button>
            </div>

            {/* Preview */}
            <div className="card-elevated p-5 space-y-4">
              <h3 className="font-semibold text-foreground">{language === 'bn' ? 'প্রিভিউ' : 'Preview'}</h3>
              <div className="border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={result?.url || preview} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
              </div>

              {result && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm space-y-1">
                    <p><span className="text-muted-foreground">{language === 'bn' ? 'নতুন সাইজ:' : 'New size:'}</span> {result.width} × {result.height}px</p>
                    <p><span className="text-muted-foreground">{language === 'bn' ? 'ফাইল সাইজ:' : 'File size:'}</span> {formatSize(result.size)}</p>
                    {originalInfo.size > 0 && (
                      <p className={result.size < originalInfo.size ? 'text-green-600' : 'text-orange-500'}>
                        {result.size < originalInfo.size
                          ? `↓ ${Math.round((1 - result.size / originalInfo.size) * 100)}% ${language === 'bn' ? 'কমেছে' : 'reduced'}`
                          : `↑ ${Math.round((result.size / originalInfo.size - 1) * 100)}% ${language === 'bn' ? 'বেড়েছে' : 'increased'}`
                        }
                      </p>
                    )}
                  </div>
                  <Button className="btn-primary-gradient w-full" onClick={downloadResult}>
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'ডাউনলোড করুন' : 'Download'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPhotoTools;
