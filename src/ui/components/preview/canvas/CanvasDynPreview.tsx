import * as React from "react";
import {FC, useEffect, useRef, useState} from "react";
import {PlixEffectJsonData, PlixJsonData} from "@plix-effect/core/dist/types/parser";
import {isArraysEqual} from "../../../utils/isArraysEqual";
import {usePlaybackData, usePlaybackStatus} from "../../editor/PlaybackContext";
import type {FieldConfig} from "./worker/PlixCanvasField";
import type {
    CvsDynPreviewInMsgChangeField,
    CvsDynPreviewInMsgChangePlayback,
    CvsDynPreviewInMsgInit,
    CvsDynPreviewInMsgRenderData, CvsDynPreviewInMsgSyncPerformance,
    CvsDynPreviewOutMsg
} from "./worker/CanvasDynamicPreviewWorker";

const createDynPreviewCanvasWorker = () => new Worker(new URL("./worker/CanvasDynamicPreviewWorker.ts", import.meta.url));

export interface CanvasDynPreviewProps {
    duration: number;
    render: PlixEffectJsonData;
    track: PlixJsonData;
    fieldConfig: FieldConfig
}
export const CanvasDynPreview:FC<CanvasDynPreviewProps> = ({duration, render, track, fieldConfig}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [worker, setWorker] = useState<Worker>();

    const lastUsedSize = useRef<any[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    const playbackStatus = usePlaybackStatus();
    const {playFromStamp, pauseTime, rate} = usePlaybackData()

    useEffect(() => {
        if (!canvas) return;
        const worker = createDynPreviewCanvasWorker();
        setWorker(worker);
        const msg: CvsDynPreviewInMsgInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen(),
            performanceValue: performance.now()
        }

        worker.addEventListener("message", (event) => {
            const data: CvsDynPreviewOutMsg = event.data;
            if (data.type !== "deps") return;
            const [usedEffectNames, usedFilterNames] = data.deps;
            lastUsedEffectNames.current = usedEffectNames;
            lastUsedFilterNames.current = usedFilterNames;
            lastUsedEffects.current = usedEffectNames.map(name => track.effects[name]);
            lastUsedFilters.current = usedFilterNames.map(name => track.filters[name]);
        });
        worker.postMessage(msg, [msg.canvas]);

        return () => {
            worker.terminate()
        }
    }, [canvas])

    useEffect(() => {
        if (!worker) return;

        function isRerenderRequired(): boolean{
            if (!isArraysEqual(lastUsedSize.current, [duration, fieldConfig])) {
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

        lastUsedSize.current = [duration, fieldConfig];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: CvsDynPreviewInMsgRenderData = {type: "render", data: {render, track, duration}};

        worker.postMessage(message, []);
    }, [worker, duration, render, track.filters, track.effects]);

    useEffect(() => {
        if (!worker) return;

        const msg: CvsDynPreviewInMsgChangeField = {
            type: "field",
            config: fieldConfig
        }
        worker.postMessage(msg, [])

    }, [worker, fieldConfig])

    useEffect(() => {
        if (!worker) return;
        const msgSync: CvsDynPreviewInMsgSyncPerformance = {
            type:"sync_performance",
            value: performance.now()
        }
        worker.postMessage(msgSync, [])

        const msg: CvsDynPreviewInMsgChangePlayback = {
            type:"change_playback",
            status: playbackStatus,
            pauseTime: pauseTime,
            rate: rate,
            playFromStamp: playFromStamp,
        }
        worker.postMessage(msg, [])

    }, [playbackStatus, worker, pauseTime, rate, playFromStamp])


    return (
        <div>
            <canvas ref={setCanvas}/>
        </div>
    )
}