import React, {
    DragEvent,
    DragEventHandler,
    FC, InputHTMLAttributes,
    memo,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixFilterJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData, PlixEffectJsonData,
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {useExpander} from "../track-elements/Expander";
import {EditValueAction, MultiAction, MultiActionType, RenameAliasAction} from "../PlixEditorReducerActions";
import "./tracks.scss";
import {InlineFilterTypeEditor} from "./editor/inline/InlineFilterTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockFilter} from "./editor/TreeBlockFilter";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";
import {ConstructorContext} from "../ConstructorContext";
import {TreeBlock} from "../track-elements/TreeBlock";
import {InlineInputEditor} from "./editor/inline/InlineInputEditor";

export interface RenameTrackProps {
    value: string,
    type: "effect"|"filter",
}
export const RenameTrack: FC<RenameTrackProps> = memo(({value, type}) => {

    const {dispatch, track} = useContext(TrackContext);
    const {effectConstructorMap, filterConstructorMap} = useContext(ConstructorContext);
    const onChange = useCallback((inputValue: string) => {
        if (!inputValue) return;
        if (inputValue.startsWith("@")) return;

        const trackKeys = Object.keys(type === "effect" ? track.effects : track.filters);
        if (trackKeys.includes(inputValue)) return;
        dispatch(RenameAliasAction(type, value, inputValue, effectConstructorMap, filterConstructorMap));
    }, [dispatch, track, effectConstructorMap, filterConstructorMap]);

    return (
        <Track>
            <TreeBlock title={"rename all links"}>
                <span className="track-description">Alias name</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description">
                    <InlineInputEditor value={value} onChange={onChange} inputParams={inputParams} />
                </span>
            </TimelineBlock>
        </Track>
    )
});

const inputParams: InputHTMLAttributes<HTMLInputElement> = {
    type: "text",
    minLength: 1
}
