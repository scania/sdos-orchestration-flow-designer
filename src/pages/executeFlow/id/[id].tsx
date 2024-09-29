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
    // Fetch the IRI
    const iriResponse = await axios.get(`${env.NEXTAUTH_URL}/api/flow/iri`, {
      params: { flowId: id },
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });
    const iri = iriResponse.data.iri;
    // Fetch the parameters associated with the flow
    const parametersResponse = await axios.get(
      `${env.NEXTAUTH_URL}/api/parameters`,
      {
        params: { flowId: id },
        headers: {
          Cookie: context.req.headers.cookie || "",
        },
      }
    );

    const initParameters = parametersResponse.data;

    return {
      props: {
        iri,
        flowId: id,
        baseUrl: env.NEXTAUTH_URL,
        initParameters,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      notFound: true,
    };
  }
}

const Execute = dynamic(() => import("../Execute"), { ssr: false });

export default Execute;
