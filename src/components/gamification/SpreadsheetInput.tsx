import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface SpreadsheetInputProps {
  value: number;
  onChange: (value: number) => void;
  isCurrency?: boolean;
  isToday?: boolean;
}

export function SpreadsheetInput({ value, onChange, isCurrency = false, isToday = false }: SpreadsheetInputProps) {
  // Format value: use comma for currency, dot for regular numbers
  const formatValue = (num: number): string => {
    if (!num) return '';
    if (isCurrency) {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return String(num);
  };

  // Parse value: handle comma as decimal separator
  const parseValue = (str: string): number => {
    if (!str) return 0;
    // Replace comma with dot for parsing
    const normalized = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const [localValue, setLocalValue] = useState<string>(formatValue(value));
  const [isFocused, setIsFocused] = useState(false);

  // Only update from prop when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatValue(value));
    }
  }, [value, isFocused, isCurrency]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const newValue = parseValue(localValue);
    
    if (newValue !== value) {
      onChange(newValue);
    }
    // Reformat on blur
    setLocalValue(formatValue(newValue));
  }, [localValue, value, onChange, isCurrency]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (isCurrency) {
      // Allow digits, comma, and dot for currency
      if (/^[\d.,]*$/.test(input)) {
        setLocalValue(input);
      }
    } else {
      // Allow only digits for non-currency fields
      if (/^\d*$/.test(input)) {
        setLocalValue(input);
      }
    }
  }, [isCurrency]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className="h-7 text-center text-xs px-1 border-input focus:border-primary"
      placeholder={isCurrency ? "0,00" : "0"}
    />
  );
}
