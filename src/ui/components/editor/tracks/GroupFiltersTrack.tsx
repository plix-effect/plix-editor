import React, {ChangeEvent, FC, memo, MouseEvent, useCallback, useContext, useMemo, useState} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectJsonData, PlixFiltersMapJsonData} from "@plix-effect/core/types/parser";
import {FilterTrack} from "./FilterTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction} from "../PlixEditorReducerActions";
import {EffectTrack} from "./EffectTrack";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";

export interface GroupFiltersTrackProps {
    filtersMap: PlixFiltersMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupFiltersTrack: FC<GroupFiltersTrackProps> = memo(({filtersMap, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(true);
    const {dispatch} = useContext(TrackContext);
    const aliasesList = useMemo(() => {
        return Object.keys(filtersMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: filtersMap[name],
            }
        })
    }, [filtersMap, dispatch]);

    const [name, setName] = useState("");
    const onEditName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);


    const add = useCallback(() => {
        if (!name) return;
        if (name in filtersMap) return;
        dispatch(EditValueAction([...path, name], defaultFilter));
        setName('');
    }, [name, filtersMap, path, dispatch]);
    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Filters===</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed>
                filter prefabs
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