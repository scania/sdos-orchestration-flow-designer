import { useState, ChangeEvent } from "react";
import styles from "./fileConverter.module.scss";

export default function FileConverter({onFileConverted }) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("/api/convert-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to convert file.");
      }

      // TODO - handle the real response
      
    } catch (error) {
      console.log("Error");
    } finally {
        // placeholder to fake async call and sucessfull response, need it to handle the "loading" state and style it
        setTimeout(function() {
            const convertedResponse = 'Just writing something here in order to test it out'
            onFileConverted(convertedResponse);
            setLoading(false);
        }, 2000);
    }
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
