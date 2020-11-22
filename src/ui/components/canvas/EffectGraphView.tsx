import React, {memo, useEffect, useMemo, useRef, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";
import type {CanvasWorkerOutputMessage, CanvasWorkerInputMessage} from "./CanvasWorker";
import {isArraysEqual} from "../../utils/isArraysEqual";
import "./EffectGraphView.scss";

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
    const lastUsedSize = useRef<number[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    useEffect(() => {
        if (!canvas) return;

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

        canvas.width = width;
        canvas.height = height;
        lastUsedSize.current = [duration, count, width, height];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const worker = new Worker(new URL("./CanvasWorker.ts", import.meta.url));

        let lastHashMessage: [string[], string[]];

        worker.addEventListener("message", (event) => {
            const data: CanvasWorkerOutputMessage = event.data;
            if (Array.isArray(data)) {
                lastHashMessage = data;
                return;
            }
            const ctx = canvas.getContext("2d");
            const imageData = ctx.createImageData(width, height);
            imageData.data.set(data);
            ctx.putImageData(imageData, 0, 0);
            const [usedEffectNames, usedFilterNames] = lastHashMessage;

            lastUsedEffectNames.current = usedEffectNames;
            lastUsedFilterNames.current = usedFilterNames;
            lastUsedEffects.current = usedEffectNames.map(name => track.effects[name]);
            lastUsedFilters.current = usedFilterNames.map(name => track.filters[name]);

            worker.terminate();
        });
        const message: CanvasWorkerInputMessage = {width, height, render, track, duration, count};

        worker.postMessage(message);

        return () => worker.terminate();
    }, [canvas, width, height, duration, count, render, track.filters, track.effects]);

    return useMemo(() => (
        <span className="effect-graph-view-bg">
            <canvas ref={setCanvas} />
        </span>
    ), []);
});