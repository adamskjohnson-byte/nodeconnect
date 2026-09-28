import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import en, { type Translation, type TranslationKey } from './locales/en'

export const languages = [
  { code: 'en', label: 'English', direction: 'ltr' },
  { code: 'fr', label: 'Français', direction: 'ltr' },
  { code: 'es', label: 'Español', direction: 'ltr' },
  { code: 'pt', label: 'Português', direction: 'ltr' },
  { code: 'de', label: 'Deutsch', direction: 'ltr' },
  { code: 'it', label: 'Italiano', direction: 'ltr' },
  { code: 'nl', label: 'Nederlands', direction: 'ltr' },
  { code: 'ru', label: 'Русский', direction: 'ltr' },
  { code: 'uk', label: 'Українська', direction: 'ltr' },
  { code: 'pl', label: 'Polski', direction: 'ltr' },
  { code: 'tr', label: 'Türkçe', direction: 'ltr' },
  { code: 'ar', label: 'العربية', direction: 'rtl' },
  { code: 'zh-CN', label: '简体中文', direction: 'ltr' },
  { code: 'zh-TW', label: '繁體中文', direction: 'ltr' },
  { code: 'ja', label: '日本語', direction: 'ltr' },
  { code: 'ko', label: '한국어', direction: 'ltr' },
  { code: 'hi', label: 'हिन्दी', direction: 'ltr' },
  { code: 'id', label: 'Bahasa Indonesia', direction: 'ltr' },
  { code: 'vi', label: 'Tiếng Việt', direction: 'ltr' },
  { code: 'th', label: 'ไทย', direction: 'ltr' },
  { code: 'bn', label: 'বাংলা', direction: 'ltr' },
  { code: 'ro', label: 'Română', direction: 'ltr' },
  { code: 'el', label: 'Ελληνικά', direction: 'ltr' },
  { code: 'sk', label: 'Slovenčina', direction: 'ltr' },
  { code: 'zu', label: 'isiZulu', direction: 'ltr' },
] as const

export type LanguageCode = typeof languages[number]['code']

function cachedLanguage(): LanguageCode {
  try {
    const preferences = JSON.parse(localStorage.getItem('nodeconnect_preferences') || '{}') as { language?: string }
    return languages.some((language) => language.code === preferences.language) ? preferences.language as LanguageCode : 'en'
  } catch {
    return 'en'
  }
}

export function languageDirection(language: string): 'ltr' | 'rtl' {
  return languages.find((item) => item.code === language)?.direction || 'ltr'
}

async function loadTranslation(language: Exclude<LanguageCode, 'en'>): Promise<Translation> {
  switch (language) {
    case 'fr': return (await import('./locales/fr')).default
    case 'es': return (await import('./locales/es')).default
    case 'pt': return (await import('./locales/pt')).default
    case 'de': return (await import('./locales/de')).default
    case 'it': return (await import('./locales/it')).default
    case 'nl': return (await import('./locales/nl')).default
    case 'ru': return (await import('./locales/ru')).default
    case 'uk': return (await import('./locales/uk')).default
    case 'pl': return (await import('./locales/pl')).default
    case 'tr': return (await import('./locales/tr')).default
    case 'ar': return (await import('./locales/ar')).default
    case 'zh-CN': return (await import('./locales/zh-CN')).default
    case 'zh-TW': return (await import('./locales/zh-TW')).default
    case 'ja': return (await import('./locales/ja')).default
    case 'ko': return (await import('./locales/ko')).default
    case 'hi': return (await import('./locales/hi')).default
    case 'id': return (await import('./locales/id')).default
    case 'vi': return (await import('./locales/vi')).default
    case 'th': return (await import('./locales/th')).default
    case 'bn': return (await import('./locales/bn')).default
    case 'ro': return (await import('./locales/ro')).default
    case 'el': return (await import('./locales/el')).default
    case 'sk': return (await import('./locales/sk')).default
    case 'zu': return (await import('./locales/zu')).default
  }
}

export const i18n = i18next
const initialized = i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export async function changeAppLanguage(language: string): Promise<void> {
  const selected = languages.some((item) => item.code === language) ? language as LanguageCode : 'en'
  await initialized
  if (selected !== 'en' && !i18n.hasResourceBundle(selected, 'translation')) {
    const translation = await loadTranslation(selected)
    i18n.addResourceBundle(selected, 'translation', translation, true, true)
  }
  await i18n.changeLanguage(selected)
}

i18n.on('languageChanged', (language) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
  document.documentElement.dir = languageDirection(language)
})

export const i18nReady = changeAppLanguage(cachedLanguage())

export function useAppTranslation(): (key: string, options?: Record<string, unknown>) => string {
  const { t, i18n: instance } = useTranslation()
  return (key, options) => {
    if (import.meta.env.DEV && !instance.exists(key as TranslationKey, { lng: instance.language, fallbackLng: false })) {
      return `⟦${key}⟧`
    }
    return t(key as TranslationKey, options)
  }
}