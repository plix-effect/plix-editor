import React, {FC, useContext, useEffect, useRef, useState} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {TrackContext} from "../../../editor/TrackContext";
import {
    StaticPreviewWorkerInputMessageEffect,
    StaticPreviewWorkerInputMessageInit, StaticPreviewWorkerInputMessageSizes,
    StaticPreviewWorkerOutputMessage
} from "./worker/StaticCanvasWorker";
import {useFieldConfig, useProfile, useProfileName} from "../../../editor/ProfileContext";
import {isArraysEqual} from "../../../../utils/isArraysEqual";
import "./CanvasStaticPreview.scss"

const createStaticPreviewCanvasWorker = () => new Worker(new URL("./worker/StaticCanvasWorker.ts", import.meta.url));

export interface CanvasStaticEffectPreviewProps {
    width: number,
    height: number,
    render: PlixEffectJsonData,
    startTime: number,
    duration: number,
    onChangeStatus?: (status: "none" | "parse" | "render" | "done" | "error", error: string|null) => void
}
export const CanvasStaticEffectPreview: FC<CanvasStaticEffectPreviewProps> = ({width, height, render, startTime, duration, onChangeStatus}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [worker, setWorker] = useState<Worker>();

    const lastUsedSize = useRef<any[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    const {track} = useContext(TrackContext);

    const profile = useProfile();
    const [profileName] = useProfileName();
    const profileRef = useRef(profile);
    profileRef.current = profile;

    const trackRef = useRef(track);
    trackRef.current = track;

    const fieldConfig = useFieldConfig();

    useEffect(() => {
        if (!canvas) return;
        const worker = createStaticPreviewCanvasWorker();
        setWorker(worker);
        const msg: StaticPreviewWorkerInputMessageInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen()
        }

        worker.addEventListener("message", (event) => {
            const message: StaticPreviewWorkerOutputMessage = event.data;
            if (message.type === "deps") {
                const [usedEffectNames, usedFilterNames] = message.data;
                lastUsedEffectNames.current = usedEffectNames;
                lastUsedFilterNames.current = usedFilterNames;
                lastUsedEffects.current = usedEffectNames.map(name => {
                    const effect = profileRef.current?.effects?.[name];
                    if (effect !== undefined) return effect;
                    return trackRef.current.effects[name];
                });
                lastUsedFilters.current = usedFilterNames.map(name => {
                    const filter = profileRef.current?.filters?.[name];
                    if (filter !== undefined) return filter;
                    return trackRef.current.filters[name];
                });
            } else if (message.type === "status") {
                onChangeStatus?.(message.status, message.error);
            }

        });
        worker.postMessage(msg, [msg.canvas]);

        return () => {
            worker.terminate()
        }
    }, [canvas])

    useEffect(() => {
        if (!worker) return;

        function isRerenderRequired(): boolean{
            if (!isArraysEqual(lastUsedSize.current, [width, height, duration, startTime])) {
                return true;
            }
            if (lastUsedEffectRef.current !== render) {
                return true;
            }
            if (!lastUsedEffectNames.current || !lastUsedFilterNames.current) {
                return true;
            }
            const usedEffects = lastUsedEffectNames.current.map(name => {
                const effect = profile?.effects?.[name];
                if (effect !== undefined) return effect;
                return track.effects[name];
            });
            if (!isArraysEqual(lastUsedEffects.current, usedEffects)) {
                return true;
            }
            const usedFilters = lastUsedFilterNames.current.map(name => {
                const filter = profile?.filters?.[name];
                if (filter !== undefined) return filter;
                return track.filters[name];
            });
            return !isArraysEqual(lastUsedFilters.current, usedFilters);

        }
        if (!isRerenderRequired()) return;

        lastUsedSize.current = [width, height, duration, startTime];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: StaticPreviewWorkerInputMessageEffect = {type: "effect", render, track, profileName, duration, start: startTime};

        worker.postMessage(message, []);
    }, [worker, render, track.filters, track.effects, profile, profileName, width, height, duration]);

    useEffect(() => {
        if (!worker) return;

        const msg: StaticPreviewWorkerInputMessageSizes = {
            type: "size",
            width: width ?? 1,
            height: height ?? 1,
            pixelCount: fieldConfig.elements.length
        }
        worker.postMessage(msg, [])

    }, [worker, width, height, fieldConfig])

    return (
        <div className="canvas-static-preview _container">
            <span className="_bg">
                <canvas ref={setCanvas} className="_canvas"/>
            </span>
        </div>
    )
}