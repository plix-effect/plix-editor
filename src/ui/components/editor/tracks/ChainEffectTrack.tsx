import React, {FC, ReactNode, useCallback, useContext, Fragment, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {
    PlixEffectAliasJsonData,
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {TimelineEditor} from "./editor/timeline/TimelineEditor";
import {PushValueAction} from "../PlixEditorReducerActions";

export interface ChainEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const ChainEffectTrack: FC<ChainEffectTrackProps> = ({effect: [enabled, effectId, params, filters], path, baseExpanded, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    const paramEffects = useMemo(() => params[0] || [], [params]);

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
        <Track>
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
            <TrackAccord expanded={expanded}>
                <Fragment key="effects">
                    {effectsListData.map(({key, value, path, index}) => {
                        return (
                            <ValueTrack key={"ee_"+key} type="effect" value={value} path={path}>
                                [{index}]
                            </ValueTrack>
                        )
                    })}
                </Fragment>
                <Fragment key="params">
                    {effectData.paramDescriptions.map((paramDesc) => (
                        <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={"ep_"+paramDesc.name} description={paramDesc.description}>
                            {paramDesc.name}
                        </ValueTrack>
                    ))}
                </Fragment>
                <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" key="filters">
                    Filters
                </ValueTrack>
            </TrackAccord>
        </Track>
    )
}
