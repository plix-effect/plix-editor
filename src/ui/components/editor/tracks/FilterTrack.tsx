import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixFilterJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData, PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {EditValueAction, MultiAction, MultiActionType} from "../PlixEditorReducerActions";
import {FilterTypeTrack} from "./FilterTypeTrack";
import "./tracks.scss";
import {InlineFilterTypeEditor} from "./editor/inline/InlineFilterTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockEffect} from "./editor/TreeBlockEffect";
import {TreeBlockFilter} from "./editor/TreeBlockFilter";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface FilterTrackProps {
    baseExpanded?: boolean,
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode,
    alias?: string,
    deleteAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const FilterTrack: FC<FilterTrackProps> = memo(({baseExpanded, filter, path, children, alias, deleteAction, onDragOverItem}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "filter", value: filter},
            filter: filter,
            filterLink: alias && [true, null, alias],
            deleteAction: deleteAction
        }
    }, [filter, alias, deleteAction]);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, value: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, value);
        if (originDragHandler) return originDragHandler;
        if (!value) return;

        let mode: "copy"|"move"|"link"|"none" = "none";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = value.deleteAction ? "move" : "none";
        else if (value.filterLink) mode = "link";
        else if (value.filter) mode = "copy";

        if (mode === "none") return void (value.dropEffect = "none");

        let valueFilter: PlixFilterJsonData;

        if (value.filter && mode !== "link") {
            valueFilter = value.filter;
        }

        if (!valueFilter && value.filterLink && mode === "link") {
            valueFilter = value.filterLink;
        }
        if (!valueFilter) return void (value.dropEffect = "none");
        value.dropEffect = mode;

        if (filter === valueFilter) return void (value.dropEffect = "none");
        if (mode === "move") {
            if (isObjectEqualOrContains(valueFilter, filter)) return void (value.dropEffect = "none");
        }
        if (mode === "link" && valueFilter[2] === alias) return void (value.dropEffect = "none");
        return () => {
            let changeAction = EditValueAction(path, valueFilter);
            if (mode === "move" && value.deleteAction) {
                dispatch(MultiAction([changeAction, value.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        };
    }, [onDragOverItem, path, dispatch]);


    const {filterConstructorMap} = useContext(TrackContext);
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

    const leftBlock = (
        <TreeBlockFilter
            filter={filter}
            changeExpanded={changeExpanded}
            expander={expander}
            path={path}
            deleteAction={deleteAction}
            dragValue={dragValue}
            onDragOverItem={onDragOverItemSelf}
        > {children} </TreeBlockFilter>
    )

    if (!filter) return <NoFilterTrack
        onChange={onChangeFilter}
        path={path}
        expanded={expanded}
        leftBlock={leftBlock}
    >{children}</NoFilterTrack>
    if (filter[1] === null) return (
        <AliasFilterTrack
            path={path}
            expanded={expanded}
            filter={filter as PlixFilterAliasJsonData}
            leftBlock={leftBlock}
            onChange={onChangeFilter}
        />
    );
    return <ConfigurableFilterTrack
        path={path}
        expanded={expanded}
        filter={filter as PlixFilterConfigurableJsonData}
        leftBlock={leftBlock}
        onChange={onChangeFilter}
    />
})

export interface NoFilterTrackProps {
    path: EditorPath,
    children: ReactNode,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    expanded: boolean,
    leftBlock: ReactNode;
}
const NoFilterTrack: FC<NoFilterTrackProps> = memo(({expanded, onChange, leftBlock}) => {
    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChange} filter={null} />
            </TimelineBlock>
        </Track>
    )
});

interface AliasFilterTrackProps {
    filter: PlixFilterAliasJsonData
    path: EditorPath,
    expanded: boolean,
    leftBlock: ReactNode;
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const AliasFilterTrack: FC<AliasFilterTrackProps> = memo(({filter, leftBlock, expanded, onChange}) => {
    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChange} filter={filter} />
            </TimelineBlock>
        </Track>
    )
});

interface ConfigurableFilterTrackProps {

    filter: PlixFilterConfigurableJsonData
    path: EditorPath,
    expanded: boolean,
    leftBlock: ReactNode,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const ConfigurableFilterTrack: FC<ConfigurableFilterTrackProps> = memo(({filter, filter: [enabled, filterId, params], onChange, path, expanded, leftBlock}) => {
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
            {leftBlock}
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