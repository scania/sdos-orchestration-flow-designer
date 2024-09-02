import { env } from "@/lib/env";
import axios from "axios";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  const { iri } = context.params;
  return {
    props: {
      iri,
      baseUrl: env.NEXTAUTH_URL,
    },
  };
}

const Execute = dynamic(() => import("../Execute.tsx"), { ssr: false });

export default Execute;
