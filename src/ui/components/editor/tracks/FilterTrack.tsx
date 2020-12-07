import React, {
    DragEvent,
    DragEventHandler,
    FC,
    memo,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixFilterJsonData,
    PlixFilterAliasJsonData,
    PlixFilterConfigurableJsonData, PlixEffectJsonData,
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";
import {useExpander} from "../track-elements/Expander";
import {EditValueAction, MultiAction, MultiActionType} from "../PlixEditorReducerActions";
import "./tracks.scss";
import {InlineFilterTypeEditor} from "./editor/inline/InlineFilterTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockFilter} from "./editor/TreeBlockFilter";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";
import {ConstructorContext} from "../ConstructorContext";
import {FilterParamsTrack} from "./FilterParamsTrack";
import {RenameTrack} from "./RenameTrack";

export interface FilterTrackProps {
    baseExpanded?: boolean,
    filter: PlixFilterJsonData,
    path: EditorPath,
    children: ReactNode,
    title?: string,
    alias?: string,
    clearAction?: MultiActionType,
    deleteAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler],
    overrideValue?: PlixFilterJsonData
}
export const FilterTrack: FC<FilterTrackProps> = memo(({baseExpanded, overrideValue, title, filter, path, children, alias, deleteAction, onDragOverItem, clearAction}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const dragValue: DragType = useMemo<DragType>(() => {
        const dragFilter = filter === undefined ? overrideValue : filter;
        return {
            typedValue: {type: "filter", value: dragFilter},
            filter: dragFilter,
            filterLink: alias && [true, null, alias],
            deleteAction: deleteAction
        }
    }, [filter, alias, deleteAction, overrideValue]);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let mode: "copy"|"move"|"link"|"none" = "none";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (dragData.filterLink !== undefined) mode = "link";
        else if (dragData.filter !== undefined) mode = "copy";

        if (mode === "none") return void (dragData.dropEffect = "none");

        let valueFilter: PlixFilterJsonData;

        if (dragData.filter && mode !== "link") {
            valueFilter = dragData.filter;
        }

        if (valueFilter === undefined && dragData.filterLink && mode === "link") {
            valueFilter = dragData.filterLink;
        }
        if (valueFilter === undefined) return void (dragData.dropEffect = "none");
        dragData.dropEffect = mode;

        if (filter === valueFilter) return void (dragData.dropEffect = "none");
        if (mode === "move") {
            if (isObjectEqualOrContains(valueFilter, filter)) return void (dragData.dropEffect = "none");
        }
        if (mode === "link" && valueFilter[2] === alias) return void (dragData.dropEffect = "none");
        return ["_drop-replace", () => {
            let changeAction = EditValueAction(path, valueFilter);
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([changeAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        }];
    }, [onDragOverItem, path, dispatch]);


    const {filterConstructorMap} = useContext(ConstructorContext);
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
            overrideValue={overrideValue}
            setExpanded={setExpanded}
            expander={expander}
            path={path}
            title={title}
            clearAction={clearAction}
            deleteAction={deleteAction}
            dragValue={dragValue}
            onDragOverItem={onDragOverItemSelf}
        > {children} </TreeBlockFilter>
    );

    if (filter === undefined && overrideValue !== undefined) return (
        <OverrideFilterTrack
            path={path}
            alias={alias}
            expanded={expanded}
            leftBlock={leftBlock}
            overrideValue={overrideValue}
        >{children}</OverrideFilterTrack>
    );

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChangeFilter} filter={filter} />
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"filter"}/>)}

            <FilterParamsTrack filter={filter} path={path} />
        </Track>
    )
})

export interface OverrideFilterTrackProps {
    path: EditorPath
    overrideValue: PlixFilterJsonData
    expanded: boolean,
    leftBlock: ReactNode;
    alias?: string
}
const OverrideFilterTrack: FC<OverrideFilterTrackProps> = memo(({path, alias, expanded, leftBlock, overrideValue}) => {
    const {dispatch} = useContext(TrackContext);
    const override = useCallback(() => {
        dispatch(EditValueAction(path, overrideValue))
    }, [overrideValue, path, dispatch])

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <button onClick={override}>override filter</button>
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"filter"}/>)}

        </Track>
    );
});