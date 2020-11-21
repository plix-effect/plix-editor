import React, {FC, memo, useCallback, useContext, MouseEvent, DragEvent} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import {EditValueAction} from "../../PlixEditorReducerActions";
import {DragContext} from "../../DragContext";
import cn from "classnames";

export interface DraggableEffectProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
}
export const DraggableEffect: FC<DraggableEffectProps> = memo(({effect, path}) => {
    const {effectConstructorMap, dispatch} = useContext(TrackContext);
    const dragRef = useContext(DragContext);
    const onClick = useCallback((event: MouseEvent<Element>) => {
        if (!effect) return;
        if (event.ctrlKey) dispatch(EditValueAction([...path, 0], !effect[0]))
    }, [effect, path]);

    const onDragStart = useCallback((event: DragEvent<Element>) => {
        if (!effect) return;
        dragRef.current = {
            effect,
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
    }, [effect, path]);

    if (!effect) {
        return <span className="track-description _empty">empty</span>
    }
    const [enabled, id, params] = effect;
    if (id) {
        const effectConstructor = effectConstructorMap[id];
        const meta: ParseMeta = effectConstructor['meta'];
        return (
            <span
                className={cn("track-description _type", {"_disabled": !enabled})}
                onClick={onClick}
                onDragStart={onDragStart}
                draggable
                title={getEffectTitle(enabled)}
            >
                {meta.name}
            </span>
        );
    } else {
        return (
            <span
                className={cn("track-description _link", {"_disabled": !enabled})}
                onClick={onClick}
                onDragStart={onDragStart}
                draggable
                title={getEffectTitle(enabled)}
            >
                {params}
            </span>
        );
    }
    return null;
})

function getEffectTitle(enabled) {
    return '' +
        `[Ctrl + click] = ${enabled ? 'disable':'enable'}\n` +
        `[Drag] = move and copy effect`
    ;
}