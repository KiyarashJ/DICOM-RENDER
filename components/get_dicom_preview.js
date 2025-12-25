import { CornerstoneLibInitialize } from "./cornerstone_init";
import { Enums } from "@cornerstonejs/core";

export async function getDicomPreview(file, renderingEngine, tempElement) {
  try {
    await CornerstoneLibInitialize();

    const viewportId = "previewViewport";
    const viewportInput = {
      viewportId,
      type: Enums.ViewportType.STACK,
      element: tempElement,
    };

    if (!renderingEngine.getViewport(viewportId)) {
      renderingEngine.enableElement(viewportInput);
    }

    const viewport = renderingEngine.getViewport(viewportId);
    if (!viewport) throw new Error("Viewport not initialized");

    const imageId = `wadouri:${file.url}`;
    await viewport.setStack([imageId], 0);
    viewport.render();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = tempElement.querySelector("canvas");
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas not properly initialized or has zero size");
    }

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = canvas.width;
    fullCanvas.height = canvas.height;
    const fullCtx = fullCanvas.getContext("2d");
    fullCtx.drawImage(canvas, 0, 0);

    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = 100;
    previewCanvas.height = 100;
    const previewCtx = previewCanvas.getContext("2d");
    previewCtx.fillStyle = "black";
    previewCtx.fillRect(0, 0, 100, 100);

    const scaleFactor = Math.min(100 / canvas.width, 100 / canvas.height);
    const scaledWidth = canvas.width * scaleFactor;
    const scaledHeight = canvas.height * scaleFactor;
    const x = (100 - scaledWidth) / 2;
    const y = (100 - scaledHeight) / 2;

    previewCtx.drawImage(fullCanvas, 0, 0, canvas.width, canvas.height, x, y, scaledWidth, scaledHeight);

    const previewUrl = previewCanvas.toDataURL();
    console.log(`Preview generated for ${file.id}: ${previewUrl ? "Success" : "Failed"}`);
    return previewUrl;
  } catch (error) {
    console.error("Error generating preview for", file.id, error);
    return null;
  }
}