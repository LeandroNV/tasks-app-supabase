"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
export interface CountryCode {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
  pattern?: string;
}

export const countryCodes: CountryCode[] = [
  { name: "United States", flag: "🇺🇸", code: "US", dialCode: "+1" },
  { name: "Canada", flag: "🇨🇦", code: "CA", dialCode: "+1" },
  { name: "Mexico", flag: "🇲🇽", code: "MX", dialCode: "+52" },
  { name: "United Kingdom", flag: "🇬🇧", code: "GB", dialCode: "+44" },
  { name: "Spain", flag: "🇪🇸", code: "ES", dialCode: "+34" },
  { name: "France", flag: "🇫🇷", code: "FR", dialCode: "+33" },
  { name: "Germany", flag: "🇩🇪", code: "DE", dialCode: "+49" },
  { name: "Italy", flag: "🇮🇹", code: "IT", dialCode: "+39" },
  { name: "Argentina", flag: "🇦🇷", code: "AR", dialCode: "+54" },
  { name: "Brazil", flag: "🇧🇷", code: "BR", dialCode: "+55" },
  { name: "Colombia", flag: "🇨🇴", code: "CO", dialCode: "+57" },
  { name: "Chile", flag: "🇨🇱", code: "CL", dialCode: "+56" },
  { name: "Peru", flag: "🇵🇪", code: "PE", dialCode: "+51" },
  { name: "China", flag: "🇨🇳", code: "CN", dialCode: "+86" },
  { name: "Japan", flag: "🇯🇵", code: "JP", dialCode: "+81" },
  { name: "Australia", flag: "🇦🇺", code: "AU", dialCode: "+61" },
  { name: "India", flag: "🇮🇳", code: "IN", dialCode: "+91" },
  { name: "Russia", flag: "🇷🇺", code: "RU", dialCode: "+7" },
  { name: "South Korea", flag: "🇰🇷", code: "KR", dialCode: "+82" },
  { name: "Turkey", flag: "🇹🇷", code: "TR", dialCode: "+90" },
  { name: "Venezuela", flag: "🇻🇪", code: "VE", dialCode: "+58" },
];

// País por defecto
export const defaultCountry: CountryCode = {
  name: "United States",
  flag: "🇺🇸",
  code: "US",
  dialCode: "+1",
};
// Props del componente
interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  defaultCountryCode?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Componente de botón para shadcn
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";

// Componente de input para shadcn
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      onCountryChange,
      defaultCountryCode = "CO",
      className,
      error,
      disabled,
      placeholder = "Phone number",
      ...props
    },
    ref,
  ) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
      countryCodes.find((country) => country.code === defaultCountryCode) ||
        defaultCountry,
    );
    const [phoneNumber, setPhoneNumber] = useState<string>(
      value.replace(selectedCountry.dialCode, ""),
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Filtrar países basado en la búsqueda
    const filteredCountries = countryCodes.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Manejar clic fuera del dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Manejar cambio de número
    const handlePhoneNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const input = e.target.value.replace(/\D/g, "");
      setPhoneNumber(input);

      if (onChange) {
        onChange(selectedCountry.dialCode + input);
      }
    };

    // Manejar cambio de país
    const handleCountrySelect = (country: CountryCode) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);
      setSearchQuery("");

      if (onCountryChange) {
        onCountryChange(country);
      }

      if (onChange) {
        onChange(country.dialCode + phoneNumber);
      }
    };

    // Formatear número de teléfono para display
    const formatPhoneNumber = (value: string) => {
      if (!value) return "";

      // Formato básico para números internacionales
      const cleaned = value.replace(/\D/g, "");

      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      } else {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
      }
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        <div className="flex items-center gap-2">
          {/* Selector de país */}
          <div className="relative bg-background">
            <Button
              ref={buttonRef}
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
              className={cn(
                "h-10 px-3 py-2 border rounded-md flex items-center gap-2 min-w-[120px] justify-between",
                error && "border-destructive",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </Button>

            {/* Dropdown de países */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute bottom-full left-0 mt-1 z-50 w-80 bg-background border rounded-md shadow-lg overflow-hidden"
              >
                {/* Buscador */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        type="button"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de países */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No countries found
                    </div>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between transition-colors",
                          selectedCountry.code === country.code && "bg-accent",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{country.flag}</span>
                          <span className="font-medium">{country.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-sm">{country.dialCode}</span>
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            {country.code}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input de número de teléfono */}
          <div className="flex-1">
            <Input
              type="tel"
              value={formatPhoneNumber(phoneNumber)}
              onChange={handlePhoneNumberChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full",
                error && "border-destructive focus-visible:ring-destructive",
              )}
              {...props}
            />
          </div>
        </div>
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
