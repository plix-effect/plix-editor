import {FC, default as React, useMemo, useReducer, useState, useRef, useEffect, useCallback, DragEvent} from "react";
import "./PlixEditor.scss";
import {SplitTopBottom} from "../divider/SplitTopBottom";
import {TrackEditor} from "./TrackEditor";
import {TrackContextProps, TrackContext} from "./TrackContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import {PlixEditorReducer} from "./PlixEditorReducer";
import {DragContext, DragType} from "./DragContext";
import {OpenAction} from "./PlixEditorReducerActions";

const defaultTrack: PlixJsonData & {editor: any} = {
    effects: {},
    filters: {},
    render: [true, "Chain", [[
        [true, "Timeline", [[], 1000, 8, 0], [[true, "Blend", [1, "normal"]]]],
        [true, "Timeline", [[], 1000, 8, 100], [[true, "Blend", [1, "normal"]]]],
        [true, "Timeline", [[], 0, 8, 1000], [[true, "Blend", [1, "normal"]]]],
    ]], []],
    editor: {duration: 10_000, count: 10}
};

export const PlixEditor: FC = () => {

    const dragRef = useRef<DragType>(null);
    useEffect(() => {
        const clearDragRef = () => dragRef.current = null;
        document.addEventListener("dragend", clearDragRef);
        document.addEventListener("drop", clearDragRef);
        return () => {
            document.removeEventListener("dragend", clearDragRef);
            document.removeEventListener("drop", clearDragRef);
        }
    }, [dragRef]);

    const [{track, history, historyPosition}, dispatch] = useReducer(PlixEditorReducer, null, () => {
        const savedTrack = localStorage.getItem("plix_editor_track");
        return ({
            track: (savedTrack ? JSON.parse(savedTrack) : defaultTrack) as PlixJsonData,
            history: [],
            historyPosition: 0
        });
    });

    useEffect(() => {
        localStorage.setItem("plix_editor_track", JSON.stringify(track));
    }, [track])

    const trackContextValue: TrackContextProps = useMemo(() => ({
        undoCounts: historyPosition,
        redoCounts: history.length - historyPosition,
        track,
        dispatch,
        effectConstructorMap: effectConstructorMap as TrackContextProps["effectConstructorMap"],
        filterConstructorMap: filterConstructorMap as TrackContextProps["filterConstructorMap"],
    }), [track, dispatch, historyPosition, history]);

    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        const items = Array.from(event.dataTransfer.items);
        let jsonItem = items.find(item => item.kind === "file" && item.type === "application/json");
        if (!jsonItem) return;
        event.preventDefault();
    }, []);

    const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
        const files = Array.from(event.dataTransfer.files);
        let jsonFile = files.find(file => file.type === "application/json");
        if (!jsonFile) return;
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const track = JSON.parse(String(event.target.result));
            dispatch(OpenAction(track));
        })
        reader.readAsBinaryString(jsonFile);
        event.preventDefault();
    }, []);

    return (
        <div className="plix-editor" onDragOver={onDragOver} onDrop={onDrop}>
            <DragContext.Provider value={dragRef}>
                <TrackContext.Provider value={trackContextValue}>
                <SplitTopBottom minTop={100} minBottom={200} storageKey="s1">
                        <TrackEditor />
                    <div>LIBS AND CANVAS</div>
                </SplitTopBottom>
                </TrackContext.Provider>
            </DragContext.Provider>
        </div>
    )
}