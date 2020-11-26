import React, {FC, memo, useCallback, useContext, MouseEvent, DragEvent} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import {EditValueAction} from "../../PlixEditorReducerActions";
import {DragContext} from "../../DragContext";
import cn from "classnames";

export interface DisplayEffectProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
}
export const DisplayEffect: FC<DisplayEffectProps> = memo(({effect, path}) => {
    const {effectConstructorMap, dispatch} = useContext(TrackContext);
    const onClick = useCallback((event: MouseEvent<Element>) => {
        if (!effect) return;
        if (event.ctrlKey) dispatch(EditValueAction([...path, 0], !effect[0]))
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
                title={getEffectTitle(enabled)}
            >
                {params}
            </span>
        );
    }
})

function getEffectTitle(enabled) {
    return '' +
        `[Ctrl + click] = ${enabled ? 'disable':'enable'}\n` +
        `[Drag] = move and copy effect`
    ;
}