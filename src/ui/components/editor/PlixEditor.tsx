import {FC, default as React, useMemo, useReducer, useState} from "react";
import "./PlixEditor.scss";
import {SplitTopBottom} from "../divider/SplitTopBottom";
import {TrackEditor} from "./TrackEditor";
import {TrackContextProps, TrackContext} from "./TrackContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import {PlixEditorReducer} from "./PlixEditorReducer";
import {ScaleDisplayContext, ScaleDisplayContextProps} from "./ScaleDisplayContext";

const defaultTrack: PlixJsonData = {
    effects: {
        paintSome: [true, "Paint", [[[0,1,0.5, 0.5], [0.33,1,0.5, 0.5], [0,1,0.5], [0.33,1,0.5], [0,1,0.5], [0.33,1,0.5]]]],
        paintSomeLeft: [true, null, "paintSome", [[true, null, "posLeft"]]],
        paintSomeRight: [true, null, "paintSome", [[true, null, "posRight"]]]
    },
    filters: {
        posLeft: [true, "Position", [[0,1,2]]],
        posRight: [true, "Position", [[9,8,7]]],
        posCenter: [true, "Position", [[3,4,5,6]]]
    },
    render: [true, "Chain", [[
        [true, null, "paintSomeLeft"],
        [true, null, "paintSomeRight"],
        [
            true,
            "Timeline",
            [
                [
                    [true, "paintSome", 0, 500],
                    [true, "paintSomeRight", 1250, 250],
                    [true, "paintSome", 1750, 250],
                ],
                1000, 8, 0
            ],
            [[true, null, "posCenter"]]
        ],
        [
            true,
            "Timeline",
            [
                [
                    [true, "paintSome", 0, 500],
                    [true, "paintSomeRight", 1250, 250],
                    [true, "paintSome", 1750, 250],
                ],
                1347, 3, 5000
            ],
            [[true, null, "posCenter"]]
        ],
    ]], [[true, "OuterBorder", [[0,1,1], 1]]]]
};

export const PlixEditor: FC = () => {

    const [zoom, setZoom] = useState(0.1);
    const [duration, setDuration] = useState(1000*60*5 + 2257);
    const [position, setPosition] = useState(0.01);

    const [{track, history, historyPosition}, dispatch] = useReducer(PlixEditorReducer, defaultTrack, (track) => ({
        track: track,
        history: [],
        historyPosition: 0
    }));

    const trackContextValue: TrackContextProps = useMemo(() => ({
        undoCounts: historyPosition,
        redoCounts: history.length - historyPosition,
        track,
        dispatch,
        effectConstructorMap: effectConstructorMap as TrackContextProps["effectConstructorMap"],
        filterConstructorMap: filterConstructorMap as TrackContextProps["filterConstructorMap"],
    }), [track, dispatch, historyPosition, history]);

    const scaleDisplayContextValue: ScaleDisplayContextProps = useMemo(() => ({
        track,
        duration, setDuration,
        zoom, setZoom,
        position, setPosition,
        trackWidth: zoom * duration
    }), [track, duration, setDuration, zoom, setZoom, position, setPosition, dispatch]);

    return (
        <div className="plix-editor">
            <TrackContext.Provider value={trackContextValue}>
            <SplitTopBottom minTop={100} minBottom={200} storageKey="s1">

                    <ScaleDisplayContext.Provider value={scaleDisplayContextValue}>
                        <TrackEditor />
                    </ScaleDisplayContext.Provider>
                <div>LIBS AND CANVAS</div>
            </SplitTopBottom>
            </TrackContext.Provider>
        </div>
    )
}