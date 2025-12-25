import { useEffect, useMemo } from "react";
import { getDicomPreview } from "./get_dicom_preview";

export function useDicomPreviews(files, dispatch, renderingEngine, tempElement) {
  const safeFiles = Array.isArray(files) ? files : [];

  const cachedPreviews = useMemo(() => {
    return safeFiles.reduce((acc, file) => {
      if (file.previewUrl) {
        acc[file.id] = file.previewUrl;
      }
      return acc;
    }, {});
  }, [safeFiles]);

  useEffect(() => {
    const generatePreviews = async () => { 
      if (!Array.isArray(files)) return;

      const previewPromises = files.map(async (file) => {
        if (!file.previewUrl && renderingEngine && tempElement) {
          try {
            const previewUrl = await getDicomPreview(file, renderingEngine, tempElement);
            
            if (previewUrl) {
              
              dispatch({
                type: "UPDATE_PREVIEW",
                payload: { id: file.id, url: previewUrl }
              });
            } else {
              console.warn(`No preview generated for ${file.id}`);
            }
          } catch (e) {
            console.error("Error generating preview:", e);
          }
        }
      });
      
      await Promise.all(previewPromises);
    };

    generatePreviews();
  }, [files, dispatch, renderingEngine, tempElement]);

  return cachedPreviews;
}