import React from "react";

interface CoverPagePreviewProps {
  title: string;
  text?: string;
  color: string;
  imageUrl?: string | null;
}

export function CoverPagePreview({ title, text, color, imageUrl }: CoverPagePreviewProps) {
  return (
    <div className="border rounded overflow-hidden w-full max-w-sm">
      <div
        className="h-40 flex items-center justify-center bg-muted"
        style={{ backgroundColor: color }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="cover" className="max-h-full" />
        ) : (
          <span className="text-sm text-muted-foreground">No image</span>
        )}
      </div>
      <div className="p-4 text-center">
        <h2 className="font-bold text-xl">{title || "Untitled"}</h2>
        {text && <p className="mt-2 text-sm whitespace-pre-wrap">{text}</p>}
      </div>
    </div>
  );
}

export default CoverPagePreview;
