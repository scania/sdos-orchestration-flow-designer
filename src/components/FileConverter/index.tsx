import { env } from "@/lib/env";
import { getSession } from "next-auth/react";
import { useState, ChangeEvent } from "react";
import axios from "axios";
import styles from "./fileConverter.module.scss";

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
  /* return {
    props: {
      apiBaseUrl: env.NEXTAUTH_URL
    },
  }; */
}

export default function FileConverter({onFileConverted, apiBaseUrl }) {
  
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    axios.post(`http://localhost:3000/api/generate-context`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
    .then(response => {
      console.log(response.data); // Handle successful upload response
    })
    .catch(error => {
      console.error(error); // Handle upload errors
    });
  };

  return (
    <div className={styles.uploadContainer}>
      <label for="file-upload" className={styles.uploadContainer__uploadBtn}>
        {loading ? 'Loading' : 'Convert from file'}
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".ttl, .rdf"
        className={styles.uploadContainer__input}
        onChange={handleFileChange}
        disabled={loading}
      />
    </div>
  );
}
