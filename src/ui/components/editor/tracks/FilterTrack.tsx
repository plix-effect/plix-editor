import React, {FC, ReactNode, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {TrackAccord} from "../../timeline/TrackAccord";
import {
    PlixEffectJsonData,
    PlixFilterAliasJsonData, PlixFilterConfigurableJsonData,
    PlixFilterEmptyJsonData,
    PlixFilterJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {ArrayTrack} from "./ArrayTrack";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import "./tracks.scss";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

export interface FilterTrackProps {
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode
}
export const FilterTrack: FC<FilterTrackProps> = ({filter, path, children}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => setExpanded(v => !v), [setExpanded]);

    if (!filter) return <NoFilterTrack path={path}>{children}</NoFilterTrack>
    if (filter[1] === null) return (
        <AliasFilterTrack
            path={path}
            expanded={expanded}
            changeExpanded={changeExpanded}
            filter={filter as PlixFilterAliasJsonData}
            children={children}
        />
    );
    return <ConfigurableFilterTrack
        path={path}
        expanded={expanded}
        changeExpanded={changeExpanded}
        filter={filter as PlixFilterConfigurableJsonData}
        children={children}
    />
}

export interface NoFilterTrackProps {
    path: EditorPath,
    children: ReactNode
}
const NoFilterTrack: FC<NoFilterTrackProps> = ({children}) => {
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

interface AliasFilterTrackProps {
    filter: PlixFilterAliasJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void;
}
const AliasFilterTrack: FC<AliasFilterTrackProps> = ({filter: [enabled ,, link], children, expanded, changeExpanded}) => {
    return (
        <Track>
            <TreeBlock>
                {children} <span className="track-description _link">{link}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    use alias effect: <span className="track-description _link">{link}</span>
                </span>
            </TimelineBlock>
        </Track>
    )
}

interface ConfigurableFilterTrackProps {

    filter: PlixFilterConfigurableJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void;
}
const ConfigurableFilterTrack: FC<ConfigurableFilterTrackProps> = ({filter: [enabled, filterId, params], children, path, expanded, changeExpanded}) => {
    const {filterConstructorMap} = useContext(TrackContext);
    const filterData = useMemo(() => {
        const filterConstructor = filterConstructorMap[filterId];
        const meta: ParseMeta = filterConstructor['meta'];
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
    }, [filterId, params])
    return (
        <Track>
            <TreeBlock>
                {filterData.paramDescriptions.length > 0 && (<>
                    <a onClick={changeExpanded}>[{expanded ? "-" : "+"}]</a>{' '}
                </>)}
                {children} <span className="track-description _type">{filterData.name}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    <span className="track-description">{filterData.description}</span>
                </span>
            </TimelineBlock>
            {params.length > 0 && (
                <TrackAccord expanded={expanded}>
                    {filterData.paramDescriptions.map((paramDesc) => (
                        <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name}>
                            {paramDesc.name}
                        </ValueTrack>
                    ))}
                </TrackAccord>
            )}
        </Track>
    )
}