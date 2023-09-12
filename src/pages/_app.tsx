import Layout from "@/components/Layout";
import ThemeProvider from "@/context/ThemeProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "../stencil-components";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
