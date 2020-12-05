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

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    expanded: boolean,
    leftBlock?: ReactNode
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = memo(({leftBlock, effect, effect: [,effectId, params, filters], path, onChange, expanded}) => {

    const filtersPath = useMemo(() => [...path, 3], [path]);
    const timelinePath = useMemo(() => [...path, 2, 0], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    const {effectConstructorMap} = useContext(ConstructorContext);

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

    const effectData = useMemo(() => {
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        const paramDescriptions = meta.paramNames.slice(1).map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i+1],
            description: meta.paramDescriptions[i+1],
            value: params[i+1],
            path: [...path, 2, {key: getArrayKey(params, i+1)}]
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params, path, effectConstructorMap]);


    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock type="timeline">
                <TimelineEditor records={params[0]} bpm={params[1]} grid={params[2]} offset={params[3]} repeatStart={params[4]} repeatEnd={params[5]} path={timelinePath} />
            </TimelineBlock>

            <TimelineEffectTypeTrack effect={effect} effectPath={path} onChange={onChange} />

            {effectData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description} title={paramDesc.description}>
                    {paramDesc.name}
                </ValueTrack>
            ))}

            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" clearAction={clearFilters} title="filters applied to effect">
                Filters
            </ValueTrack>
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
                <TimelineBlinkPreview bpm={params[1]} offset={params[3]} />
            </TimelineBlock>
        </Track>
    );
}