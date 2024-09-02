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

  const { id } = context.params;

  try {
    const response = await axios.get(`${env.NEXTAUTH_URL}/api/flow/iri`, {
      params: { flowId: id },
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });

    const iri = response.data.iri;

    return {
      props: {
        iri,
        flowId: id,
        baseUrl: env.NEXTAUTH_URL,
      },
    };
  } catch (error) {
    console.error("Error fetching IRI:", error);

    return {
      notFound: true,
    };
  }
}

const Execute = dynamic(() => import("../Execute.tsx"), { ssr: false });

export default Execute;
