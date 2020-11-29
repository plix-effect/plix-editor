import React, {FC, memo, useCallback, useContext, MouseEvent, DragEvent, useMemo} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import {EditValueAction} from "../../PlixEditorReducerActions";
import {DragContext} from "../../DragContext";
import cn from "classnames";
import {ConstructorContext} from "../../ConstructorContext";
import {useEffectClass} from "../../../../use/useEffectClass";

export interface DisplayEffectProps {
    effect: PlixEffectJsonData,
}
export const DisplayEffect: FC<DisplayEffectProps> = memo(({effect}) => {
    const {effectConstructorMap} = useContext(ConstructorContext);
    const effectClass = useEffectClass(effect);

    if (!effect) {
        return <span className="track-description _empty">empty</span>
    }
    const [enabled, id, params = [], filters = []] = effect;
    if (id) {
        const effectConstructor = effectConstructorMap[id];
        const meta: ParseMeta = effectConstructor['meta'];
        return (
            <span className={cn("track-description _type", {"_disabled": !enabled})}>
                {meta.name}
                {effectClass === "container" && <> ({params[0]?.length})</>}
                {effectClass === "timeline" && <> ({params[0]?.length})</>}
                {filters && filters.length > 0 && <> +{filters.length} filters</>}
            </span>
        );
    } else {
        return (
            <span className={cn("track-description _link", {"_disabled": !enabled})}>
                {params}
            </span>
        );
    }
});