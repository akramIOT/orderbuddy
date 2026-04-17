const getBrowserLang = (): string => {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language || navigator.language;

  return browserLang.split('-')[0];
};

export const getUserLang = (): string => {
  if (typeof window === 'undefined') return 'en';

  return localStorage.getItem('ob.lang') || getBrowserLang() || 'en';
};

export const t = (i18nField: Record<string, string>, lang: string): string => {
  return i18nField[lang] || i18nField['en'];
};
