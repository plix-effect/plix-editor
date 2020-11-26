import React, {
    ChangeEvent,
    DragEventHandler,
    FC,
    memo,
    useCallback,
    useContext,
    useMemo,
    MouseEvent,
    useState, MouseEventHandler, FormEventHandler, DragEvent, useRef, useEffect
} from "react";
import {Track} from "../../timeline/Track";
import { PlixEffectsMapJsonData, PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction, MultiAction} from "../PlixEditorReducerActions";
import {generateColorByText} from "../../../utils/generateColorByText";
import "./GroupEffectsTrack.scss";
import {DragContext, DragType} from "../DragContext";
import {DisplayEffect} from "./editor/DisplayEffect";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface GroupEffectsTrackProps {
    effectsMap: PlixEffectsMapJsonData,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupEffectsTrack: FC<GroupEffectsTrackProps> = memo(({effectsMap, path}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(true);
    const {dispatch} = useContext(TrackContext);

    const [effect, setEffect] = useState<PlixEffectJsonData|undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>()

    const aliasesList = useMemo(() => {
        return Object.keys(effectsMap).sort(/*a-z*/).map((name, index) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: effectsMap[name],
            }
        })
    }, [effectsMap]);

    const count = useMemo(() => Object.keys(effectsMap || {}).length, [effectsMap])

    const [name, setName] = useState("");
    const onEditName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);

    const add = useCallback(() => {
        if (!name) return;
        if (name in effectsMap) return;
        dispatch(EditValueAction([...path, name], effect));
        setName('');
        setExpanded(true);
    }, [name, effectsMap, path, dispatch]);


    const setEmptyEffect = useCallback(() => {
        setEffect(defaultEffect)
    }, [setEffect])

    const clearEffect = useCallback(() => {
        setEffect(undefined)
    }, [setEffect])

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearEffect()
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
    }, [dispatch]);

    const onClickTimeline: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearEffect()
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
        else if (dragData.effectLink !== undefined) mode = "link";
        else if (dragData.effect !== undefined) mode = "copy";

        if (mode === "none" || mode === "move") return void (dragData.dropEffect = "none");

        let valueEffect: PlixEffectJsonData;

        if (dragData.effect !== undefined && mode !== "link") {
            valueEffect = dragData.effect;
        }

        if (valueEffect === undefined && dragData.effectLink && mode === "link") {
            valueEffect = dragData.effectLink;
        }
        if (valueEffect === undefined) return void (dragData.dropEffect = "none");
        dragData.dropEffect = mode;

        return () => {
            setEffect(valueEffect);
        }
    }, [path, dispatch]);


    useEffect(() => {
        if (effect) inputRef.current.focus();
    }, [effect]);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title" onClick={onClickTree} onDragOverItem={onDragOverItemSelf}>
                {expander}
                <span className="track-description" onClick={changeExpanded}>Effects ({count})</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed onClick={onClickTimeline}>
                {effect === undefined && (
                    <a onClick={setEmptyEffect}>[add]</a>
                )}
                {effect !== undefined && (<>
                    <DisplayEffect effect={effect}/>
                    &nbsp;
                    <form style={{margin:0}} onSubmit={onSubmit}>
                        <input ref={inputRef} type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                        <button type="submit" onClick={add} disabled={!name || name in effectsMap}>add</button>
                        <button type="button" onClick={clearEffect}>cancel</button>
                    </form>
                </>)}

            </TimelineBlock>
            {aliasesList.map(({value, path, name}) => (
                <AliasEffectTrack path={path} value={value} name={name} key={name} />
            ))}
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