import React, {
    ChangeEvent, DragEvent, DragEventHandler,
    FC, FormEventHandler,
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

export interface GroupFiltersTrackProps {
    filtersMap: PlixFiltersMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupFiltersTrack: FC<GroupFiltersTrackProps> = memo(({filtersMap, path}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(true);
    const {dispatch} = useContext(TrackContext);

    const [filter, setFilter] = useState<PlixFilterJsonData|undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>()

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

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearFilter()
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
    }, [dispatch]);

    const onClickTimeline: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearFilter()
    }, [dispatch]);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        add();
    }, [add]);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | DragEventHandler => {
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

        return () => {
            setFilter(valueFilter);
        }
    }, [path, dispatch]);


    useEffect(() => {
        if (filter) inputRef.current.focus();
    }, [filter]);


    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title" onClick={onClickTree} onDragOverItem={onDragOverItemSelf}>
                {expander}
                <span className="track-description" onClick={changeExpanded}>Filters ({count})</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed onClick={onClickTimeline}>
                {filter === undefined && (
                    <a onClick={setEmptyFilter}>[add]</a>
                )}
                {filter !== undefined && (<>
                    <DisplayFilter filter={filter}/>
                    &nbsp;
                    <form style={{margin:0}} onSubmit={onSubmit}>
                        <input ref={inputRef} type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                        <button type="submit" onClick={add} disabled={!name || name in filtersMap}>add</button>
                        <button type="button" onClick={clearFilter}>cancel</button>
                    </form>
                </>)}

            </TimelineBlock>
            {aliasesList.map(alias => (
                <AliasFilterTrack name={alias.name} path={alias.path} key={alias.name} value={alias.value}/>
            ))}
            <Track>
                <TreeBlock type="description">
                </TreeBlock>
                <TimelineBlock fixed type="description">
                    Add new filter prefab:
                    <input type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                    <button onClick={add} disabled={!name || name in filtersMap}>add</button>
                </TimelineBlock>
            </Track>
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