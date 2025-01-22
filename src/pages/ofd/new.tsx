import { env } from "@/lib/env";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import axios from "axios";

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

  const baseUrl = env.NEXTAUTH_URL;

  const { name, description, bypassCheck } = context.query;

  if (!name) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (bypassCheck !== "true") {
    try {
      const encodedName = encodeURIComponent(
        `https://kg.scania.com/iris_orchestration/${name}`
      );
      const response = await axios.get(
        `${baseUrl}/api/flow/name-exists/${encodedName}`,
        {
          headers: {
            cookie: context.req.headers.cookie ?? "",
          },
        }
      );

      if (response.data === true) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    } catch (err) {
      console.error("Error checking name existence:", err);
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      apiBaseUrl: baseUrl,
      graphName: name,
      description: description || "",
    },
  };
}

const Ofd = dynamic(() => import("./Ofd"), { ssr: false });

export default Ofd;
