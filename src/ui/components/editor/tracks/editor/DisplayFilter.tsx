import React, {FC, memo, useContext} from "react";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import cn from "classnames";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";
import {ConstructorContext} from "../../ConstructorContext";

export interface DisplayFilterProps {
    filter: PlixFilterJsonData,
    override?: boolean,
}
export const DisplayFilter: FC<DisplayFilterProps> = memo(({filter, override = false}) => {
    const {filterConstructorMap} = useContext(ConstructorContext);

    if (!filter) {
        return (
            <span className="track-description _empty">
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                empty
            </span>
        )
    }
    const [enabled, id, params] = filter;
    if (id) {
        const filterConstructor = filterConstructorMap[id];
        const meta: ParseMeta = filterConstructor['meta'];
        return (
            <span className={cn("track-description _type", {"_disabled": !enabled})}>
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                {meta.name}
                {id === "FChain" && <> ({params[0]?.length})</>}
                {id === "BlendFilters" && <> ({params[0]?.length})</>}
            </span>
        );
    } else {
        return (
            <span className={cn("track-description _link", {"_disabled": !enabled})}>
                {override && <span className="track-description _empty"><i className="fas fa-at"/> </span>}
                <i className="fa fa-link"/> {params}
            </span>
        );
    }
})