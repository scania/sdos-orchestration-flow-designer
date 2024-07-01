import { env } from "@/lib/env";
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
  return {
    props: {
      apiBaseUrl: env.NEXTAUTH_URL,
    },
  };
}

const Ofd = dynamic(() => import("./Ofd"), { ssr: false });

export default Ofd;
