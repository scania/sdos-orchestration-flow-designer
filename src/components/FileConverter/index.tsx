import { getSession } from "next-auth/react";
import { useState, useCallback, ChangeEvent } from "react";
import { useToast } from "@/hooks/useToast";
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
interface FileConverterProps {
  onFileConverted: (data: string) => void;
}

export default function FileConverter({ onFileConverted }: FileConverterProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

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
      onFileConverted(JSON.stringify(response.data.data));
      showToast("success", "Success", "File content has been converted!", 3000);
    } catch (error) {
        const errorMessage = error.response?.data?.messages?.[0] || "An unexpected error occurred";
        showToast("error", "Error", `${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <label for="file-upload" className={styles.uploadContainer__uploadBtn}>
        {loading ? "Loading" : "Convert from file"}
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
