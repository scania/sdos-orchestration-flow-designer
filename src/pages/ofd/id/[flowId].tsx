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
  const { flowId } = context.params;
  const { data } = await axios.get(`${env.NEXTAUTH_URL}/api/flow/${flowId}`, {
    headers: {
      cookie: context.req.headers.cookie, // Forward the session cookie
    },
  });
  const { state, name, description } = data;
  const { nodes, edges } = JSON.parse(state);
  return {
    props: {
      apiBaseUrl: env.NEXTAUTH_URL,
      initNodes: nodes,
      initEdges: edges,
      graphName: name.split("/").pop(),
      description,
    },
  };
}

const Ofd = dynamic(() => import("../Ofd"), { ssr: false });

export default Ofd;
