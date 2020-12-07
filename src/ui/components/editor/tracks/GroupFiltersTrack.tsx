import React, {
    ChangeEvent, DragEvent, DragEventHandler,
    FC, FormEventHandler, KeyboardEvent,
    memo,
    MouseEventHandler,
    useCallback,
    useContext, useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {Track} from "../../timeline/Track";
import {PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {FilterTrack} from "./FilterTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction} from "../PlixEditorReducerActions";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {DisplayFilter} from "./editor/DisplayFilter";
import {DragType} from "../DragContext";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";

export interface GroupFiltersTrackProps {
    filtersMap: PlixFiltersMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupFiltersTrack: FC<GroupFiltersTrackProps> = memo(({filtersMap, path, baseExpanded}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const [filter, setFilter] = useState<PlixFilterJsonData|undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>();

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const aliasesList = useMemo(() => {
        return Object.keys(filtersMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: filtersMap[name],
            }
        })
    }, [filtersMap, dispatch]);

    const count = useMemo(() => Object.keys(filtersMap || {}).length, [filtersMap])

    const [name, setName] = useState("");
    const onEditName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);


    const add = useCallback(() => {
        if (!name) return;
        if (name in filtersMap) return;
        dispatch(EditValueAction([...path, name], filter));
        setName('');
        setExpanded(true);
    }, [name, filtersMap, path, dispatch]);

    const setEmptyFilter = useCallback(() => {
        setFilter(defaultFilter)
    }, [setFilter])

    const clearFilter = useCallback(() => {
        setFilter(undefined)
    }, [setFilter])

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) clearFilter()
        if (!ctrlKey && !altKey && shiftKey) {
            if (filter === undefined) setEmptyFilter();
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [dispatch]);

    const onDblClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
        event.preventDefault();
    }, [changeExpanded]);

    const onClickTimeline: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearFilter()
    }, [dispatch]);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        add();
    }, [add]);

    const onKeyDown = useCallback((event: KeyboardEvent<HTMLFormElement>) => {
        if (event.nativeEvent.code === "Escape") clearFilter();
    }, []);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        if (!dragData) return;
        let mode: "copy"|"move"|"link"|"none" = "none";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (dragData.filterLink !== undefined) mode = "link";
        else if (dragData.filter !== undefined) mode = "copy";

        if (mode === "none" || mode === "move") return void (dragData.dropEffect = "none");

        let valueFilter: PlixFilterJsonData;

        if (dragData.filter !== undefined && mode !== "link") {
            valueFilter = dragData.filter;
        }

        if (valueFilter === undefined && dragData.filterLink && mode === "link") {
            valueFilter = dragData.filterLink;
        }
        if (valueFilter === undefined) return void (dragData.dropEffect = "none");
        dragData.dropEffect = mode;

        return ["_drop-add-item", () => {
            setFilter(valueFilter);
        }]
    }, [path, dispatch]);


    useEffect(() => {
        if (filter) inputRef.current.focus();
    }, [filter]);

    const onClickAdd: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        setEmptyFilter();
    }, [setEmptyFilter]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        clearFilter();
    }, [clearFilter]);

    const rightIcons = (<>
        {filter === undefined && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add filter"/>
        )}
        {(filter !== undefined) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title" onClick={onClickTree} onDoubleClick={onDblClickTree} selected={selected} onDragOverItem={onDragOverItemSelf} right={rightIcons}>
                {expander}
                <span className="track-description">Filters ({count})</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed onClick={onClickTimeline}>
                {filter === undefined && (<>
                    <span className="track-description _desc">Filter prefabs</span>
                    &nbsp;
                    <a onClick={setEmptyFilter}>[add]</a>
                </>)}
                {filter !== undefined && (<>
                    <DisplayFilter filter={filter}/>
                    &nbsp;
                    <form style={{margin:0}} onSubmit={onSubmit} onReset={clearFilter} onKeyDown={onKeyDown}>
                        <input autoFocus ref={inputRef} type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                        <button type="submit" onClick={add} disabled={!name || name in filtersMap}>add</button>
                        <button type="reset">cancel</button>
                    </form>
                </>)}

            </TimelineBlock>
            {aliasesList.map(alias => (
                <AliasFilterTrack name={alias.name} path={alias.path} key={alias.name} value={alias.value}/>
            ))}
        </Track>
    )
});

const defaultFilter = null;

interface AliasFilterTrackProps {
    value: PlixFilterJsonData,
    path: EditorPath,
    name: string,
}
const AliasFilterTrack: FC<AliasFilterTrackProps> = memo(({value, path, name}) => {
    const deleteAction = useMemo(() => DeleteAction(path), [path]);

    return (
        <FilterTrack filter={value} path={path} key={name} alias={name} deleteAction={deleteAction}>
            {name}
        </FilterTrack>
    );
})