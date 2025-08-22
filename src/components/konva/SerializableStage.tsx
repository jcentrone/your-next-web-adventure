import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Stage as StageComponent, Layer as LayerComponent } from "react-konva";
import Konva from "konva";

export interface StageHandle {
  stage: Konva.Stage | null;
  toJSON: () => string;
  fromJSON: (json: string) => void;
}

export const SerializableStage = forwardRef<StageHandle, React.ComponentProps<typeof StageComponent>>(
  (props, ref) => {
    const stageRef = useRef<Konva.Stage | null>(null);

    useImperativeHandle(ref, () => ({
      stage: stageRef.current,
      toJSON: () => stageRef.current?.toJSON() ?? "",
      fromJSON: (json: string) => {
        if (stageRef.current) {
          stageRef.current.destroyChildren();
          Konva.Node.create(json, stageRef.current);
        }
      },
    }));

    return <StageComponent ref={stageRef} {...props} />;
  }
);

export interface LayerHandle {
  layer: Konva.Layer | null;
  toJSON: () => string;
  fromJSON: (json: string) => void;
}

export const SerializableLayer = forwardRef<LayerHandle, React.ComponentProps<typeof LayerComponent>>(
  (props, ref) => {
    const layerRef = useRef<Konva.Layer | null>(null);

    useImperativeHandle(ref, () => ({
      layer: layerRef.current,
      toJSON: () => layerRef.current?.toJSON() ?? "",
      fromJSON: (json: string) => {
        if (layerRef.current) {
          layerRef.current.destroyChildren();
          Konva.Node.create(json, layerRef.current);
        }
      },
    }));

    return <LayerComponent ref={layerRef} {...props} />;
  }
);

