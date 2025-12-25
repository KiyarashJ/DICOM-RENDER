"use client";
import { useEffect, useRef, useMemo, useCallback, useReducer } from "react";
import { RenderingEngine } from "@cornerstonejs/core";


import { ToolGroupManager } from "@cornerstonejs/tools";
import * as csTools3d from "@cornerstonejs/tools";

import styles from "./../page.module.css";
const Image = dynamic(() => import("next/image"), { ssr: false });
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
import { useDicomPreviews } from "../../../../components/use_dicom_previews";
import { CornerstoneLibInitialize } from "../../../../components/cornerstone_init";
import { renderDicomImage } from "../../../../components/render_dicom_img";
import { PlayTool } from "../../../../components/playtool";
import dynamic from "next/dynamic";










export default function DicomViewerPage() {
  
  const viewerRef = useRef({ stack: null, axial: null, sagittal: null, coronal: null });
  const ctToolGroupRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const mainRenderingEngineRef = useRef(null);
  const tempElementRef = useRef(null);

  const initialValue = {
    files : [],
    selectedImageId : null,
    tools : [],
    loading : true,
    error : null,
    visiblePreviews: {},
    isPlaying : false,
    isMPREnabled : false,
  };  
  

const reducer = (state, action) => {
  switch (action.type) {
    case "files":
      return { ...state, files: action.payload }; 
    case "UPDATE_PREVIEW":
      return {
        ...state,
        files: state.files.map((f) => 
          f.id === action.payload.id ? { ...f, previewUrl: action.payload.url } : f
        ),
        visiblePreviews: { ...state.visiblePreviews, [action.payload.id]: true }
      };
    case "selectedImageId":
      return { ...state, selectedImageId: action.payload };
    case "tools":
      return { ...state, tools: action.payload };
    case "loading":
      return { ...state, loading: action.payload };
    case "error":
      return { ...state, error: action.payload };
    case "visiblePreviews":
      return { ...state, visiblePreviews: action.payload };
    case "isPlaying":
      return { ...state, isPlaying: typeof action.payload === 'function' ? action.payload(state.isPlaying) : action.payload };
    case "isMPREnabled":
      return { ...state, isMPREnabled: action.payload };
    default:
      return state;
  }
};
  const [cr_config, dispatch] = useReducer(reducer, initialValue);

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
    
    dispatch({ type: "selectedImageId", payload: id });
    
  }, []);
  
  const previews = useDicomPreviews(cr_config.files, dispatch, renderingEngineRef.current, tempElementRef.current);

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
        
        dispatch({ type: "loading", payload: true });
        
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
        dispatch({ type: "files", payload: fileList });
        dispatch({ type: "selectedImageId", payload: fileList.length > 0 ? fileList[0].id : null });
        await setupRenderingEngines();
      } catch (err) {
        dispatch({ type: "error", payload: err });
        
      } finally {
        dispatch({ type: "loading", payload: false });
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
    if (cr_config.isPlaying && cr_config.files.length > 0) {
      interval = setInterval(() => {
        
        dispatch({ type: "selectedImageId", payload: (prevId) => {
          const currentIndex = files.findIndex((f) => f.id === prevId);
          const nextIndex = (currentIndex + 1) % files.length;
          return files[nextIndex].id;
        } });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [cr_config.isPlaying, cr_config.files]);

  useEffect(() => {
    if (cr_config.selectedImageId && viewerRef.current && mainRenderingEngineRef.current) {
      const selectedIndex = cr_config.files.findIndex((f) => f.id === cr_config.selectedImageId);
      if (selectedIndex !== -1) {
        const imageIds = cr_config.files.map((f) => `wadouri:${f.url}`);
        renderDicomImage(viewerRef.current, imageIds, selectedIndex, mainRenderingEngineRef.current, cr_config.isMPREnabled).then(
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
              
            });

            const toolGroupId = "ctToolGroup";
            let ctToolGroup = ToolGroupManager.getToolGroup(toolGroupId);

            if (!ctToolGroup) {
              ctToolGroup = ToolGroupManager.createToolGroup(toolGroupId);
              tools.forEach((tool) => {
                ctToolGroup.addTool(tool.toolName);
                
              });

              if (cr_config.isMPREnabled) {
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
              if (cr_config.isMPREnabled) {
                ctToolGroup.addViewport(viewportIds.axial, "mainEngine");
                ctToolGroup.addViewport(viewportIds.sagittal, "mainEngine");
                ctToolGroup.addViewport(viewportIds.coronal, "mainEngine");
              } else {
                ctToolGroup.addViewport(viewportIds.stack, "mainEngine");
              }
            }
            dispatch({ type: "tools", payload: tools });
            
            ctToolGroupRef.current = ctToolGroup;

            viewerRef.current.stack.style.opacity = cr_config.isMPREnabled ? 0 : 1;
            viewerRef.current.axial.style.opacity = cr_config.isMPREnabled ? 1 : 0;
            viewerRef.current.sagittal.style.opacity = cr_config.isMPREnabled ? 1 : 0;
            viewerRef.current.coronal.style.opacity = cr_config.isMPREnabled ? 1 : 0;
          }
        );
      }
    }
  }, [cr_config.selectedImageId, cr_config.files, cr_config.isMPREnabled]);

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
  

      cr_config.tools.forEach((tool) => ctToolGroupRef.current.setToolDisabled(tool.toolName));

      const bindings = getToolBindings(toolName);

      if (toolName === "MPR") {
        dispatch({ type: "isMPREnabled", payload: true });
        if (!ctToolGroupRef.current.hasTool("CrosshairsTool")) {
          
          csTools3d.addTool(CrosshairsTool);
          ctToolGroupRef.current.addTool(CrosshairsTool.toolName);
        }
        ctToolGroupRef.current.setToolActive("CrosshairsTool", {
          bindings: [{ mouseButton: csTools3d.Enums.MouseBindings.Primary }],
        });
      } else if (toolName === "CrosshairsTool") {
        dispatch({ type: "isMPREnabled", payload: true });
        if (!ctToolGroupRef.current.hasTool("CrosshairsTool")) {
          
          csTools3d.addTool(CrosshairsTool);
          ctToolGroupRef.current.addTool(CrosshairsTool.toolName);
        }
        ctToolGroupRef.current.setToolActive("CrosshairsTool", { bindings });
      } else {
        dispatch({ type: "isMPREnabled", payload: false });
        if (!ctToolGroupRef.current.hasTool(toolName)) {
          
          ctToolGroupRef.current.addTool(toolName);
        }
        ctToolGroupRef.current.setToolActive(toolName, { bindings });
      }
    } else {
      
    }
  };

  const togglePlay = () => {
    dispatch({ type: "isPlaying", payload: (prev) => !prev });
  };

  if (cr_config.loading) return <div>Loading...</div>;
  if (cr_config.error) return <div>Error: {cr_config.error.message}</div>;

  return (
    <div className={styles.AllCon}>
      <aside className={styles.aside}>
        <h2>Files</h2>
        {cr_config.files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleSelectImage(file.id)}
            className={`${styles.fileSelection} ${cr_config.visiblePreviews[file.id] ? styles.visible : ""}`}
            style={{
              background: cr_config.selectedImageId === file.id ? "conic-gradient(#168aad, #06d6a0, #d9ed92)" : "transparent",
            }}
          >
            {file.previewUrl && cr_config.visiblePreviews[file.id] ? (
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
          {cr_config.tools.map((tool) => (
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
            {cr_config.isPlaying ? "Stop" : "Play"}
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            ref={(el) => (viewerRef.current.stack = el)}
            className={styles.viewer}
            style={{ width: "650px", height: "650px", display: cr_config.isMPREnabled ? "none" : "block" }}
          />
          <div
            ref={(el) => (viewerRef.current.axial = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: cr_config.isMPREnabled ? "block" : "none" }}
          />
          <div
            ref={(el) => (viewerRef.current.sagittal = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: cr_config.isMPREnabled ? "block" : "none" }}
          />
          <div
            ref={(el) => (viewerRef.current.coronal = el)}
            className={styles.viewer}
            style={{ width: "400px", height: "400px", display: cr_config.isMPREnabled ? "block" : "none" }}
          />
        </div>
      </div>
    </div>
  );
}