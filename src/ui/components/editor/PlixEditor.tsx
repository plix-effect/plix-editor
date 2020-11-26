import {FC, default as React, useMemo, useReducer, useState, useRef, useEffect} from "react";
import "./PlixEditor.scss";
import {SplitTopBottom} from "../divider/SplitTopBottom";
import {TrackEditor} from "./TrackEditor";
import {TrackContextProps, TrackContext} from "./TrackContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import {PlixEditorReducer} from "./PlixEditorReducer";
import {DragContext, DragType} from "./DragContext";

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
        const onDragEnd = () => dragRef.current = null;
        document.addEventListener("dragend", onDragEnd);
        return () => document.removeEventListener("dragend", onDragEnd);
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

    return (
        <div className="plix-editor">
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