import Layout from "@/components/Layout";
import ThemeProvider from "@/context/ThemeProvider";
import "@/styles/globals.css";
import Toast from "@/components/Toast/Toast";
import type { AppProps } from "next/app";
// import "../stencil-components";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { defineCustomElements } from "@scania/tegel-react";
import { useEffect } from "react";
const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useEffect(() => {
    defineCustomElements();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider session={session}>
          <Layout>
            <Component {...pageProps} />
            <Toast />
          </Layout>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
