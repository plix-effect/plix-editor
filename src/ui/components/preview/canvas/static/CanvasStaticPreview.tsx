import React, {FC, useContext, useEffect, useMemo, useRef, useState} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
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

    const fieldConfig: PreviewFieldConfig = useMemo(() => {
        return profile?.['fieldConfig'] ?? track?.['editor']?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG;
    }, [profile, track]);

    const [render] = useMemo(() => {
        if (selectedType === "effect") {
            if (selectedItem) {
                const copySelectedItem = selectedItem.slice(0);
                copySelectedItem[0] = true;
                return [copySelectedItem]
            }
            else return [selectedItem];
        } else if (selectedType === "record") {
            const copySelectedItem = selectedItem.slice(0);
            copySelectedItem[0] = true; // enable selected track
            const parentSelection = getParentSelection(track, path, effectConstructorMap, filterConstructorMap, 3);
            const timeline = parentSelection.item.slice(0);
            timeline[0] = true; // enable timeline
            timeline[3] = []; // remove timeline filters
            const parentOptions = timeline[2].slice(0);
            parentOptions[0] = [copySelectedItem]; // set only one track
            timeline[2] = parentOptions;
            return [timeline]
        }
        return [track.render];
    }, [selectedItem, selectedType, fieldConfig, track]);

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
            if (!isArraysEqual(lastUsedSize.current, [width, height])) {
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

        lastUsedSize.current = [width, height];
        lastUsedEffectRef.current = render;
        lastUsedEffectNames.current = null;
        lastUsedFilterNames.current = null;

        const message: StaticPreviewWorkerInputMessageEffect = {type: "effect", render, track, profileName, duration: track['editor'].duration};

        worker.postMessage(message, []);
    }, [worker, render, track.filters, track.effects, profile, profileName, width, height]);

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
        <div style={{display: "flex", flexGrow: 1, position: "relative"}}>
            <span className={"canvas-static-preview-bg"}>
                <canvas ref={setCanvas} style={{position: "absolute"}}/>
            </span>
        </div>
    )
}

export const CanvasStaticPreview = withResizeDetector(CanvasStaticPreviewCp, {refreshMode: "throttle" })