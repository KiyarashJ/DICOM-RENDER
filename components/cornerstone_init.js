'use client'
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { init as csToolsInit} from "@cornerstonejs/tools";


let isCornerstoneInitialized = false;

export async function CornerstoneLibInitialize() {
  if (!isCornerstoneInitialized) {
    
    await csRenderInit();
    await dicomImageLoaderInit();
    await csToolsInit();
    isCornerstoneInitialized = true;
  }
}

