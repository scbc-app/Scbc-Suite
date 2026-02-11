
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SearchOption {
  value: string;
  label: string;
  disabled?: boolean;
  subtext?: string;
}

interface SearchableSelectProps {
  options: SearchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
  required = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
        setSearchTerm("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subtext && option.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label} {required && '*'}</label>}
      <div className="relative">
        <div
          className={`w-full min-h-[42px] px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed opacity-70' 
              : isOpen 
                ? 'ring-2 ring-blue-500 border-blue-500' 
                : 'hover:border-blue-300'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`block truncate text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={16} className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top">
            <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-8 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Type to filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSearchTerm(""); inputRef.current?.focus(); }}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                      option.disabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : option.value === value 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.subtext && <span className="text-xs text-gray-400 mt-0.5">{option.subtext}</span>}
                    </div>
                    {option.value === value && <Check size={14} className="text-blue-600 ml-2" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-400 text-center flex flex-col items-center">
                    <Search size={16} className="mb-2 opacity-50"/>
                    No matches found
                </div>
              )}
            </div>
          </div>
        )}
        {/* Hidden input for HTML form validation compatibility */}
        {required && (
            <input 
                type="text" 
                className="absolute opacity-0 pointer-events-none inset-0 -z-10" 
                value={value} 
                required 
                onChange={() => {}} 
                tabIndex={-1}
            />
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;
