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
import {EditValueAction} from "../PlixEditorReducerActions";
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
            {aliasesList.map(({value, path, remove, name}) => (
                <AliasEffectTrack path={path} value={value} name={name} remove={remove} key={name} />
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

interface AliasEffectTrackProps {
    value: PlixEffectJsonData,
    path: EditorPath,
    remove: () => void,
    name: string,
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = memo(({value, remove, path, name}) => {
    const dragRef = useContext(DragContext);

    const onDragStartEffect: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            effect: value,
            effectAlias: name,
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        event.dataTransfer.effectAllowed = 'all';
    }, []);

    const onClick = useCallback((event: MouseEvent<HTMLElement>) => {
        if (event.altKey) return remove();
    }, [remove]);

    return (
        <EffectTrack effect={value} path={path} key={name}>
            <span
                onClick={onClick}
                className="effect-group-alias"
                style={{backgroundColor: generateColorByText(name, 1, 0.3)}}
                draggable
                onDragStart={onDragStartEffect}
            >
                {name}
            </span>
        </EffectTrack>
    )
})

const defaultEffect = null;