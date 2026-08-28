'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ComponentProps } from 'react';

type NextThemesProps = ComponentProps<typeof NextThemesProvider>;

export interface ThemeProviderProps extends NextThemesProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
