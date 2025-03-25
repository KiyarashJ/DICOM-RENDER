// ========================>                    THIS IS STABLE CODE FOR MY FREELANCE AND MUST BE BUILT OTHER VERSION TO COMPANY PROJECT ===================================











// "use client";
// import { useParams } from "next/navigation";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { RenderingEngine, Enums } from "@cornerstonejs/core";
// import { init as csRenderInit } from "@cornerstonejs/core";
// import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
// import { init as csToolsInit, ToolGroupManager } from "@cornerstonejs/tools";
// import * as csTools3d from "@cornerstonejs/tools";
// import Image from "next/image";
// import styles from "./../page.module.css";
// import {
//   WindowLevelTool,
//   PanTool,
//   StackScrollTool,
//   ZoomTool,
//   MagnifyTool,
//   LengthTool,
//   PlanarRotateTool,
//   CircleROITool,
//   RectangleROITool,
//   HeightTool,
//   ProbeTool,
//   AngleTool,
//   DragProbeTool,
//   CobbAngleTool,
//   ETDRSGridTool,
//   SplineROITool,
//   ArrowAnnotateTool,
// } from "@cornerstonejs/tools";



// class PlayTool extends csTools3d.BaseTool {
//   constructor() {
//     super({
//       toolName: "PlayTool",
//     });
//   }

//   playStack(viewport, imageIds) {
//     let index = 0;
//     const playInterval = setInterval(() => {
//       if (index >= imageIds.length) index = 0;
//       viewport.setStack(imageIds, index);
//       viewport.render();
//       index++;
//     }, 500);
//     return () => clearInterval(playInterval);
//   }

//   mouseDownActivate(evt) {
//     const viewport = evt.detail.viewport;
//     const imageIds = viewport.getImageIds();
//     const stopPlay = this.playStack(viewport, imageIds);
//     setTimeout(stopPlay, 10000);
//   }
// }

// let isCornerstoneInitialized = false;

// async function CornerstoneLibInitialize() {
//   if (!isCornerstoneInitialized) {
//     await csRenderInit();
//     await dicomImageLoaderInit();
//     await csToolsInit();
//     isCornerstoneInitialized = true;
//   }
// }

// async function getDicomPreview(file, renderingEngine, tempElement) {
//   try {
//     await CornerstoneLibInitialize();

//     const viewportId = "previewViewport";
//     const viewportInput = {
//       viewportId,
//       type: Enums.ViewportType.STACK,
//       element: tempElement,
//     };

//     if (!renderingEngine.getViewport(viewportId)) {
//       renderingEngine.enableElement(viewportInput);
//     }

//     const viewport = renderingEngine.getViewport(viewportId);
//     if (!viewport) throw new Error("Viewport not initialized");

//     console.log(`Rendering preview for ${file.id} with URL: ${file.url}`);
//     const imageId = `wadouri:${file.url}`;
//     await viewport.setStack([imageId], 0);
//     viewport.render();

//     await new Promise((resolve) => setTimeout(resolve, 100));

//     const canvas = tempElement.querySelector("canvas");
//     if (!canvas || canvas.width === 0 || canvas.height === 0) {
//       throw new Error("Canvas not properly initialized or has zero size");
//     }

//     const fullCanvas = document.createElement("canvas");
//     fullCanvas.width = canvas.width;
//     fullCanvas.height = canvas.height;
//     const fullCtx = fullCanvas.getContext("2d");
//     fullCtx.drawImage(canvas, 0, 0);

//     const previewCanvas = document.createElement("canvas");
//     previewCanvas.width = 100;
//     previewCanvas.height = 100;
//     const previewCtx = previewCanvas.getContext("2d");
//     previewCtx.fillStyle = "black";
//     previewCtx.fillRect(0, 0, 100, 100);

//     const scaleFactor = Math.min(100 / canvas.width, 100 / canvas.height);
//     const scaledWidth = canvas.width * scaleFactor;
//     const scaledHeight = canvas.height * scaleFactor;
//     const x = (100 - scaledWidth) / 2;
//     const y = (100 - scaledHeight) / 2;

//     previewCtx.drawImage(fullCanvas, 0, 0, canvas.width, canvas.height, x, y, scaledWidth, scaledHeight);

//     const previewUrl = previewCanvas.toDataURL();

//     console.log(`Preview generated for ${file.id}: ${previewUrl ? "Success" : "Failed"}`);
//     return previewUrl;
//   } catch (error) {
//     console.error("Error generating preview for", file.id, error);
//     return null;
//   }
// }

// async function renderDicomImage(element, imageIds, selectedIndex, renderingEngine) {
//   const viewportId = "CT_VIEWPORT";

//   await CornerstoneLibInitialize();

//   const viewportInput = {
//     viewportId,
//     type: Enums.ViewportType.STACK,
//     element,
//   };

//   if (!renderingEngine.getViewport(viewportId)) {
//     renderingEngine.enableElement(viewportInput);
//   }

//   const viewport = renderingEngine.getViewport(viewportId);
//   viewport.setStack(imageIds, selectedIndex);
//   viewport.render();

//   return viewport;
// }

// export default function DicomViewerPage() {
//   const params = useParams();
//   const viewerRef = useRef(null);
//   const ctToolGroupRef = useRef(null);
//   const renderingEngineRef = useRef(null);
//   const mainRenderingEngineRef = useRef(null);
//   const tempElementRef = useRef(null);
//   const [files, setFiles] = useState([]);
//   const [selectedImageId, setSelectedImageId] = useState(null);
//   const [tools, setTools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [visiblePreviews, setVisiblePreviews] = useState({});
//   const [isPlaying, setIsPlaying] = useState(false); // حالت پخش اسلایدشو

//   const cachedFiles = useMemo(() => {
//     const cached = localStorage.getItem("dicomFilePaths");
//     if (cached) {
//       const filePaths = JSON.parse(cached);
//       return filePaths.map((filePath, index) => ({
//         id: `file-${index}`,
//         path: filePath,
//       }));
//     }
//     return [];
//   }, []);

//   useEffect(() => {
//     const setupRenderingEngines = async () => {
//       await CornerstoneLibInitialize();
//       if (!renderingEngineRef.current) {
//         renderingEngineRef.current = new RenderingEngine("previewEngine");
//         tempElementRef.current = document.createElement("div");
//         tempElementRef.current.style.position = "absolute";
//         tempElementRef.current.style.visibility = "hidden";
//         tempElementRef.current.style.width = "100px";
//         tempElementRef.current.style.height = "100px";
//         document.body.appendChild(tempElementRef.current);
//       }
//       if (!mainRenderingEngineRef.current) {
//         mainRenderingEngineRef.current = new RenderingEngine("mainEngine");
//       }
//     };

//     const loadFiles = async () => {
//       try {
//         setLoading(true);
//         let fileList = cachedFiles;

//         if (fileList.length === 0) {
//           const filePaths = JSON.parse(localStorage.getItem("dicomFilePaths") || "[]");
//           if (filePaths.length === 0) throw new Error("No files found");

//           const filePromises = filePaths.map(async (filePath, index) => {
//             const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(filePath)}`);
//             if (!response.ok) throw new Error("Failed to fetch file");
//             const blob = await response.blob();
//             return {
//               id: `file-${index}`,
//               url: URL.createObjectURL(blob),
//               path: filePath,
//             };
//           });

//           fileList = await Promise.all(filePromises);
//         } else {
//           const filePromises = fileList.map(async (file) => {
//             const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(file.path)}`);
//             if (!response.ok) throw new Error("Failed to fetch file");
//             const blob = await response.blob();
//             return {
//               ...file,
//               url: URL.createObjectURL(blob),
//             };
//           });
//           fileList = await Promise.all(filePromises);
//         }

//         console.log("Files loaded:", fileList);
//         setFiles(fileList);

//         await setupRenderingEngines();

//         const processPreviewQueue = async () => {
//           for (let i = 0; i < fileList.length; i++) {
//             const file = fileList[i];
//             const previewUrl = await getDicomPreview(file, renderingEngineRef.current, tempElementRef.current);
//             if (previewUrl) {
//               setFiles((prevFiles) =>
//                 prevFiles.map((f) =>
//                   f.id === file.id ? { ...f, previewUrl } : f
//                 )
//               );
//               setVisiblePreviews((prev) => ({ ...prev, [file.id]: true }));
//             } else {
//               console.warn(`No preview generated for ${file.id}`);
//             }
//             await new Promise((resolve) => setTimeout(resolve, 3000));
//           }
//         };

//         processPreviewQueue();

//         setSelectedImageId(fileList.length > 0 ? fileList[0].id : null);
//       } catch (err) {
//         setError(err);
//         console.error("Load error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadFiles();

//     return () => {
//       if (renderingEngineRef.current) {
//         renderingEngineRef.current.destroy();
//         if (tempElementRef.current) document.body.removeChild(tempElementRef.current);
//       }
//       if (mainRenderingEngineRef.current) {
//         mainRenderingEngineRef.current.destroy();
//       }
//     };
//   }, [cachedFiles]);

//   // اسلایدشو خودکار برای پیش‌نمایش‌ها
//   useEffect(() => {
//     let interval;
//     if (isPlaying && files.length > 0) {
//       interval = setInterval(() => {
//         setSelectedImageId((prevId) => {
//           const currentIndex = files.findIndex((f) => f.id === prevId);
//           const nextIndex = (currentIndex + 1) % files.length; // چرخش بین فایل‌ها
//           return files[nextIndex].id;
//         });
//       }, 500); // هر 2 ثانیه یه فایل جدید
//     }
//     return () => clearInterval(interval); // تمیز کردن موقع توقف
//   }, [isPlaying, files]);

//   useEffect(() => {
//     if (selectedImageId && viewerRef.current && mainRenderingEngineRef.current) {
//       const selectedIndex = files.findIndex((f) => f.id === selectedImageId);
//       if (selectedIndex !== -1) {
//         const imageIds = files.map((f) => `wadouri:${f.url}`);
//         renderDicomImage(viewerRef.current, imageIds, selectedIndex, mainRenderingEngineRef.current).then((viewport) => {
//           const tools = [
//             WindowLevelTool,
//             PanTool,
//             StackScrollTool,
//             ZoomTool,
//             MagnifyTool,
//             LengthTool,
//             PlanarRotateTool,
//             CircleROITool,
//             RectangleROITool,
//             HeightTool,
//             ProbeTool,
//             AngleTool,
//             DragProbeTool,
//             CobbAngleTool,
//             ETDRSGridTool,
//             SplineROITool,
//             ArrowAnnotateTool,
//             PlayTool,
//           ];

//           tools.forEach((tool) => csTools3d.addTool(tool));

//           const toolGroupId = "ctToolGroup";
//           let ctToolGroup = ToolGroupManager.getToolGroup(toolGroupId);

//           if (!ctToolGroup) {
//             ctToolGroup = ToolGroupManager.createToolGroup(toolGroupId);
//             tools.forEach((tool) => ctToolGroup.addTool(tool.toolName));
//             ctToolGroup.addViewport("CT_VIEWPORT", "mainEngine");
//           } else {
//             tools.forEach((tool) => ctToolGroup.setToolDisabled(tool.toolName));
//           }

//           setTools(tools);
//           ctToolGroupRef.current = ctToolGroup;
//           viewerRef.current.style.opacity = 1;
//         });
//       }
//     }
//   }, [selectedImageId, files]);

//   const activateTool = (toolName) => {
//     if (ctToolGroupRef.current) {
//       tools.forEach((tool) => ctToolGroupRef.current.setToolDisabled(tool.toolName));
//       if (toolName === "PlayTool") {
//         ctToolGroupRef.current.setToolActive("PlayTool", {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       } else {
//         ctToolGroupRef.current.setToolActive(toolName, {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       }
//     }
//   };

//   // تابع تاگل Play/Stop
//   const togglePlay = () => {
//     setIsPlaying((prev) => !prev);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div className={styles.AllCon}>
//       <aside className={styles.aside}>
//         <h2>Files</h2>
//         {files.map((file) => (
//           <div
//             key={file.id}
//             onClick={() => setSelectedImageId(file.id)}
//             className={`${styles.fileSelection} ${visiblePreviews[file.id] ? styles.visible : ''}`}
//             style={{
//               background: selectedImageId === file.id ? "conic-gradient(#168aad, #06d6a0, #d9ed92)" : "transparent",
//             }}
//           >
//             {file.previewUrl && visiblePreviews[file.id] ? (
//               <Image
//                 src={file.previewUrl}
//                 width={100}
//                 height={100}
//                 className={styles.preview}
//                 alt={`Preview of ${file.id}`}
//               />
//             ) : (
//               <div>Loading preview...</div>
//             )}
//           </div>
//         ))}
//       </aside>
//       <div className={styles.buttonCon}>
//         <h1 className={styles.title}>DICOM MEDICAL FILE:</h1>
//         <div className={styles.tools}>
//           {tools.map((tool) => (
//             <button
//               key={tool.toolName}
//               onClick={() => activateTool(tool.toolName)}
//               className={styles.btnTool}
//             >
//               {tool.toolName}
//             </button>
//           ))}
//           <button
//             onClick={togglePlay}
//             className={styles.btnTool} 
//           >
//             {isPlaying ? "Stop" : "Play"}
//           </button>
//         </div>
//         <div ref={viewerRef} className={styles.viewer} />
//       </div>
//     </div>
//   );
// }





















// ===================================================== THIS CODE IS FOR TEST AND FOR MPR TESTING ==================================



// "use client";
// import { useParams } from "next/navigation";
// import { useEffect, useRef, useState, useMemo } from "react";
// import { RenderingEngine, Enums, volumeLoader } from "@cornerstonejs/core";
// import { init as csRenderInit } from "@cornerstonejs/core";
// import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
// import { init as csToolsInit, ToolGroupManager } from "@cornerstonejs/tools";
// import * as csTools3d from "@cornerstonejs/tools";
// import Image from "next/image";
// import styles from "./../page.module.css";
// import {
//   WindowLevelTool,
//   PanTool,
//   StackScrollTool,
//   ZoomTool,
//   MagnifyTool,
//   LengthTool,
//   PlanarRotateTool,
//   CircleROITool,
//   RectangleROITool,
//   HeightTool,
//   ProbeTool,
//   AngleTool,
//   DragProbeTool,
//   CobbAngleTool,
//   ETDRSGridTool,
//   SplineROITool,
//   ArrowAnnotateTool,
//   CrosshairsTool,
// } from "@cornerstonejs/tools";

// class PlayTool extends csTools3d.BaseTool {
//   constructor() {
//     super({
//       toolName: "PlayTool",
//     });
//   }

//   playStack(viewport, imageIds) {
//     let index = 0;
//     const playInterval = setInterval(() => {
//       if (index >= imageIds.length) index = 0;
//       viewport.setStack(imageIds, index);
//       viewport.render();
//       index++;
//     }, 500);
//     return () => clearInterval(playInterval);
//   }

//   mouseDownActivate(evt) {
//     const viewport = evt.detail.viewport;
//     const imageIds = viewport.getImageIds();
//     const stopPlay = this.playStack(viewport, imageIds);
//     setTimeout(stopPlay, 10000);
//   }
// }

// let isCornerstoneInitialized = false;

// async function CornerstoneLibInitialize() {
//   if (!isCornerstoneInitialized) {
//     await csRenderInit();
//     await dicomImageLoaderInit();
//     await csToolsInit();
//     isCornerstoneInitialized = true;
//   }
// }

// async function getDicomPreview(file, renderingEngine, tempElement) {
//   try {
//     await CornerstoneLibInitialize();

//     const viewportId = "previewViewport";
//     const viewportInput = {
//       viewportId,
//       type: Enums.ViewportType.STACK,
//       element: tempElement,
//     };

//     if (!renderingEngine.getViewport(viewportId)) {
//       renderingEngine.enableElement(viewportInput);
//     }

//     const viewport = renderingEngine.getViewport(viewportId);
//     if (!viewport) throw new Error("Viewport not initialized");

//     console.log(`Rendering preview for ${file.id} with URL: ${file.url}`);
//     const imageId = `wadouri:${file.url}`;
//     await viewport.setStack([imageId], 0);
//     viewport.render();

//     await new Promise((resolve) => setTimeout(resolve, 100));

//     const canvas = tempElement.querySelector("canvas");
//     if (!canvas || canvas.width === 0 || canvas.height === 0) {
//       throw new Error("Canvas not properly initialized or has zero size");
//     }

//     const fullCanvas = document.createElement("canvas");
//     fullCanvas.width = canvas.width;
//     fullCanvas.height = canvas.height;
//     const fullCtx = fullCanvas.getContext("2d");
//     fullCtx.drawImage(canvas, 0, 0);

//     const previewCanvas = document.createElement("canvas");
//     previewCanvas.width = 100;
//     previewCanvas.height = 100;
//     const previewCtx = previewCanvas.getContext("2d");
//     previewCtx.fillStyle = "black";
//     previewCtx.fillRect(0, 0, 100, 100);

//     const scaleFactor = Math.min(100 / canvas.width, 100 / canvas.height);
//     const scaledWidth = canvas.width * scaleFactor;
//     const scaledHeight = canvas.height * scaleFactor;
//     const x = (100 - scaledWidth) / 2;
//     const y = (100 - scaledHeight) / 2;

//     previewCtx.drawImage(fullCanvas, 0, 0, canvas.width, canvas.height, x, y, scaledWidth, scaledHeight);

//     const previewUrl = previewCanvas.toDataURL();

//     console.log(`Preview generated for ${file.id}: ${previewUrl ? "Success" : "Failed"}`);
//     return previewUrl;
//   } catch (error) {
//     console.error("Error generating preview for", file.id, error);
//     return null;
//   }
// }

// async function renderDicomImage(elements, imageIds, selectedIndex, renderingEngine, isMPREnabled) {
//   await CornerstoneLibInitialize();

//   const viewportIds = {
//     stack: "stackViewport",
//     axial: "axialViewport",
//     sagittal: "sagittalViewport",
//     coronal: "coronalViewport",
//   };

//   if (isMPREnabled) {
//     renderingEngine.setViewports([
//       {
//         viewportId: viewportIds.axial,
//         type: Enums.ViewportType.ORTHOGRAPHIC,
//         element: elements.axial,
//         defaultOptions: { orientation: Enums.OrientationAxis.AXIAL, resolution: { width: 512, height: 512 }, antiAliasing: true },
//       },
//       {
//         viewportId: viewportIds.sagittal,
//         type: Enums.ViewportType.ORTHOGRAPHIC,
//         element: elements.sagittal,
//         defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL, resolution: { width: 512, height: 512 }, antiAliasing: true },
//       },
//       {
//         viewportId: viewportIds.coronal,
//         type: Enums.ViewportType.ORTHOGRAPHIC,
//         element: elements.coronal,
//         defaultOptions: { orientation: Enums.OrientationAxis.CORONAL, resolution: { width: 512, height: 512 }, antiAliasing: true },
//       },
//     ]);

//     const volumeId = "myVolume";
//     const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });

//     Object.values(viewportIds).slice(1).forEach((viewportId) => {
//       const viewport = renderingEngine.getViewport(viewportId);
//       viewport.setVolumes([{ volumeId }]);
//       viewport.render();
//     });
//   } else {
//     renderingEngine.setViewports([
//       {
//         viewportId: viewportIds.stack,
//         type: Enums.ViewportType.STACK,
//         element: elements.stack,
//         defaultOptions: {},
//       },
//     ]);

//     const viewport = renderingEngine.getViewport(viewportIds.stack);
//     await viewport.setStack(imageIds, selectedIndex);
//     viewport.render();
//   }

//   return viewportIds;
// }

// export default function DicomViewerPage() {
//   const params = useParams();
//   const viewerRef = useRef({ stack: null, axial: null, sagittal: null, coronal: null });
//   const ctToolGroupRef = useRef(null);
//   const renderingEngineRef = useRef(null);
//   const mainRenderingEngineRef = useRef(null);
//   const tempElementRef = useRef(null);
//   const [files, setFiles] = useState([]);
//   const [selectedImageId, setSelectedImageId] = useState(null);
//   const [tools, setTools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [visiblePreviews, setVisiblePreviews] = useState({});
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMPREnabled, setIsMPREnabled] = useState(false);

//   const cachedFiles = useMemo(() => {
//     const cached = localStorage.getItem("dicomFilePaths");
//     if (cached) {
//       const filePaths = JSON.parse(cached);
//       return filePaths.map((filePath, index) => ({
//         id: `file-${index}`,
//         path: filePath,
//       }));
//     }
//     return [];
//   }, []);

//   useEffect(() => {
//     const setupRenderingEngines = async () => {
//       await CornerstoneLibInitialize();
//       if (!renderingEngineRef.current) {
//         renderingEngineRef.current = new RenderingEngine("previewEngine");
//         tempElementRef.current = document.createElement("div");
//         tempElementRef.current.style.position = "absolute";
//         tempElementRef.current.style.visibility = "hidden";
//         tempElementRef.current.style.width = "100px";
//         tempElementRef.current.style.height = "100px";
//         document.body.appendChild(tempElementRef.current);
//       }
//       if (!mainRenderingEngineRef.current) {
//         mainRenderingEngineRef.current = new RenderingEngine("mainEngine");
//       }
//     };

//     const loadFiles = async () => {
//       try {
//         setLoading(true);
//         let fileList = cachedFiles;

//         if (fileList.length === 0) {
//           const filePaths = JSON.parse(localStorage.getItem("dicomFilePaths") || "[]");
//           if (filePaths.length === 0) throw new Error("No files found");

//           const filePromises = filePaths.map(async (filePath, index) => {
//             const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(filePath)}`);
//             if (!response.ok) throw new Error("Failed to fetch file");
//             const blob = await response.blob();
//             return {
//               id: `file-${index}`,
//               url: URL.createObjectURL(blob),
//               path: filePath,
//             };
//           });

//           fileList = await Promise.all(filePromises);
//         } else {
//           const filePromises = fileList.map(async (file) => {
//             const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(file.path)}`);
//             if (!response.ok) throw new Error("Failed to fetch file");
//             const blob = await response.blob();
//             return {
//               ...file,
//               url: URL.createObjectURL(blob),
//             };
//           });
//           fileList = await Promise.all(filePromises);
//         }

//         console.log("Files loaded:", fileList);
//         setFiles(fileList);

//         await setupRenderingEngines();

//         const processPreviewQueue = async () => {
//           for (let i = 0; i < fileList.length; i++) {
//             const file = fileList[i];
//             const previewUrl = await getDicomPreview(file, renderingEngineRef.current, tempElementRef.current);
//             if (previewUrl) {
//               setFiles((prevFiles) =>
//                 prevFiles.map((f) =>
//                   f.id === file.id ? { ...f, previewUrl } : f
//                 )
//               );
//               setVisiblePreviews((prev) => ({ ...prev, [file.id]: true }));
//             } else {
//               console.warn(`No preview generated for ${file.id}`);
//             }
//             await new Promise((resolve) => setTimeout(resolve, 3000));
//           }
//         };

//         processPreviewQueue();

//         setSelectedImageId(fileList.length > 0 ? fileList[0].id : null);
//       } catch (err) {
//         setError(err);
//         console.error("Load error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadFiles();

//     return () => {
//       if (renderingEngineRef.current) {
//         renderingEngineRef.current.destroy();
//         if (tempElementRef.current) document.body.removeChild(tempElementRef.current);
//       }
//       if (mainRenderingEngineRef.current) {
//         mainRenderingEngineRef.current.destroy();
//       }
//     };
//   }, [cachedFiles]);

//   useEffect(() => {
//     let interval;
//     if (isPlaying && files.length > 0) {
//       interval = setInterval(() => {
//         setSelectedImageId((prevId) => {
//           const currentIndex = files.findIndex((f) => f.id === prevId);
//           const nextIndex = (currentIndex + 1) % files.length;
//           return files[nextIndex].id;
//         });
//       }, 500);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying, files]);

//   useEffect(() => {
//     if (selectedImageId && viewerRef.current && mainRenderingEngineRef.current) {
//       const selectedIndex = files.findIndex((f) => f.id === selectedImageId);
//       if (selectedIndex !== -1) {
//         const imageIds = files.map((f) => `wadouri:${f.url}`);
//         renderDicomImage(viewerRef.current, imageIds, selectedIndex, mainRenderingEngineRef.current, isMPREnabled).then((viewportIds) => {
//           const tools = [
//             WindowLevelTool,
//             PanTool,
//             StackScrollTool,
//             ZoomTool,
//             MagnifyTool,
//             LengthTool,
//             PlanarRotateTool,
//             CircleROITool,
//             RectangleROITool,
//             HeightTool,
//             ProbeTool,
//             AngleTool,
//             DragProbeTool,
//             CobbAngleTool,
//             ETDRSGridTool,
//             SplineROITool,
//             ArrowAnnotateTool,
//             PlayTool,
//             CrosshairsTool,
//           ];

//           tools.forEach((tool) => csTools3d.addTool(tool));

//           const toolGroupId = "ctToolGroup";
//           let ctToolGroup = ToolGroupManager.getToolGroup(toolGroupId);

//           if (!ctToolGroup) {
//             ctToolGroup = ToolGroupManager.createToolGroup(toolGroupId);
//             tools.forEach((tool) => ctToolGroup.addTool(tool.toolName));
//             if (isMPREnabled) {
//               ctToolGroup.addViewport(viewportIds.axial, "mainEngine");
//               ctToolGroup.addViewport(viewportIds.sagittal, "mainEngine");
//               ctToolGroup.addViewport(viewportIds.coronal, "mainEngine");
//             } else {
//               ctToolGroup.addViewport(viewportIds.stack, "mainEngine");
//             }
//           } else {
//             tools.forEach((tool) => ctToolGroup.setToolDisabled(tool.toolName));
//           }

//           setTools(tools);
//           ctToolGroupRef.current = ctToolGroup;
//           viewerRef.current.stack.style.opacity = isMPREnabled ? 0 : 1;
//           viewerRef.current.axial.style.opacity = isMPREnabled ? 1 : 0;
//           viewerRef.current.sagittal.style.opacity = isMPREnabled ? 1 : 0;
//           viewerRef.current.coronal.style.opacity = isMPREnabled ? 1 : 0;
//         });
//       }
//     }
//   }, [selectedImageId, files, isMPREnabled]);

//   const activateTool = (toolName) => {
//     if (ctToolGroupRef.current) {
//       tools.forEach((tool) => ctToolGroupRef.current.setToolDisabled(tool.toolName));
//       if (toolName === "PlayTool") {
//         ctToolGroupRef.current.setToolActive("PlayTool", {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       } else if (toolName === "MPR") {
//         setIsMPREnabled(true);
//         ctToolGroupRef.current.setToolActive("CrosshairsTool", {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       } else if (toolName === "CrosshairsTool") {
//         setIsMPREnabled(true);
//         ctToolGroupRef.current.setToolActive("CrosshairsTool", {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       } else {
//         setIsMPREnabled(false);
//         ctToolGroupRef.current.setToolActive(toolName, {
//           bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
//         });
//       }
//     }
//   };

//   const togglePlay = () => {
//     setIsPlaying((prev) => !prev);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div className={styles.AllCon}>
//       <aside className={styles.aside}>
//         <h2>Files</h2>
//         {files.map((file) => (
//           <div
//             key={file.id}
//             onClick={() => setSelectedImageId(file.id)}
//             className={`${styles.fileSelection} ${visiblePreviews[file.id] ? styles.visible : ''}`}
//             style={{
//               background: selectedImageId === file.id ? "conic-gradient(#168aad, #06d6a0, #d9ed92)" : "transparent",
//             }}
//           >
//             {file.previewUrl && visiblePreviews[file.id] ? (
//               <Image
//                 src={file.previewUrl}
//                 width={100}
//                 height={100}
//                 className={styles.preview}
//                 alt={`Preview of ${file.id}`}
//               />
//             ) : (
//               <div>Loading preview...</div>
//             )}
//           </div>
//         ))}
//       </aside>
//       <div className={styles.buttonCon}>
//         <h1 className={styles.title}> KJ DICOM MEDICAL FILE RENDERING:</h1>
//         <div className={styles.tools}>
//           {tools.map((tool) => (
//             <button
//               key={tool.toolName}
//               onClick={() => activateTool(tool.toolName)}
//               className={styles.btnTool}
//               style={{ display: tool.toolName === "CrosshairsTool" ? "none" : "inline-block" }}
//             >
//               {tool.toolName}
//             </button>
//           ))}
//           <button
//             onClick={() => activateTool("MPR")}
//             className={styles.btnTool}
//           >
//             MPR
//           </button>
//           <button
//             onClick={togglePlay}
//             className={styles.btnTool}
//           >
//             {isPlaying ? "Stop" : "Play"}
//           </button>
//         </div>
//         <div style={{ display: "flex", gap: "10px" }}>
//           <div ref={(el) => (viewerRef.current.stack = el)} className={styles.viewer} style={{ width: "700px", height: "700px", display: isMPREnabled ? "none" : "block" }} />
//           <div ref={(el) => (viewerRef.current.axial = el)} className={styles.viewer} style={{ width: "500px", height: "500px", display: isMPREnabled ? "block" : "none" }} />
//           <div ref={(el) => (viewerRef.current.sagittal = el)} className={styles.viewer} style={{ width: "500px", height: "500px", display: isMPREnabled ? "block" : "none" }} />
//           <div ref={(el) => (viewerRef.current.coronal = el)} className={styles.viewer} style={{ width: "500px", height: "500px", display: isMPREnabled ? "block" : "none" }} />
//         </div>
//       </div>
//     </div>
//   );
// }

























"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { RenderingEngine, Enums, volumeLoader } from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { init as csToolsInit, ToolGroupManager } from "@cornerstonejs/tools";
import * as csTools3d from "@cornerstonejs/tools";
import Image from "next/image";
import styles from "./../page.module.css";
import {
  WindowLevelTool,
  PanTool,
  StackScrollTool,
  ZoomTool,
  MagnifyTool,
  LengthTool,
  PlanarRotateTool,
  CircleROITool,
  RectangleROITool,
  HeightTool,
  ProbeTool,
  AngleTool,
  DragProbeTool,
  CobbAngleTool,
  ETDRSGridTool,
  SplineROITool,
  ArrowAnnotateTool,
  CrosshairsTool,
} from "@cornerstonejs/tools";

function useDicomPreviews(files, setFiles, setVisiblePreviews, renderingEngine, tempElement) {
  const cachedPreviews = useMemo(() => {
    return files.reduce((acc, file) => {
      if (file.previewUrl) {
        acc[file.id] = file.previewUrl;
      }
      return acc;
    }, {});
  }, [files]);

  useEffect(() => {
    const generatePreviews = async () => {
      const previewPromises = files.map(async (file) => {
        if (!file.previewUrl && renderingEngine && tempElement) {
          const previewUrl = await getDicomPreview(file, renderingEngine, tempElement);
          if (previewUrl) {
            setFiles((prevFiles) =>
              prevFiles.map((f) => (f.id === file.id ? { ...f, previewUrl } : f))
            );
            setVisiblePreviews((prev) => ({ ...prev, [file.id]: true }));
          } else {
            console.warn(`No preview generated for ${file.id}`);
          }
        }
      });
      await Promise.all(previewPromises);
    };

    generatePreviews();
  }, [files, setFiles, setVisiblePreviews, renderingEngine, tempElement]);

  return cachedPreviews;
}

async function getDicomPreview(file, renderingEngine, tempElement) {
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

class PlayTool extends csTools3d.BaseTool {
  constructor() {
    super({
      toolName: "PlayTool",
    });
  }

  playStack(viewport, imageIds) {
    let index = 0;
    const playInterval = setInterval(() => {
      if (index >= imageIds.length) index = 0;
      viewport.setStack(imageIds, index);
      viewport.render();
      index++;
    }, 500);
    return () => clearInterval(playInterval);
  }

  mouseDownActivate(evt) {
    const viewport = evt.detail.viewport;
    const imageIds = viewport.getImageIds();
    const stopPlay = this.playStack(viewport, imageIds);
    setTimeout(stopPlay, 10000);
  }
}

let isCornerstoneInitialized = false;

async function CornerstoneLibInitialize() {
  if (!isCornerstoneInitialized) {
    await csRenderInit();
    await dicomImageLoaderInit();
    await csToolsInit();
    isCornerstoneInitialized = true;
  }
}

async function renderDicomImage(elements, imageIds, selectedIndex, renderingEngine, isMPREnabled) {
  await CornerstoneLibInitialize();

  const viewportIds = {
    stack: "stackViewport",
    axial: "axialViewport",
    sagittal: "sagittalViewport",
    coronal: "coronalViewport",
  };

  if (isMPREnabled) {
    renderingEngine.setViewports([
      {
        viewportId: viewportIds.axial,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: elements.axial,
        defaultOptions: { orientation: Enums.OrientationAxis.AXIAL },
      },
      {
        viewportId: viewportIds.sagittal,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: elements.sagittal,
        defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL },
      },
      {
        viewportId: viewportIds.coronal,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: elements.coronal,
        defaultOptions: { orientation: Enums.OrientationAxis.CORONAL },
      },
    ]);

    const volumeId = "myVolume";
    const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });

    Object.values(viewportIds)
      .slice(1)
      .forEach((viewportId) => {
        const viewport = renderingEngine.getViewport(viewportId);
        viewport.setVolumes([{ volumeId }]);
        viewport.render();
      });
  } else {
    renderingEngine.setViewports([
      {
        viewportId: viewportIds.stack,
        type: Enums.ViewportType.STACK,
        element: elements.stack,
        defaultOptions: {},
      },
    ]);

    const viewport = renderingEngine.getViewport(viewportIds.stack);
    await viewport.setStack(imageIds, selectedIndex);
    viewport.render();
  }

  return viewportIds;
}

export default function DicomViewerPage() {
  const params = useParams();
  const viewerRef = useRef({ stack: null, axial: null, sagittal: null, coronal: null });
  const ctToolGroupRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const mainRenderingEngineRef = useRef(null);
  const tempElementRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePreviews, setVisiblePreviews] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMPREnabled, setIsMPREnabled] = useState(false);

  const cachedFiles = useMemo(() => {
    const cached = localStorage.getItem("dicomFilePaths");
    if (cached) {
      const filePaths = JSON.parse(cached);
      return filePaths.map((filePath, index) => ({
        id: `file-${index}`,
        path: filePath,
      }));
    }
    return [];
  }, []);

  const handleSelectImage = useCallback((id) => {
    setSelectedImageId(id);
  }, []);

  const previews = useDicomPreviews(files, setFiles, setVisiblePreviews, renderingEngineRef.current, tempElementRef.current);

  useEffect(() => {
    const setupRenderingEngines = async () => {
      await CornerstoneLibInitialize();
      if (!renderingEngineRef.current) {
        renderingEngineRef.current = new RenderingEngine("previewEngine");
        tempElementRef.current = document.createElement("div");
        tempElementRef.current.style.position = "absolute";
        tempElementRef.current.style.visibility = "hidden";
        tempElementRef.current.style.width = "100px";
        tempElementRef.current.style.height = "100px";
        document.body.appendChild(tempElementRef.current);
      }
      if (!mainRenderingEngineRef.current) {
        mainRenderingEngineRef.current = new RenderingEngine("mainEngine");
      }
    };

    const loadFiles = async () => {
      try {
        setLoading(true);
        let fileList = cachedFiles;

        if (fileList.length === 0) {
          const filePaths = JSON.parse(localStorage.getItem("dicomFilePaths") || "[]");
          if (filePaths.length === 0) throw new Error("No files found");

          const filePromises = filePaths.map(async (filePath, index) => {
            const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(filePath)}`);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            return {
              id: `file-${index}`,
              url: URL.createObjectURL(blob),
              path: filePath,
            };
          });

          fileList = await Promise.all(filePromises);
        } else {
          const filePromises = fileList.map(async (file) => {
            const response = await fetch(`http://localhost:3000/dicom/file?path=${encodeURIComponent(file.path)}`);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            return {
              ...file,
              url: URL.createObjectURL(blob),
            };
          });
          fileList = await Promise.all(filePromises);
        }

        setFiles(fileList);
        setSelectedImageId(fileList.length > 0 ? fileList[0].id : null);

        await setupRenderingEngines();
      } catch (err) {
        setError(err);
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();

    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
        if (tempElementRef.current) document.body.removeChild(tempElementRef.current);
      }
      if (mainRenderingEngineRef.current) {
        mainRenderingEngineRef.current.destroy();
      }
    };
  }, [cachedFiles]);

  useEffect(() => {
    let interval;
    if (isPlaying && files.length > 0) {
      interval = setInterval(() => {
        setSelectedImageId((prevId) => {
          const currentIndex = files.findIndex((f) => f.id === prevId);
          const nextIndex = (currentIndex + 1) % files.length;
          return files[nextIndex].id;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, files]);

  useEffect(() => {
    if (selectedImageId && viewerRef.current && mainRenderingEngineRef.current) {
      const selectedIndex = files.findIndex((f) => f.id === selectedImageId);
      if (selectedIndex !== -1) {
        const imageIds = files.map((f) => `wadouri:${f.url}`);
        renderDicomImage(viewerRef.current, imageIds, selectedIndex, mainRenderingEngineRef.current, isMPREnabled).then(
          (viewportIds) => {
            const tools = [
              WindowLevelTool,
              PanTool,
              StackScrollTool,
              ZoomTool,
              MagnifyTool,
              LengthTool,
              PlanarRotateTool,
              CircleROITool,
              RectangleROITool,
              HeightTool,
              ProbeTool,
              AngleTool,
              DragProbeTool,
              CobbAngleTool,
              ETDRSGridTool,
              SplineROITool,
              ArrowAnnotateTool,
              PlayTool,
              CrosshairsTool,
            ];

            tools.forEach((tool) => {
              csTools3d.addTool(tool);
              console.log(`Tool added to Cornerstone: ${tool.toolName}`);
            });

            const toolGroupId = "ctToolGroup";
            let ctToolGroup = ToolGroupManager.getToolGroup(toolGroupId);

            if (!ctToolGroup) {
              ctToolGroup = ToolGroupManager.createToolGroup(toolGroupId);
              tools.forEach((tool) => {
                ctToolGroup.addTool(tool.toolName);
                console.log(`Tool added to ToolGroup: ${tool.toolName}`);
              });

              if (isMPREnabled) {
                ctToolGroup.addViewport(viewportIds.axial, "mainEngine");
                ctToolGroup.addViewport(viewportIds.sagittal, "mainEngine");
                ctToolGroup.addViewport(viewportIds.coronal, "mainEngine");
              } else {
                ctToolGroup.addViewport(viewportIds.stack, "mainEngine");
              }

              ctToolGroup.setToolActive("WindowLevelTool", {
                bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
              });
            } else {
              tools.forEach((tool) => ctToolGroup.setToolDisabled(tool.toolName));
              if (isMPREnabled) {
                ctToolGroup.addViewport(viewportIds.axial, "mainEngine");
                ctToolGroup.addViewport(viewportIds.sagittal, "mainEngine");
                ctToolGroup.addViewport(viewportIds.coronal, "mainEngine");
              } else {
                ctToolGroup.addViewport(viewportIds.stack, "mainEngine");
              }
            }

            setTools(tools);
            ctToolGroupRef.current = ctToolGroup;

            viewerRef.current.stack.style.opacity = isMPREnabled ? 0 : 1;
            viewerRef.current.axial.style.opacity = isMPREnabled ? 1 : 0;
            viewerRef.current.sagittal.style.opacity = isMPREnabled ? 1 : 0;
            viewerRef.current.coronal.style.opacity = isMPREnabled ? 1 : 0;
          }
        );
      }
    }
  }, [selectedImageId, files, isMPREnabled]);

  const getToolBindings = (toolName) => {
    switch (toolName) {
      case "ZoomTool":
        return [{ mouseWheel: csTools3d.Enums.MouseBindings.Wheel }];
      case "PanTool":
        return [{ mouseButton: csTools3d.Enums.MouseBindings.Primary, modifierKey: csTools3d.Enums.MouseBindings.Auxiliary }];
      case "WindowLevelTool":
        return [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }];
      case "StackScrollTool":
        return [{ mouseWheel: csTools3d.Enums.MouseBindings.Wheel }];
      case "CrosshairsTool":
        return [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }];
      case "PlayTool":
        return [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }];
      default:
        return [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }];
    }
  };

  const activateTool = (toolName) => {
    if (ctToolGroupRef.current) {
      console.log(`Activating tool: ${toolName}`);

      tools.forEach((tool) => ctToolGroupRef.current.setToolDisabled(tool.toolName));

      const bindings = getToolBindings(toolName);

      if (toolName === "MPR") {
        setIsMPREnabled(true);
        if (!ctToolGroupRef.current.hasTool("CrosshairsTool")) {
          console.log("CrosshairsTool not found, adding it now...");
          csTools3d.addTool(CrosshairsTool);
          ctToolGroupRef.current.addTool(CrosshairsTool.toolName);
        }
        ctToolGroupRef.current.setToolActive("CrosshairsTool", {
          bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
        });
      } else if (toolName === "CrosshairsTool") {
        setIsMPREnabled(true);
        if (!ctToolGroupRef.current.hasTool("CrosshairsTool")) {
          console.log("CrosshairsTool not found, adding it now...");
          csTools3d.addTool(CrosshairsTool);
          ctToolGroupRef.current.addTool(CrosshairsTool.toolName);
        }
        ctToolGroupRef.current.setToolActive("CrosshairsTool", { bindings });
      } else {
        setIsMPREnabled(false);
        if (!ctToolGroupRef.current.hasTool(toolName)) {
          console.error(`${toolName} is not added to ToolGroup! Adding it now...`);
          ctToolGroupRef.current.addTool(toolName);
        }
        ctToolGroupRef.current.setToolActive(toolName, { bindings });
      }
    } else {
      console.error("ToolGroup not initialized!");
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.AllCon}>
      <aside className={styles.aside}>
        <h2>Files</h2>
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleSelectImage(file.id)}
            className={`${styles.fileSelection} ${visiblePreviews[file.id] ? styles.visible : ""}`}
            style={{
              background: selectedImageId === file.id ? "conic-gradient(#168aad, #06d6a0, #d9ed92)" : "transparent",
            }}
          >
            {file.previewUrl && visiblePreviews[file.id] ? (
              <Image
                src={file.previewUrl}
                width={100}
                height={100}
                className={styles.preview}
                alt={`Preview of ${file.id}`}
                priority
              />
            ) : (
              <div>Loading preview...</div>
            )}
          </div>
        ))}
      </aside>
      <div className={styles.buttonCon}>
        <h1 className={styles.title}>DICOM MEDICAL FILE:</h1>
        <div className={styles.tools}>
          {tools.map((tool) => (
            <button
              key={tool.toolName}
              onClick={() => activateTool(tool.toolName)}
              className={styles.btnTool}
              style={{ display: tool.toolName === "CrosshairsTool" ? "none" : "inline-block" }}
            >
              {tool.toolName}
            </button>
          ))}
          <button onClick={() => activateTool("MPR")} className={styles.btnTool}>
            MPR
          </button>
          <button onClick={togglePlay} className={styles.btnTool}>
            {isPlaying ? "Stop" : "Play"}
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            ref={(el) => (viewerRef.current.stack = el)}
            className={styles.viewer}
            style={{ width: "650px", height: "650px", display: isMPREnabled ? "none" : "block" }}
          />
          <div
            ref={(el) => (viewerRef.current.axial = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: isMPREnabled ? "block" : "none" }}
          />
          <div
            ref={(el) => (viewerRef.current.sagittal = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: isMPREnabled ? "block" : "none" }}
          />
          <div
            ref={(el) => (viewerRef.current.coronal = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: isMPREnabled ? "block" : "none" }}
          />
        </div>
      </div>
    </div>
  );
}