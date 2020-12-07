import React, {FC, memo, useCallback, useContext, MouseEvent, DragEvent, useMemo} from "react";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {ParseMeta} from "../../../../types/ParseMeta";
import cn from "classnames";
import {ConstructorContext} from "../../ConstructorContext";
import {useEffectClass} from "../../../../use/useEffectClass";

export interface DisplayEffectProps {
    effect: PlixEffectJsonData,
    override?: boolean,
}
export const DisplayEffect: FC<DisplayEffectProps> = memo(({effect, override = false}) => {
    const {effectConstructorMap} = useContext(ConstructorContext);
    const effectClass = useEffectClass(effect);

    if (!effect) {
        return (
            <span className="track-description _empty">
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                empty
            </span>
        )
    }
    const [enabled, id, params = [], filters = []] = effect;
    if (id) {
        const effectConstructor = effectConstructorMap[id];
        const meta: ParseMeta = effectConstructor['meta'];
        return (
            <span className={cn("track-description _type", {"_disabled": !enabled})}>
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                {meta.name}
                {effectClass === "container" && <> ({params[0]?.length})</>}
                {effectClass === "timeline" && <> ({params[0]?.length})</>}
                {filters && filters.length > 0 && <> +{filters.length} filters</>}
            </span>
        );
    } else {
        return (
            <span className={cn("track-description _link", {"_disabled": !enabled})}>
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                <i className="fa fa-link"/> {params}
                {filters && filters.length > 0 && (
                    <span className="track-description _type">
                    {filters && filters.length > 0 && <> +{filters.length} filters</>}
                </span>
                )}
            </span>
        );
    }
});