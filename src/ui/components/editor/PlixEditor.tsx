import {FC, default as React, useMemo} from "react";
import "./PlixEditor.scss";
import {SplitTopBottom} from "../divider/SplitTopBottom";
import {SplitLeftRight} from "../divider/SplitLeftRight";
import {TrackEditor} from "./TrackEditor";
import {TrackContextProps, TrackContext} from "./TrackContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import {SplitTimeline} from "../divider/SplitTimeline";

const track: PlixJsonData = {
    effects: {
        paintSome: [true, "Paint", [[[0,1,0.5], [0.33,1,0.5], [0,1,0.5], [0.33,1,0.5], [0,1,0.5], [0.33,1,0.5]]]],
        paintSomeLeft: [true, null, "paintSome", [[true, null, "posLeft"]]],
        paintSomeRight: [true, null, "paintSome", [[true, null, "posRight"]]]
    },
    filters: {
        posLeft: [true, "Position", [[0,1,2]]],
        posRight: [true, "Position", [[9,8,7]]]
    },
    render: [true, "Chain", [
        [true, null, "paintSomeLeft"],
        [true, null, "paintSomeRight"],
    ], [[true, "OuterBorder", [[0,1,1], 1]]]]
};

export const PlixEditor: FC = () => {
    const trackContextValue: TrackContextProps = useMemo(() => ({
        track: track,
        modify: () => {},
        effectConstructorMap: effectConstructorMap as TrackContextProps["effectConstructorMap"],
        filterConstructorMap: filterConstructorMap as TrackContextProps["filterConstructorMap"],
    }), []);

    return (
        <div className="plix-editor">
            <SplitTopBottom minTop={100} minBottom={200} storageKey="s1">
                <TrackContext.Provider value={trackContextValue}>
                    <TrackEditor />
                </TrackContext.Provider>
                <SplitTimeline minLeft={100} minRight={100} storageKey="tl">
                    <div style={{backgroundColor: "#fdd", flexGrow: 1}}>
                        HEADER<br/>HEADER<br/>HEADER
                    </div>
                    <div style={{backgroundColor: "#fdf", flexGrow: 1}}>
                            (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                    </div>
                    <div style={{backgroundColor: "#ffd", flexGrow: 1}}>
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                        (TREE_TREE_TREE_TREE_TREE_TREE)
                    </div>
                    <div style={{backgroundColor: "#dff", flexGrow: 1}}>
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                        (TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE_TIMELINE)
                    </div>
                </SplitTimeline>
            </SplitTopBottom>
        </div>
    )
}