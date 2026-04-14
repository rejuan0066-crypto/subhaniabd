import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { bijoyCharToUnicode, isBijoyKey } from '@/lib/bijoyKeymap';

interface BijoyContextType {
  bijoyEnabled: boolean;
  setBijoyEnabled: (v: boolean) => void;
  toggleBijoy: () => void;
}

const BijoyContext = createContext<BijoyContextType>({
  bijoyEnabled: false,
  setBijoyEnabled: () => {},
  toggleBijoy: () => {},
});

export const useBijoy = () => useContext(BijoyContext);

export const BijoyProvider = ({ children }: { children: ReactNode }) => {
  const [bijoyEnabled, setBijoyEnabled] = useState(() => {
    try {
      return localStorage.getItem('bijoy-mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bijoy-mode', String(bijoyEnabled));
    } catch {}
  }, [bijoyEnabled]);

  const toggleBijoy = useCallback(() => setBijoyEnabled(prev => !prev), []);

  // Global keydown interceptor for Bijoy mode
  useEffect(() => {
    if (!bijoyEnabled) return;

    const handler = (e: KeyboardEvent) => {
      // Skip if modifier keys (Ctrl, Alt, Meta) are pressed
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Only intercept when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isEditable) return;

      // For input elements, check type
      if (target.tagName === 'INPUT') {
        const inputType = (target as HTMLInputElement).type;
        // Only intercept text-like inputs
        if (!['text', 'search', 'url', 'tel', ''].includes(inputType)) return;
      }

      const char = e.key;
      
      // Skip special keys
      if (char.length !== 1) return;
      
      // Skip if not a Bijoy-mappable key
      if (!isBijoyKey(char)) return;

      const unicodeChar = bijoyCharToUnicode(char);
      if (unicodeChar === char) return; // No mapping needed

      e.preventDefault();

      // Insert the Unicode character at cursor position
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const el = target as HTMLInputElement | HTMLTextAreaElement;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const value = el.value;
        
        // Use native input setter to trigger React's onChange
        const nativeInputValueSetter = 
          target.tagName === 'INPUT'
            ? Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            : Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        
        const newValue = value.slice(0, start) + unicodeChar + value.slice(end);
        nativeInputValueSetter?.call(el, newValue);
        
        // Dispatch input event so React picks up the change
        const inputEvent = new Event('input', { bubbles: true });
        el.dispatchEvent(inputEvent);
        
        // Restore cursor position
        const newPos = start + unicodeChar.length;
        requestAnimationFrame(() => {
          el.setSelectionRange(newPos, newPos);
        });
      } else if (target.isContentEditable) {
        document.execCommand('insertText', false, unicodeChar);
      }
    };

    // Use capture phase to intercept before React handlers
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [bijoyEnabled]);

  return (
    <BijoyContext.Provider value={{ bijoyEnabled, setBijoyEnabled, toggleBijoy }}>
      {children}
    </BijoyContext.Provider>
  );
};
