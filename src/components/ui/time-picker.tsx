import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  value: string; // "HH:MM" 24h format
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  displayFormat?: '12h' | '24h';
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const TimePicker = ({ value, onChange, className, placeholder = "সময়", displayFormat = '12h' }: TimePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = React.useState<number | null>(null);
  const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
      setPeriod(h >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const [h, m] = val.split(':').map(Number);
    if (displayFormat === '24h') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const p = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${p}`;
  };

  const handleDone = () => {
    const h = selectedHour ?? 0;
    const m = selectedMinute ?? 0;
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    setOpen(false);
  };

  const get12Hour = (h: number) => h % 12 || 12;
  const isPM = (h: number) => h >= 12;

  // Filter hours by AM/PM
  const filteredHours = HOURS_24.filter(h => period === 'AM' ? h < 12 : h >= 12);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all duration-300",
            "hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          <span className="flex-1 text-left truncate">
            {value ? formatDisplay(value) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[260px] p-0 border-0 shadow-2xl rounded-[28px] backdrop-blur-xl bg-background/95 overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* AM/PM Toggle */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-center bg-muted/60 rounded-full p-1 gap-0.5">
            {(['AM', 'PM'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  if (selectedHour !== null) {
                    const newH = p === 'AM'
                      ? (selectedHour >= 12 ? selectedHour - 12 : selectedHour)
                      : (selectedHour < 12 ? selectedHour + 12 : selectedHour);
                    setSelectedHour(newH);
                  }
                }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-full transition-all duration-300",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Hours Grid */}
        <div className="px-4 pb-1">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">ঘণ্টা</p>
          <div className="grid grid-cols-6 gap-1">
            {filteredHours.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHour(h)}
                className={cn(
                  "h-8 w-full rounded-lg text-xs font-medium transition-all duration-200",
                  selectedHour === h
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "text-foreground hover:bg-primary/10 hover:scale-105"
                )}
              >
                {get12Hour(h)}
              </button>
            ))}
          </div>
        </div>

        {/* Minutes Grid */}
        <div className="px-4 pb-2 pt-1">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">মিনিট</p>
          <div className="grid grid-cols-6 gap-1">
            {MINUTES.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMinute(m)}
                className={cn(
                  "h-8 w-full rounded-lg text-xs font-medium transition-all duration-200",
                  selectedMinute === m
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "text-foreground hover:bg-primary/10 hover:scale-105"
                )}
              >
                {String(m).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Done Button */}
        <div className="px-4 pb-4 pt-1">
          <Button
            size="sm"
            onClick={handleDone}
            className="w-full rounded-xl h-9 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            সম্পন্ন
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { TimePicker };
