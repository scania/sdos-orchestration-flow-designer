import Layout from "@/components/Layout";
import ThemeProvider from "@/context/ThemeProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "../stencil-components";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider session={session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
