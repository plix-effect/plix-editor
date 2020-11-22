import React, {memo, useEffect, useMemo, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";

export interface EffectGraphViewProps {
    width: number;
    height: number;
    effect: PlixEffectJsonData,
    track: PlixJsonData
}
export const EffectGraphView = memo<EffectGraphViewProps>(({width, height, effect, track}) => {

    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    useEffect(() => {
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        const worker = new Worker(new URL("./CanvasWorker.ts", import.meta.url));
        worker.postMessage([width, height, effect, track]);
        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(width, height);
        worker.addEventListener("message", ({data}) => {
            for (let i=0; i<imageData.data.length; i++){
                imageData.data[i] = data[i];
            }
            ctx.putImageData(imageData, 0, 0);
        });
    }, [canvas, width, height, effect, track.filters, track.effects]);

    return useMemo(() => (
        <canvas ref={setCanvas} />
    ), []);
});