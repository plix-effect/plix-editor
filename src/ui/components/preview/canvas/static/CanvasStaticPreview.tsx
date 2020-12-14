import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import {PlixEffectAliasJsonData} from "@plix-effect/core/types/parser";
import {getParentSelection, useSelectionItem, useSelectionPath} from "../../../editor/SelectionContext";
import {TrackContext} from "../../../editor/TrackContext";
import {ConstructorContext} from "../../../editor/ConstructorContext";
import { withResizeDetector } from 'react-resize-detector';
import "./CanvasStaticPreview.scss"
import {TIMELINE_LCM} from "@plix-effect/core";
import {CanvasStaticEffectPreview} from "./CanvasStaticEffectPreview";

const CanvasStaticPreviewCp: FC<{width: number, height: number}> = ({width, height}) => {

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const {effectConstructorMap, filterConstructorMap} = useContext(ConstructorContext);

    const [render, start, duration] = useMemo(() => {
        const trackDuration = track['editor'].duration;
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
    }, [selectedItem, selectedType, track]);

    const [status, setStatus] = useState<"none" | "parse" | "render" | "done" | "error">("none");
    const [errorMessage, setErrorMessage] = useState<string|null>(null);

    const changeStatusHandler = useCallback((status, error) => {
        setStatus(status);
        setErrorMessage(error);
    }, []);

    return (<>
        <CanvasStaticEffectPreview width={width??1} height={height??1} duration={duration} render={render} startTime={start} onChangeStatus={changeStatusHandler}/>
        {status === "parse" && (
            <div className="canvas-static-info _info">
                <i className="fas fa-hourglass-half"/> parsing
            </div>
        )}
        {status === "render" && (
            <div className="canvas-static-info _info">
                <i className="fas fa-hourglass-half"/> rendering
            </div>
        )}
        {status === "error" && (
            <div className="canvas-static-info _error">
                <i className="fas fa-exclamation-circle"/> {errorMessage}
            </div>
        )}
    </>)
}

export const CanvasStaticPreview = withResizeDetector(CanvasStaticPreviewCp, {refreshMode: "throttle" })