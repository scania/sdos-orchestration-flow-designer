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
  const parametersResponse = await axios.get(
    `${env.NEXTAUTH_URL}/api/parameters`,
    {
      params: { iri },
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    }
  );

  const initParameters = parametersResponse.data;
  console.log(initParameters, "initial parameters with iri");

  return {
    props: {
      iri,
      baseUrl: env.NEXTAUTH_URL,
      initParameters,
    },
  };
}

const Execute = dynamic(() => import("../Execute"), { ssr: false });

export default Execute;
