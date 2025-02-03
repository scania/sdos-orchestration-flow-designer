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
}

export default function FileConverter() {
  
  const [loading, setLoading] = useState<boolean>(false);
  const [convertedData, setConvertedData] = useState<String>('')

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await axios.post("/api/generate-context", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setConvertedData(JSON.stringify(response.data.data));
    } catch (error) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <label for="file-upload" className={styles.uploadContainer__uploadBtn}>
        {loading ? 'Loading' : 'Convert from file'}
      </label>
      
      <div style={{width: '200px', display: 'block'}}>Converted data: {convertedData}</div>
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
