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

  try {
    const [parametersResponse, templateResponse] = await Promise.all([
      axios.get(`${env.NEXTAUTH_URL}/api/parameters`, {
        params: { iri },
        headers: {
          Cookie: context.req.headers.cookie || "",
        },
      }),
      axios.get(`${env.NEXTAUTH_URL}/api/parameter/template`, {
        params: { iri },
        headers: {
          Cookie: context.req.headers.cookie || "",
        },
      }),
    ]);

    const initParameters = parametersResponse.data;
    const taskTemplate = templateResponse.data;

    if (!taskTemplate) {
      console.warn(`No task template found for IRI: ${iri}`);
    }

    return {
      props: {
        iri,
        baseUrl: env.NEXTAUTH_URL,
        explorerUrl: env.STARDOG_LAUNCHPAD,
        resultGraphDB: env.STARDOG_DB_RESULT_GRAPH,
        initParameters,
        taskTemplate,
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
