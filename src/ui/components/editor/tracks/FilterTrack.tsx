import React, {FC, memo, ReactNode, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixFilterJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {EditValueAction} from "../PlixEditorReducerActions";
import {FilterTypeTrack} from "./FilterTypeTrack";
import "./tracks.scss";
import {InlineFilterTypeEditor} from "./editor/inline/InlineFilterTypeEditor";

export interface FilterTrackProps {
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode,
}
export const FilterTrack: FC<FilterTrackProps> = memo(({filter, path, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(false);

    const {filterConstructorMap} = useContext(TrackContext);
    const {dispatch} = useContext(TrackContext);
    const onChangeFilter = useCallback((type: null|"alias"|"constructor", value?: string) => {
        if (!type) {
            return dispatch(EditValueAction(path, null));
        }
        const templateFilter = filter ? filter.slice(0) : [true, null, []];
        if (type === "alias") {
            templateFilter[1] = null;
            templateFilter[2] = value;
        }
        if (type === "constructor") {
            templateFilter[1] = value;
            const filterConstructor = filterConstructorMap[value];
            const meta: ParseMeta = filterConstructor['meta'];
            templateFilter[2] = meta.defaultValues;
        }
        return dispatch(EditValueAction(path, templateFilter));
    }, [filter, dispatch]);

    if (!filter) return <NoFilterTrack
        onChange={onChangeFilter}
        path={path}
        expanded={expanded}
        expander={expander}
        changeExpanded={changeExpanded}
    >{children}</NoFilterTrack>
    if (filter[1] === null) return (
        <AliasFilterTrack
            path={path}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
            filter={filter as PlixFilterAliasJsonData}
            children={children}
            onChange={onChangeFilter}
        />
    );
    return <ConfigurableFilterTrack
        path={path}
        expanded={expanded}
        changeExpanded={changeExpanded}
        expander={expander}
        filter={filter as PlixFilterConfigurableJsonData}
        children={children}
        onChange={onChangeFilter}
    />
})

export interface NoFilterTrackProps {
    path: EditorPath,
    children: ReactNode,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    changeExpanded: () => void,
    expanded: boolean,
    expander: ReactNode;
}
const NoFilterTrack: FC<NoFilterTrackProps> = memo(({children, expanded, expander, changeExpanded, onChange}) => {
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _empty">empty</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChange} filter={null} />
            </TimelineBlock>
        </Track>
    )
});

interface AliasFilterTrackProps {
    filter: PlixFilterAliasJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void,
    expander: ReactNode;
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const AliasFilterTrack: FC<AliasFilterTrackProps> = memo(({filter, filter: [enabled ,, link], children, changeExpanded, expanded, expander, onChange}) => {
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _link">{link}</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChange} filter={filter} />
            </TimelineBlock>

        </Track>
    )
});

interface ConfigurableFilterTrackProps {

    filter: PlixFilterConfigurableJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void
    expander: ReactNode;
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const ConfigurableFilterTrack: FC<ConfigurableFilterTrackProps> = memo(({filter, filter: [enabled, filterId, params], changeExpanded, children, path, expanded, expander, onChange}) => {
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
                    <span className="track-description _desc">
                        {filterData.description}
                    </span>
                </span>
            </TimelineBlock>

            <FilterTypeTrack filter={filter} onChange={onChange}/>

            {filterData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name}>
                    {paramDesc.name}
                </ValueTrack>
            ))}
        </Track>
    )
})