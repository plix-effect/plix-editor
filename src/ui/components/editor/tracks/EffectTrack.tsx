import React, {FC, ReactNode, useContext, useMemo} from "react";
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
import {TimelineEffectTrack} from "./TimelineEffectTrack";
import {ChainEffectTrack} from "./ChainEffectTrack";

export interface EffectTrackProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const EffectTrack: FC<EffectTrackProps> = ({effect, path, baseExpanded, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    if (!effect) return <NoEffectTrack path={path}>{children}</NoEffectTrack>
    if (effect[1] === null) return (
        <AliasEffectTrack
            path={path}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
            effect={effect as PlixEffectAliasJsonData}
            children={children}
        />
    );
    if (effect[1] === "Timeline") return (
        <TimelineEffectTrack effect={effect as PlixEffectConfigurableJsonData} path={path} children={children} baseExpanded={baseExpanded}/>
    )
    if (effect[1] === "Chain") return (
        <ChainEffectTrack effect={effect as PlixEffectConfigurableJsonData} path={path} children={children} baseExpanded={baseExpanded}/>
    )
    return <ConfigurableEffectTrack
        path={path}
        expanded={expanded}
        expander={expander}
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
    changeExpanded: () => void,
    expanded: boolean,
    expander: ReactNode;
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = ({effect: [enabled ,, link, filters], path, children, changeExpanded, expanded, expander}) => {
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _link">{link}</span>
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
    changeExpanded: () => void,
    expander: ReactNode;
}
const ConfigurableEffectTrack: FC<ConfigurableEffectTrackProps> = ({effect: [enabled, effectId, params, filters], children, changeExpanded, path, expanded, expander}) => {
    const {effectConstructorMap} = useContext(TrackContext);
    const effectData = useMemo(() => {
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        const paramDescriptions = meta.paramNames.map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i],
            description: meta.paramDescriptions[i],
            value: params[i],
            path: [...path, 2, {key: getArrayKey(params, i), array: params}]
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params]);
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _type">{effectData.name}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    --- edit effect
                </span>
            </TimelineBlock>
            {params.length > 0 && (
                <TrackAccord expanded={expanded}>
                    <Track>
                        <TreeBlock type="description">description</TreeBlock>
                        <TimelineBlock fixed type="description">{effectData.description}</TimelineBlock>
                    </Track>
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
