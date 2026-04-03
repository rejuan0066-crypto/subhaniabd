import { useState, useRef } from 'react';
import PublicLayout from '@/components/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, RotateCw, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PhotoToolsPage = () => {
  const { language } = useLanguage();
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
    if (!f || !f.type.startsWith('image/')) { toast.error('Only image files'); return; }
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setPreview(src);
      const img = new window.Image();
      img.onload = () => { setOriginalInfo({ width: img.width, height: img.height, size: f.size }); setWidth(img.width); setHeight(img.height); };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const onWidthChange = (v: number) => { setWidth(v); if (keepRatio && originalInfo.width) setHeight(Math.round((v / originalInfo.width) * originalInfo.height)); };
  const onHeightChange = (v: number) => { setHeight(v); if (keepRatio && originalInfo.height) setWidth(Math.round((v / originalInfo.height) * originalInfo.width)); };

  const processImage = () => {
    if (!preview) return;
    setProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => { if (blob) setResult({ url: URL.createObjectURL(blob), size: blob.size, width, height }); setProcessing(false); }, `image/${format}`, format === 'png' ? undefined : quality / 100);
    };
    img.src = preview;
  };

  const downloadResult = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = `resized-${Date.now()}.${format}`; a.click(); };
  const reset = () => { setPreview(''); setResult(null); setOriginalInfo({ width: 0, height: 0, size: 0 }); setWidth(0); setHeight(0); if (inputRef.current) inputRef.current.value = ''; };
  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          {language === 'bn' ? '📷 ফটো টুলস' : '📷 Photo Tools'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{language === 'bn' ? 'ছবি রিসাইজ, কম্প্রেস ও ফরম্যাট পরিবর্তন করুন' : 'Resize, compress & convert images'}</p>

        {!preview ? (
          <label className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors">
            <Upload className="w-12 h-12 text-muted-foreground mb-3" />
            <span className="text-lg font-medium">{language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Select an Image'}</span>
            <span className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP</span>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-elevated p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{language === 'bn' ? 'সেটিংস' : 'Settings'}</h3>
                <Button size="sm" variant="ghost" onClick={reset}><Trash2 className="w-4 h-4 mr-1" /> {language === 'bn' ? 'নতুন' : 'New'}</Button>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                <p>{originalInfo.width} × {originalInfo.height}px • {formatSize(originalInfo.size)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{language === 'bn' ? 'প্রস্থ' : 'Width'}</Label><Input type="number" min={1} value={width} onChange={e => onWidthChange(+e.target.value)} className="bg-background mt-1" /></div>
                <div><Label className="text-xs">{language === 'bn' ? 'উচ্চতা' : 'Height'}</Label><Input type="number" min={1} value={height} onChange={e => onHeightChange(+e.target.value)} className="bg-background mt-1" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)} className="rounded" />{language === 'bn' ? 'অনুপাত বজায়' : 'Keep ratio'}</label>
              <div className="flex flex-wrap gap-2">
                {[{ l: '50%', f: .5 }, { l: '75%', f: .75 }, { l: '128px', s: 128 }, { l: '256px', s: 256 }, { l: '512px', s: 512 }].map(p => (
                  <Button key={p.l} size="sm" variant="outline" className="text-xs" onClick={() => {
                    if ('f' in p) { setWidth(Math.round(originalInfo.width * p.f)); setHeight(Math.round(originalInfo.height * p.f)); }
                    else { const r = originalInfo.width / originalInfo.height; if (r >= 1) { setWidth(p.s); setHeight(Math.round(p.s / r)); } else { setHeight(p.s); setWidth(Math.round(p.s * r)); } }
                  }}>{p.l}</Button>
                ))}
              </div>
              <div><Label>{language === 'bn' ? `কোয়ালিটি: ${quality}%` : `Quality: ${quality}%`}</Label><Slider value={[quality]} min={10} max={100} step={5} onValueChange={([v]) => setQuality(v)} className="mt-2" /></div>
              <Select value={format} onValueChange={v => setFormat(v as any)}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jpeg">JPEG</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent></Select>
              <Button className="btn-primary-gradient w-full" onClick={processImage} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCw className="w-4 h-4 mr-2" />}{language === 'bn' ? 'প্রসেস' : 'Process'}
              </Button>
            </div>
            <div className="card-elevated p-5 space-y-4">
              <h3 className="font-semibold">{language === 'bn' ? 'প্রিভিউ' : 'Preview'}</h3>
              <div className="border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center" style={{ minHeight: 200 }}>
                <img src={result?.url || preview} alt="" className="max-w-full max-h-[350px] object-contain" />
              </div>
              {result && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm space-y-1">
                    <p>{result.width} × {result.height}px • {formatSize(result.size)}</p>
                    <p className={result.size < originalInfo.size ? 'text-green-600' : 'text-orange-500'}>
                      {result.size < originalInfo.size ? `↓ ${Math.round((1 - result.size / originalInfo.size) * 100)}%` : `↑ ${Math.round((result.size / originalInfo.size - 1) * 100)}%`}
                    </p>
                  </div>
                  <Button className="btn-primary-gradient w-full" onClick={downloadResult}><Download className="w-4 h-4 mr-2" />{language === 'bn' ? 'ডাউনলোড' : 'Download'}</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default PhotoToolsPage;
