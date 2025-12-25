import * as csTools3d from "@cornerstonejs/tools";

export class PlayTool extends csTools3d.BaseTool {
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