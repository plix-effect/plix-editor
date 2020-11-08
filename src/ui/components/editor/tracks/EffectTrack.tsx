import React, {FC, ReactNode, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {
    PlixEffectAliasJsonData,
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ArrayTrack} from "./ArrayTrack";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

import "./tracks.scss"

export interface EffectTrackProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const EffectTrack: FC<EffectTrackProps> = ({effect, path, baseExpanded, children}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => setExpanded(v => !v), [setExpanded]);

    if (!effect) return <NoEffectTrack path={path}>{children}</NoEffectTrack>
    if (effect[1] === null) return (
        <AliasEffectTrack
            path={path}
            expanded={expanded}
            changeExpanded={changeExpanded}
            effect={effect as PlixEffectAliasJsonData}
            children={children}
        />
    );
    return <ConfigurableEffectTrack
        path={path}
        expanded={expanded}
        changeExpanded={changeExpanded}
        effect={effect as PlixEffectConfigurableJsonData}
        children={children}
    />
}

////////////////////////////////////////////////////////////

export interface NoEffectTrackProps {
    path: EditorPath,
    children: ReactNode
}
const NoEffectTrack: FC<NoEffectTrackProps> = ({children}) => {
    return (
        <Track>
            <TreeBlock>
                {children} <span className="track-description _empty">empty</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _empty">empty</span>
            </TimelineBlock>
        </Track>
    )
}

interface AliasEffectTrackProps {
    effect: PlixEffectAliasJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void;
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = ({effect: [enabled ,, link, filters], path, children, expanded, changeExpanded}) => {
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track>
            <TreeBlock>
                <a onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>{' '}
                {children} <span className="track-description _link">{link}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    use alias effect: <span className="track-description _link">{link}</span>
                </span>
            </TimelineBlock>
            <TrackAccord expanded={expanded}>
                <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect">
                    Filters
                </ValueTrack>
            </TrackAccord>
        </Track>
    )
}

interface ConfigurableEffectTrackProps {

    effect: PlixEffectConfigurableJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void;
}
const ConfigurableEffectTrack: FC<ConfigurableEffectTrackProps> = ({effect: [enabled, effectId, params, filters], children, path, expanded, changeExpanded}) => {
    const {effectConstructorMap} = useContext(TrackContext);
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const effectData = useMemo(() => {
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        const paramDescriptions = meta.paramNames.map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i],
            description: meta.paramDescriptions[i],
            value: params[i],
            path: [...path, 2, i]
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params])
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track>
            <TreeBlock>
                <a onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>{' '}
                {children} <span className="track-description _type">{effectData.name}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    <span className="track-description">{effectData.description}</span>
                </span>
            </TimelineBlock>
            {params.length > 0 && (
                <TrackAccord expanded={expanded}>
                    {effectData.paramDescriptions.map((paramDesc) => (
                        <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description}>
                            {paramDesc.name}
                        </ValueTrack>
                    ))}
                    <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect">
                        Filters
                    </ValueTrack>
                </TrackAccord>
            )}
        </Track>
    )
}
