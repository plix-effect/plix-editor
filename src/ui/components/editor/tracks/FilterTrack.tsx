import React, {FC, memo, ReactNode, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixEffectJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData,
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
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";

export interface FilterTrackProps {
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode
}
export const FilterTrack: FC<FilterTrackProps> = memo(({filter, path, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);

    if (!filter) return <NoFilterTrack path={path}>{children}</NoFilterTrack>
    if (filter[1] === null) return (
        <AliasFilterTrack
            path={path}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
            filter={filter as PlixFilterAliasJsonData}
            children={children}
        />
    );
    return <ConfigurableFilterTrack
        path={path}
        expanded={expanded}
        changeExpanded={changeExpanded}
        expander={expander}
        filter={filter as PlixFilterConfigurableJsonData}
        children={children}
    />
})

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
    changeExpanded: () => void,
    expander: ReactNode;
}
const AliasFilterTrack: FC<AliasFilterTrackProps> = ({filter: [enabled ,, link], children, changeExpanded, expanded, expander}) => {
    return (
        <Track>
            <TreeBlock>
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _link">{link}</span>
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
    changeExpanded: () => void
    expander: ReactNode;
}
const ConfigurableFilterTrack: FC<ConfigurableFilterTrackProps> = ({filter: [enabled, filterId, params], changeExpanded, children, path, expanded, expander}) => {
    const {filterConstructorMap} = useContext(TrackContext);
    const filterData = useMemo(() => {
        const filterConstructor = filterConstructorMap[filterId];
        const meta: ParseMeta = filterConstructor['meta'];
        const paramDescriptions = meta.paramNames.map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i],
            description: meta.paramDescriptions[i],
            value: params[i],
            path: [...path, 2, {key: getArrayKey(params, i), array: params}] as EditorPath
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [filterId, params])
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _type">{filterData.name}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description ">
                    <span className="track-description">--- edit filter</span>
                </span>
            </TimelineBlock>
            <Track>
                <TreeBlock type="description">description</TreeBlock>
                <TimelineBlock fixed type="description">{filterData.description}</TimelineBlock>
            </Track>
            {filterData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name}>
                    {paramDesc.name}
                </ValueTrack>
            ))}
        </Track>
    )
}