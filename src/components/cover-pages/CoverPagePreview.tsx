import React from "react";
import { Canvas as FabricCanvas } from "fabric";

interface CoverPagePreviewProps {
  designJson: any;
  width?: number;
  height?: number;
}

export function CoverPagePreview({ designJson, width = 800, height = 1000 }: CoverPagePreviewProps) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!designJson) {
      setDataUrl(null);
      return;
    }
    const canvasEl = document.createElement("canvas");
    const canvas = new FabricCanvas(canvasEl, { width, height });
    let disposed = false;
    canvas.loadFromJSON(designJson, () => {
      canvas.renderAll();
      const url = canvas.toDataURL({ format: "png" });
      if (!disposed) {
        setDataUrl(url);
      }
      canvas.dispose();
      disposed = true;
    });
    return () => {
      if (!disposed) {
        canvas.dispose();
        disposed = true;
      }
    };
  }, [designJson, width, height]);

  if (!dataUrl) {
    return (
      <div className="border rounded overflow-hidden w-full max-w-sm p-4 text-center">
        <span className="text-sm text-muted-foreground">No cover page</span>
      </div>
    );
  }

  return (
    <div className="border rounded overflow-hidden w-full max-w-sm">
      <img src={dataUrl} alt="cover page preview" className="w-full h-auto" />
    </div>
  );
}

export default CoverPagePreview;
