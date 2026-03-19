"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", locale: "en-PK" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "\u20AC", name: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound", locale: "en-GB" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee", locale: "en-IN" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "ar-AE" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", locale: "ar-SA" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen", locale: "ja-JP" },
  { code: "TRY", symbol: "\u20BA", name: "Turkish Lira", locale: "tr-TR" },
];

interface CurrencyContextType {
  currency: CurrencyOption;
  setCurrency: (currency: CurrencyOption) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  formatAmount: (n) => String(n),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyOption>(CURRENCIES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("finance-app-currency");
    if (saved) {
      const parsed = JSON.parse(saved) as CurrencyOption;
      const found = CURRENCIES.find((c) => c.code === parsed.code);
      if (found) setCurrencyState(found);
    }
  }, []);

  const setCurrency = (c: CurrencyOption) => {
    setCurrencyState(c);
    localStorage.setItem("finance-app-currency", JSON.stringify(c));
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
