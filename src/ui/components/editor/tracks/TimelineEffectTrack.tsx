import React, {FC, memo, MouseEventHandler, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TimelineEditor} from "./editor/TimelineEditor";
import {ValueTrack} from "./ValueTrack";
import "./tracks.scss"
import {EditValueAction} from "../PlixEditorReducerActions";
import {TimelineBlinkPreview} from "./editor/TimelineBlinkPreview";
import {ParseMeta} from "../../../types/ParseMeta";
import {getArrayKey} from "../../../utils/KeyManager";
import {ConstructorContext} from "../ConstructorContext";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {EffectParamsTrack} from "./EffectParamsTrack";
import {RenameTrack} from "./RenameTrack";
import {InlineEffectPreview} from "./editor/inline/InlineEffectPreview";

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    alias?: string,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    expanded: boolean,
    leftBlock?: ReactNode
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = memo(({leftBlock, alias, effect, effect: [,effectId, params, filters], path, onChange, expanded}) => {

    const timelinePath = useMemo(() => [...path, 2, 0], [path]);

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock type="timeline">
                <TimelineEditor records={params[0]} bpm={params[1]} grid={params[2]} offset={params[3]} repeatStart={params[4]} repeatEnd={params[5]} path={timelinePath} />
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"effect"}/>)}

            <TimelineEffectTypeTrack effect={effect} effectPath={path} onChange={onChange} />

            <EffectParamsTrack effect={effect} path={path} skipParams={1}/>
        </Track>
    )
});

interface TimelineEffectTypeTrackProps {
    effect: PlixEffectConfigurableJsonData,
    effectPath: EditorPath,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const TimelineEffectTypeTrack: FC<TimelineEffectTypeTrackProps> = ({effect, onChange, effectPath}) => {
    const params = effect[2];
    const path = useMemo(() => [...effectPath, 1], [effectPath]);
    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) { // Alt
            onChange(null);
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [effect, select, toggleSelect, path]);

    return (
        <Track>
            <TreeBlock selected={selected} title="type of effect" onClick={onClick}>
                Effect type
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineEffectTypeEditor onChange={onChange} effect={effect} />
                <InlineEffectPreview effect={effect}/>
                <TimelineBlinkPreview bpm={params[1]} offset={params[3]} />
            </TimelineBlock>
        </Track>
    );
}