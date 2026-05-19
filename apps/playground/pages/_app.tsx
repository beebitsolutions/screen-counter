// Pages Router fixture: must NOT count (special top-level file).
import type { AppProps } from 'next/app';

export default function LegacyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
