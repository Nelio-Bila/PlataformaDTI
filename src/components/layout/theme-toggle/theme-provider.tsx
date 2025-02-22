// "use client";

// import { ThemeProvider as NextThemesProvider } from "next-themes";
// import { type ThemeProviderProps } from "next-themes/dist/types";

// export default function ThemeProvider({
//   children,
//   ...props
// }: ThemeProviderProps) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
// }






// theme-provider.tsx
"use client"

import { ThemeProvider as NextThemeProvider } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Get initial theme synchronously to prevent flash
  const [initialTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) return savedTheme

      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }
    return 'light' // Default for SSR
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }} data-initial-theme={initialTheme}>
        {children}
      </div>
    )
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem={true}
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}