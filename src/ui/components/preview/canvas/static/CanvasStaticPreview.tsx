import React, {FC, useContext, useEffect, useMemo, useRef, useState} from "react";
import {PlixEffectAliasJsonData, PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {getParentSelection, useSelectionItem, useSelectionPath} from "../../../editor/SelectionContext";
import {TrackContext} from "../../../editor/TrackContext";
import {ConstructorContext} from "../../../editor/ConstructorContext";
import {
    StaticPreviewWorkerInputMessageEffect,
    StaticPreviewWorkerInputMessageInit, StaticPreviewWorkerInputMessageSizes,
    StaticPreviewWorkerOutputMessage
} from "./worker/StaticCanvasWorker";
import {useProfile, useProfileName} from "../../../editor/ProfileContext";
import {isArraysEqual} from "../../../../utils/isArraysEqual";
import { withResizeDetector } from 'react-resize-detector';
import {CvsDynPreviewInMsgChangeField, CvsDynPreviewOutMsg} from "../dynamic/worker/CanvasDynamicPreviewWorker";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "../dynamic/preview-field/PlixCanvasField";
import "./CanvasStaticPreview.scss"
import {TIMELINE_LCM} from "@plix-effect/core/dist/effects/Timeline";

const createStaticPreviewCanvasWorker = () => new Worker(new URL("./worker/StaticCanvasWorker.ts", import.meta.url));

const CanvasStaticPreviewCp: FC<{width: number, height: number}> = ({width, height}) => {
    const difRef = useRef<HTMLDivElement>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [worker, setWorker] = useState<Worker>();




    const lastUsedSize = useRef<any[]>([]);
    const lastUsedEffectRef = useRef<PlixEffectJsonData>();
    const lastUsedEffectNames = useRef<string[]|null>();
    const lastUsedFilterNames = useRef<string[]|null>();
    const lastUsedEffects = useRef<any[]>();
    const lastUsedFilters = useRef<any[]>();

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const {effectConstructorMap, filterConstructorMap} = useContext(ConstructorContext);

    const profile = useProfile();
    const [profileName] = useProfileName();
    const profileRef = useRef(profile);
    profileRef.current = profile;

    const trackDuration = track['editor'].duration;

    const fieldConfig: PreviewFieldConfig = useMemo(() => {
        return profile?.['fieldConfig'] ?? track?.['editor']?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG;
    }, [profile, track]);

    const [render, start, duration] = useMemo(() => {
        if (selectedType === "effect") {
            if (selectedItem) {
                const copySelectedItem = selectedItem.slice(0);
                copySelectedItem[0] = true;
                return [copySelectedItem, 0, trackDuration]
            }
            else return [selectedItem, 0, trackDuration];
        } else if (selectedType === "record") {
            const parentSelection = getParentSelection(track, path, effectConstructorMap, filterConstructorMap, 3);
            const timeline = parentSelection.item;
            const parentOptions = timeline[2];
            const bpm = parentOptions[1];
            const offset = parentOptions[3];
            const start = offset + 60000/bpm / TIMELINE_LCM * selectedItem[2];
            const duration = (selectedItem[3]-selectedItem[2]) *  60000/bpm/TIMELINE_LCM
            const effect: PlixEffectAliasJsonData = [true, null, selectedItem[1], []]
            return [effect, start, duration]
        }
        return [track.render, 0, trackDuration];
    }, [selectedItem, selectedType, fieldConfig, track, trackDuration]);

    useEffect(() => {
        if (!canvas) return;
        const worker = createStaticPreviewCanvasWorker();
        setWorker(worker);
        const msg: StaticPreviewWorkerInputMessageInit = {
            type: "init",
            canvas: canvas.transferControlToOffscreen()
        }

        worker.addEventListener("message", (event) => {
            const data: StaticPreviewWorkerOutputMessage = event.data;
            const [usedEffectNames, usedFilterNames] = data;
            lastUsedEffectNames.current = usedEffectNames;
            lastUsedFilterNames.current = usedFilterNames;
            lastUsedEffects.current = usedEffectNames.map(name => {
                const effect = profileRef.current?.effects?.[name];
                if (effect !== undefined) return effect;
                return track.effects[name];
            });
            lastUsedFilters.current = usedFilterNames.map(name => {
                const filter = profileRef.current?.filters?.[name];
                if (filter !== undefined) return filter;
                return track.filters[name]
            });
        });
        worker.postMessage(msg, [msg.canvas]);

        return () => {
            worker.terminate()
        }
    }, [canvas])

    useEffect(() => {
        if (!worker) return;

        function isRerenderRequired(): boolean{
            if (!isArraysEqual(lastUsedSize.current, [width, height, duration, start])) {
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

        lastUsedSize.current = [width, height, duration, start];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: StaticPreviewWorkerInputMessageEffect = {type: "effect", render, track, profileName, duration, start};

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
        <div className={"canvas-static-preview _container"}>
            <span className={"_bg"}>
                <canvas ref={setCanvas} className={"_canvas"}/>
            </span>
        </div>
    )
}

export const CanvasStaticPreview = withResizeDetector(CanvasStaticPreviewCp, {refreshMode: "throttle" })