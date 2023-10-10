import Layout from "@/components/Layout";
import ThemeProvider from "@/context/ThemeProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "../stencil-components";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ThemeProvider>
  );
}
