import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'ar' | 'fr';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY    = 'skywings_theme';
  private readonly LANG_KEY     = 'skywings_lang';
  private readonly CURRENCY_KEY = 'skywings_currency';

  // Signals
  readonly theme    = signal<Theme>(this.getSavedTheme());
  readonly language = signal<Language>(this.getSavedLang());
  readonly currency = signal<Currency>(this.getSavedCurrency());

  readonly isDark   = computed(() => this.theme() === 'dark');

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  setLanguage(lang: Language): void {
    this.language.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  setCurrency(currency: Currency): void {
    this.currency.set(currency);
    localStorage.setItem(this.CURRENCY_KEY, currency);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getSavedLang(): Language {
    const saved = localStorage.getItem(this.LANG_KEY);
    return (saved as Language) || 'en';
  }

  private getSavedCurrency(): Currency {
    const saved = localStorage.getItem(this.CURRENCY_KEY);
    return (saved as Currency) || 'INR';
  }
}
