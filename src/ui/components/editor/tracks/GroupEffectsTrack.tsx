import React, {
    ChangeEvent,
    DragEventHandler,
    FC,
    memo,
    useCallback,
    useContext,
    useMemo,
    MouseEvent,
    useState
} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData, PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction} from "../PlixEditorReducerActions";
import {generateColorByText} from "../../../utils/generateColorByText";
import "./GroupEffectsTrack.scss";
import {DragContext} from "../DragContext";

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
            <TreeBlock type="title">
                {expander}
                <span className="track-description" onClick={changeExpanded}>===Effects===</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed>
                effect prefabs
            </TimelineBlock>
            {aliasesList.map(({value, path, name}) => (
                <AliasEffectTrack path={path} value={value} name={name} key={name} />
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
    );
});

interface AliasEffectTrackProps {
    value: PlixEffectJsonData,
    path: EditorPath,
    name: string,
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = memo(({value, path, name}) => {
    const deleteAction = useMemo(() => DeleteAction(path), [path]);

    return (
        <EffectTrack effect={value} path={path} key={name} alias={name} deleteAction={deleteAction}>
            {name}
        </EffectTrack>
    );
})

const defaultEffect = null;