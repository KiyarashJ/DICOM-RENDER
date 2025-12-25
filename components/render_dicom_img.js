import { CornerstoneLibInitialize } from "./cornerstone_init";
import { Enums, volumeLoader } from "@cornerstonejs/core";

export async function renderDicomImage(elements, imageIds, selectedIndex, renderingEngine, isMPREnabled) {
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