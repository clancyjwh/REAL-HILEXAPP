import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchAssets, AssetSuggestion } from '../utils/assetSuggestions';

interface AssetSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (symbol: string) => void;
  placeholder?: string;
  disabled?: boolean;
  assetClass?: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'all';
  className?: string;
  borderColor?: string;
  focusColor?: string;
}

export default function AssetSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = 'e.g., AAPL, BTC, EUR/USD...',
  disabled = false,
  assetClass = 'all',
  className = '',
  borderColor = 'border-slate-600',
  focusColor = 'focus:border-amber-500 focus:ring-amber-500',
}: AssetSearchInputProps) {
  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (newValue: string) => {
    const upperValue = newValue.toUpperCase();
    onChange(upperValue);

    if (upperValue.trim()) {
      const results = searchAssets(upperValue, assetClass);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AssetSuggestion) => {
    onChange(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(suggestion.symbol);
    }
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (value.trim() && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3 bg-slate-800 border ${borderColor} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${focusColor} ${className}`}
        disabled={disabled}
        style={{ textTransform: 'uppercase' }}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.symbol}-${index}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{suggestion.symbol}</div>
                  <div className="text-slate-400 text-sm">{suggestion.name}</div>
                </div>
                <div className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                  {suggestion.category}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
