import { useEffect } from 'react';
import { useThemeSettings, ThemeSettings } from '@/hooks/useThemeSettings';

function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(t: ThemeSettings) {
  const root = document.documentElement;
  
  // Primary color
  root.style.setProperty('--primary', `${t.primaryHue} ${t.primarySaturation}% ${t.primaryLightness}%`);
  root.style.setProperty('--ring', `${t.primaryHue} ${t.primarySaturation}% ${t.primaryLightness}%`);
  
  // Accent color
  root.style.setProperty('--accent', `${t.accentHue} ${t.accentSaturation}% ${t.accentLightness}%`);
  
  // Background
  root.style.setProperty('--background', `${t.backgroundHue} ${t.backgroundSaturation}% ${t.backgroundLightness}%`);
  root.style.setProperty('--secondary', `${t.backgroundHue} 45% 92%`);
  root.style.setProperty('--muted', `${t.backgroundHue} 20% 94%`);
  root.style.setProperty('--border', `${t.backgroundHue} 20% 88%`);
  root.style.setProperty('--input', `${t.backgroundHue} 20% 88%`);

  // Sidebar
  if (t.sidebarBgColor) {
    const hsl = hexToHsl(t.sidebarBgColor);
    if (hsl) root.style.setProperty('--sidebar-background', hsl);
  } else {
    root.style.setProperty('--sidebar-background', `${t.primaryHue} 35% ${t.sidebarDarkness}%`);
  }
  
  if (t.sidebarTextColor) {
    const hsl = hexToHsl(t.sidebarTextColor);
    if (hsl) {
      root.style.setProperty('--sidebar-foreground', hsl);
      root.style.setProperty('--sidebar-primary-foreground', hsl);
    }
  }

  if (t.sidebarActiveColor) {
    const hsl = hexToHsl(t.sidebarActiveColor);
    if (hsl) root.style.setProperty('--sidebar-primary', hsl);
  } else {
    root.style.setProperty('--sidebar-primary', `${t.accentHue} ${t.accentSaturation}% ${t.accentLightness}%`);
  }

  root.style.setProperty('--sidebar-accent', `${t.primaryHue} 30% ${t.sidebarDarkness + 6}%`);
  root.style.setProperty('--sidebar-border', `${t.primaryHue} 25% ${t.sidebarDarkness + 8}%`);
  root.style.setProperty('--sidebar-ring', `${t.accentHue} ${t.accentSaturation}% ${t.accentLightness}%`);

  // Sidebar hover text color
  if (t.sidebarHoverTextColor) {
    const hsl = hexToHsl(t.sidebarHoverTextColor);
    if (hsl) root.style.setProperty('--sidebar-hover-foreground', hsl);
  } else {
    root.style.removeProperty('--sidebar-hover-foreground');
  }

  // Sidebar font size
  const sidebarFontSizeMap: Record<string, string> = { small: '12px', medium: '13px', large: '14px' };
  root.style.setProperty('--sidebar-font-size', sidebarFontSizeMap[t.sidebarFontSize] || '13px');

  // Header font size
  const headerFontSizeMap: Record<string, string> = { small: '12px', medium: '13px', large: '14px' };
  root.style.setProperty('--header-font-size', headerFontSizeMap[t.headerFontSize] || '13px');

  // Base font size
  root.style.setProperty('--base-font-size', `${t.baseFontSize || 14}px`);
  root.style.fontSize = `${t.baseFontSize || 14}px`;
  // Border radius
  root.style.setProperty('--radius', `${t.borderRadius / 16}rem`);

  // Fonts
  const bengaliFont = t.fontBengali || 'Noto Sans Bengali';
  root.style.setProperty('--font-display', `"${t.fontDisplay}", "${bengaliFont}", serif`);
  root.style.setProperty('--font-body', `"${t.fontBody}", "${bengaliFont}", sans-serif`);
  root.style.setProperty('--font-bengali', `"${bengaliFont}", sans-serif`);
  document.body.style.fontFamily = `"${t.fontBody}", "${bengaliFont}", sans-serif`;

  // Font weights & styles
  root.style.setProperty('--font-display-weight', t.fontDisplayWeight || '700');
  root.style.setProperty('--font-body-weight', t.fontBodyWeight || '400');
  root.style.setProperty('--font-bengali-weight', t.fontBengaliWeight || '400');
  root.style.setProperty('--font-display-style', t.fontDisplayStyle || 'normal');
  root.style.setProperty('--font-body-style', t.fontBodyStyle || 'normal');
  root.style.setProperty('--font-bengali-style', t.fontBengaliStyle || 'normal');
  document.body.style.fontWeight = t.fontBodyWeight || '400';
  document.body.style.fontStyle = t.fontBodyStyle || 'normal';

  // Load Bengali font dynamically
  if (bengaliFont !== 'Noto Sans Bengali') {
    const fontLink = document.getElementById('dynamic-bengali-font') as HTMLLinkElement;
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(bengaliFont)}:wght@300;400;500;600;700;800&display=swap`;
    if (fontLink) {
      fontLink.href = fontUrl;
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-bengali-font';
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }

  // Success/warning/info derived from primary
  root.style.setProperty('--success', `${t.primaryHue} ${t.primarySaturation}% 40%`);
  root.style.setProperty('--warning', `${t.accentHue - 4} 92% 50%`);
  root.style.setProperty('--info', `210 80% 52%`);

  // Gradients
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${t.primaryHue} ${t.primarySaturation}% ${t.primaryLightness}%), hsl(${t.primaryHue} ${t.primarySaturation}% ${t.primaryLightness - 6}%))`);
  root.style.setProperty('--gradient-gold', `linear-gradient(135deg, hsl(${t.accentHue} ${t.accentSaturation}% ${t.accentLightness}%), hsl(${t.accentHue - 4} ${t.accentSaturation - 5}% ${t.accentLightness - 7}%))`);
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, hsl(${t.primaryHue} ${t.primarySaturation}% ${t.primaryLightness - 10}%), hsl(${t.primaryHue} ${t.primarySaturation + 5}% ${t.primaryLightness - 16}%))`);
}

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, isLoading } = useThemeSettings();

  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme);
    }
  }, [theme, isLoading]);

  return <>{children}</>;
};

export default ThemeProvider;
