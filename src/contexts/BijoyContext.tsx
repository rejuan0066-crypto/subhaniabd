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

/**
 * Trigger React-compatible value change on an input/textarea.
 * React overrides the native value setter, so we must call the
 * *prototype* setter and then fire a native InputEvent.
 */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    // fallback
    el.value = value;
  }
  // React 16+ listens on 'input' events dispatched natively
  el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false }));
}

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
      // Skip modifier combos
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT';
      const isTextarea = target.tagName === 'TEXTAREA';
      const isContentEditable = target.isContentEditable;

      if (!isInput && !isTextarea && !isContentEditable) return;

      // Only text-like inputs
      if (isInput) {
        const inputType = (target as HTMLInputElement).type?.toLowerCase() || 'text';
        if (!['text', 'search', ''].includes(inputType)) return;
      }

      const char = e.key;
      // Skip non-printable / special keys
      if (char.length !== 1) return;
      if (!isBijoyKey(char)) return;

      const unicodeChar = bijoyCharToUnicode(char);
      if (unicodeChar === char) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      if (isInput || isTextarea) {
        const el = target as HTMLInputElement | HTMLTextAreaElement;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? start;
        const before = el.value.slice(0, start);
        const after = el.value.slice(end);
        const newValue = before + unicodeChar + after;
        const newCursor = start + unicodeChar.length;

        setNativeValue(el, newValue);

        // Restore cursor after React re-renders
        requestAnimationFrame(() => {
          el.setSelectionRange(newCursor, newCursor);
        });
      } else if (isContentEditable) {
        document.execCommand('insertText', false, unicodeChar);
      }
    };

    // Capture phase so we intercept before React's synthetic handler
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [bijoyEnabled]);

  return (
    <BijoyContext.Provider value={{ bijoyEnabled, setBijoyEnabled, toggleBijoy }}>
      {children}
    </BijoyContext.Provider>
  );
};
