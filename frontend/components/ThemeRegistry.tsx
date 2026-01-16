'use client';

import * as React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, CssBaseline } from '@mui/material';
import darkTheme from '@/app/theme';


let clientSideEmotionCache: EmotionCache | null = null;
function getClientSideEmotionCache() {
  if (!clientSideEmotionCache) {
    clientSideEmotionCache = createCache({ key: 'css', prepend: true });
  }
  return clientSideEmotionCache;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => getClientSideEmotionCache(), []);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
