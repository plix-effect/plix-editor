import React, {FC, memo, useCallback, useContext, MouseEvent, DragEvent} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import {EditValueAction} from "../../PlixEditorReducerActions";
import {DragContext} from "../../DragContext";
import cn from "classnames";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";

export interface DisplayFilterProps {
    filter: PlixFilterJsonData,
    path: EditorPath,
}
export const DisplayFilter: FC<DisplayFilterProps> = memo(({filter, path}) => {
    const {filterConstructorMap, dispatch} = useContext(TrackContext);
    const onClick = useCallback((event: MouseEvent<Element>) => {
        if (!filter) return;
        if (event.ctrlKey) dispatch(EditValueAction([...path, 0], !filter[0]))
    }, [filter, path]);

    if (!filter) {
        return <span className="track-description _empty">empty</span>
    }
    const [enabled, id, params] = filter;
    if (id) {
        const filterConstructor = filterConstructorMap[id];
        const meta: ParseMeta = filterConstructor['meta'];
        return (
            <span
                className={cn("track-description _type", {"_disabled": !enabled})}
                onClick={onClick}
            >
                {meta.name}
            </span>
        );
    } else {
        return (
            <span
                className={cn("track-description _link", {"_disabled": !enabled})}
                onClick={onClick}
                draggable
            >
                {params}
            </span>
        );
    }
})