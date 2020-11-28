import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";
import type {
    CanvasWorkerOutputMessage,
    CanvasWorkerInputMessage,
    CanvasWorkerInputMessageInit,
    CanvasWorkerInputMessageEffect
} from "./CanvasWorker";
import {isArraysEqual} from "../../utils/isArraysEqual";
import "./EffectGraphView.scss";

const createCanvasWorker = () => new Worker(new URL("./CanvasWorker.ts", import.meta.url));

export interface EffectGraphViewProps {
    width: number;
    height: number;
    duration: number;
    count: number;
    render: PlixEffectJsonData;
    track: PlixJsonData;
}
export const EffectGraphView = memo<EffectGraphViewProps>(({duration, count, width, height, render, track}) => {

    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const workerRef = useRef<Worker>();

    const lastUsedSize = useRef<number[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    useEffect(() => {
        if (!canvas) return;
        workerRef.current = createCanvasWorker();
        const msg: CanvasWorkerInputMessageInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen()
        }

        workerRef.current.addEventListener("message", (event) => {
            const data: CanvasWorkerOutputMessage = event.data;
            const [usedEffectNames, usedFilterNames] = data;
            lastUsedEffectNames.current = usedEffectNames;
            lastUsedFilterNames.current = usedFilterNames;
            lastUsedEffects.current = usedEffectNames.map(name => track.effects[name]);
            lastUsedFilters.current = usedFilterNames.map(name => track.filters[name]);
        });
        workerRef.current.postMessage(msg, [msg.canvas]);

        return () => {
            workerRef.current.terminate()
        }
    }, [canvas])

    useEffect(() => {
        if (!workerRef.current) return;

        function isRerenderRequired(): boolean{
            if (!isArraysEqual(lastUsedSize.current, [duration, count, width, height])) {
                return true;
            }
            if (lastUsedEffectRef.current !== render) {
                return true;
            }
            if (!lastUsedEffectNames.current || !lastUsedFilterNames.current) {
                return true;
            }
            const usedEffects = lastUsedEffectNames.current.map(name => track.effects[name]);
            if (!isArraysEqual(lastUsedEffects.current, usedEffects)) {
                return true;
            }
            const usedFilters = lastUsedFilterNames.current.map(name => track.filters[name]);
            return !isArraysEqual(lastUsedFilters.current, usedFilters);

        }
        if (!isRerenderRequired()) return;

        lastUsedSize.current = [duration, count, width, height];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: CanvasWorkerInputMessageEffect = {type: "effect", width, height, render, track, duration, count};

        workerRef.current.postMessage(message);
    }, [canvas, width, height, duration, count, render, track.filters, track.effects]);

    // const onClick = useCallback(() => {
    //     const {width, height} = document.body.getBoundingClientRect();
    //     const box = document.createElement("span");
    //     box.classList.add("effect-graph-view-bg");
    //     box.style.position = "absolute";
    //     box.style.width = "100%";
    //     box.style.height = "100%";
    //     box.style.zIndex = "999999";
    //     const fullCanvas = document.createElement("canvasRef");
    //     fullCanvas.width = width;
    //     fullCanvas.height = height;
    //     fullCanvas.style.cursor = "wait";
    //     box.appendChild(fullCanvas);
    //     document.body.prepend(box);
    //     const workerRef = createCanvasWorker();
    //     box.addEventListener("click", () => {
    //         document.body.removeChild(box);
    //         workerRef.terminate();
    //     });
    //     workerRef.addEventListener("message", (event) => {
    //         const data: CanvasWorkerOutputMessage = event.data;
    //         if (Array.isArray(data))  return;
    //         const ctx = fullCanvas.getContext("2d");
    //         const imageData = ctx.createImageData(width, height);
    //         imageData.data.set(new Uint8ClampedArray(data));
    //         ctx.putImageData(imageData, 0, 0);
    //         fullCanvas.style.cursor = "";
    //         workerRef.terminate();
    //     })
    //     const message: CanvasWorkerInputMessage = {width, height, render, track, duration, count};
    //     workerRef.postMessage(message);
    // }, [width, height, duration, count, render, track.filters, track.effects]);

    return useMemo(() => (
        <span className="effect-graph-view-bg">
            <canvas ref={setCanvas} />
        </span>
    ), []);
});