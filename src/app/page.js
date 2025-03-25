"use client";
import { motion } from "framer-motion";
import style from "./page.module.css";
import styles from "./Files/page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";


export default function Home() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState(null);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  async function handleDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) {
      console.log("No files dropped!");
      return;
    }

    setSelectedFiles(files);
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("http://localhost:3000/dicom/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const seriesInstance = response.headers.get("fileName");
      const metadata = JSON.parse(response.headers.get("X-Metadata"));
      const filePaths = metadata.map(item => item.filePath);

      const reader = response.body.getReader();
      let receivedData = [];
      let fileBlobs = [];

      const readStream = async ({ done, value }) => {
        if (done) {
          localStorage.setItem("dicomFilePaths", JSON.stringify(filePaths));
          toast("Uploaded successfully!");
          setTimeout(() => router.push(`/Files/${seriesInstance}`), 3000);
          return;
        }

        receivedData = receivedData.concat(Array.from(value));
        const separator = "---FILE_SEPARATOR---".split('').map(c => c.charCodeAt(0));
        const separatorIndex = receivedData.findIndex((_, i) =>
          receivedData.slice(i, i + separator.length).every((v, j) => v === separator[j])
        );

        if (separatorIndex !== -1) {
          const fileData = receivedData.slice(0, separatorIndex);
          const blob = new Blob([Uint8Array.from(fileData)], { type: "application/dicom" });
          fileBlobs.push(blob);
          receivedData = receivedData.slice(separatorIndex + separator.length);
        }

        reader.read().then(readStream);
      };

      reader.read().then(readStream);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed, try again!");
    }
  }

  return (
    <>
      <motion.div
        className={style.body}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 1 }}
          animate={{ opacity: 1 }}
          className={styles.title}
        >
          Kj Medical Dicom File Rendering :
        </motion.h1>
        <div className={style.BOXCon}>
          <div
            className={style.divClass}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h1 className={style.pr}>Drop files here</h1>
          </div>
        </div>
      </motion.div>
      {selectedFiles && (
        <ToastContainer
          position="bottom-center"
          progressClassName="fancy-progress-bar"
          toastStyle={{ background: "conic-gradient(#168aad, #06d6a0, #d9ed92)", color: "#000" }}
          autoClose={3000}
        />
      )}
    </>
  );
}


