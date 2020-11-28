import React, {FC, ReactNode, useCallback, useContext, useMemo, memo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {getArrayKey} from "../../../utils/KeyManager";
import {EditValueAction, PushValueAction} from "../PlixEditorReducerActions";

import "./tracks.scss"
import {ArrayElementsTrack} from "./ArrayElementsTrack";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {EffectPreview} from "./editor/EffectPreview";
import {ConstructorContext} from "../ConstructorContext";

export interface ContainerEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    expanded: boolean,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    leftBlock?: ReactNode,
}
export const ContainerEffectTrack: FC<ContainerEffectTrackProps> = memo((
    {
        leftBlock,
        effect,
        effect: [enabled, effectId, params, filters],
        path,
        expanded,
        onChange,
    }
) => {
    const paramEffects = useMemo(() => params[0] || [], [params]);
    const paramEffectsPath = useMemo(() => [...path, 2, 0], [path]);
    const effectWithNoFilters: PlixEffectConfigurableJsonData = useMemo(() => [enabled, effectId, params, []], [effect])

    const {effectConstructorMap} = useContext(ConstructorContext);
    const effectData = useMemo(() => {
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        const paramDescriptions = meta.paramNames.slice(1).map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i+1],
            description: meta.paramDescriptions[i+1],
            value: params[i+1],
            path: [...path, 2, {key: getArrayKey(params, i+1), array: params}]
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params, path, effectConstructorMap]);

    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);

    const {dispatch} = useContext(TrackContext);
    const push = useCallback(() => {
        dispatch(PushValueAction([...path, 2, 0], null));
    }, [path]);

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                {(valueFilters?.length > 0) && (
                    <>
                        <EffectPreview effect={effectWithNoFilters} />
                        <i className="fas fa-long-arrow-alt-right" style={{marginLeft: 5, marginRight: 5}}/>
                    </>
                )}
                <EffectPreview effect={effect} />
                &nbsp;
                <a onClick={push}>[add effect]</a>
                &nbsp;
                <span className="track-description _desc">{effectData.description}</span>
            </TimelineBlock>

            <EffectTypeTrack onChange={onChange} effect={effect} />

            <ArrayElementsTrack value={paramEffects} type="effect" path={paramEffectsPath} canDelete/>

            {effectData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description}>
                    {paramDesc.name}
                </ValueTrack>
            ))}

            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" clearAction={clearFilters}>
                Filters
            </ValueTrack>
        </Track>
    )
})