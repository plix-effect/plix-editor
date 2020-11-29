import * as React from "react";
import {FC, useEffect, useRef, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";
import type {
    CanvasPreviewWkInMsgInit,
    CanvasPreviewWkInMsgRender,
    CanvasPreviewWkOutMsg
} from "./worker/CanvasPreviewWorker";
import {isArraysEqual} from "../../../utils/isArraysEqual";
import {usePlaybackData, usePlaybackStatus} from "../../editor/PlaybackContext";

const createPreviewCanvasWorker = () => new Worker(new URL("./worker/CanvasPreviewWorker.ts", import.meta.url));

export interface CanvasPreviewProps {
    width: number;
    height: number;
    duration: number;
    count: number;
    render: PlixEffectJsonData;
    track: PlixJsonData;
}
export const CanvasPreview:FC<CanvasPreviewProps> = ({duration, width, count, height, render, track}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const workerRef = useRef<Worker>();

    const lastUsedSize = useRef<number[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    const status = usePlaybackStatus();
    const {playFromStamp} = usePlaybackData()

    useEffect(() => {
        if (!canvas) return;
        workerRef.current = createPreviewCanvasWorker();
        const msg: CanvasPreviewWkInMsgInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen(),
            performanceValue: performance.now()
        }

        workerRef.current.addEventListener("message", (event) => {
            const data: CanvasPreviewWkOutMsg = event.data;
            if (data.type !== "deps") return;
            const [usedEffectNames, usedFilterNames] = data.deps;
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

        const message: CanvasPreviewWkInMsgRender = {type: "render", data: {width, height, render, track, duration, count}};

        workerRef.current.postMessage(message);
    }, [canvas, width, height, duration, count, render, track.filters, track.effects]);

    return (
        <div>
            <canvas ref={setCanvas}>

            </canvas>
        </div>
    )
}