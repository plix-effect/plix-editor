import React, {ChangeEvent, FC, memo, useCallback, useContext, useMemo, useRef, useState} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {EditValueAction} from "../PlixEditorReducerActions";

export interface GroupEffectsTrackProps {
    effectsMap: PlixEffectsMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupEffectsTrack: FC<GroupEffectsTrackProps> = memo(({effectsMap, path}) => {
    const [expanded, expander, changeExpanded] = useExpander(true);
    const {dispatch} = useContext(TrackContext);

    const aliasesList = useMemo(() => {
        return Object.keys(effectsMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: effectsMap[name],
                remove: () => dispatch(EditValueAction([...path, name], undefined)),
            }
        })
    }, [effectsMap]);

    const [name, setName] = useState("");
    const onEditName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);


    const add = useCallback(() => {
        if (!name) return;
        if (name in effectsMap) return;
        dispatch(EditValueAction([...path, name], defaultEffect));
        setName('');
    }, [name, effectsMap, path, dispatch]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="description">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Effects===</span>
            </TreeBlock>
            <TimelineBlock type="description" fixed>
                effect prefabs
            </TimelineBlock>
            {aliasesList.map(alias => (
                <EffectTrack effect={alias.value} path={alias.path} key={alias.name}>
                    <button className="btn _remove" onClick={alias.remove}>X</button> {alias.name}
                </EffectTrack>
            ))}
            <Track>
                <TreeBlock type="description">
                </TreeBlock>
                <TimelineBlock fixed type="description">
                    Add new effect prefab:
                    <input type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                    <button onClick={add} disabled={!name || name in effectsMap}>add</button>
                </TimelineBlock>
            </Track>
        </Track>
    )
});

const defaultEffect = null;