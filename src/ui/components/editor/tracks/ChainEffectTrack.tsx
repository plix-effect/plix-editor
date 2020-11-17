import React, {FC, ReactNode, useCallback, useContext, Fragment, useMemo, memo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {PushValueAction} from "../PlixEditorReducerActions";

import "./tracks.scss"
import {ArrayTrack} from "./ArrayTrack";
import {ArrayElementsTrack} from "./ArrayElementsTrack";

export interface ChainEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const ChainEffectTrack: FC<ChainEffectTrackProps> = memo(({effect: [enabled, effectId, params, filters], path, baseExpanded, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    const paramEffects = useMemo(() => params[0] || [], [params]);
    const paramEffectsPath = useMemo(() => [...path, 2, 0], [path]);

    const {effectConstructorMap} = useContext(TrackContext);
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

    const effectsListData = useMemo(() => {
        return paramEffects.map((val, i) => {
            const key = getArrayKey(paramEffects, i);
            const valPath: EditorPath = [...path, 2, 0, {key: String(key), array: paramEffects}]
            return {
                path: valPath,
                key: key,
                value: val,
                index: i,
            }
        })
    }, [paramEffects, path]);

    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);

    const {dispatch} = useContext(TrackContext);
    const push = useCallback(() => {
        dispatch(PushValueAction([...path, 2, 0], null));
    }, [path])

    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _type">{effectData.name}</span>
                {" "}
                <span className="track-description _desc">({paramEffects.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
               <a onClick={push}>[add effect]</a>
            </TimelineBlock>
            <ArrayElementsTrack value={paramEffects} type="effect" path={paramEffectsPath}/>

            {effectData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description}>
                    {paramDesc.name}
                </ValueTrack>
            ))}

            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" key="filters">
                Filters
            </ValueTrack>
        </Track>
    )
})
