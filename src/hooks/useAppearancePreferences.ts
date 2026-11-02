import { useEffect, useState } from "react"
import type { Language, Theme } from "../types"

export function useAppearancePreferences() {
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem("khadmaty-theme") === "dark" ? "dark" : "light"
  })
  const [language, setLanguage] = useState<Language>(() => {
    return localStorage.getItem("khadmaty-language") === "en" ? "en" : "ar"
  })

  useEffect(() => {
    localStorage.setItem("khadmaty-theme", theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem("khadmaty-language", language)
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  return { theme, setTheme, language, setLanguage }
}
