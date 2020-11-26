import React, {FC, memo, useContext} from "react";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {EditorPath} from "../../../../types/Editor";
import cn from "classnames";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";

export interface DisplayFilterProps {
    filter: PlixFilterJsonData,
}
export const DisplayFilter: FC<DisplayFilterProps> = memo(({filter}) => {
    const {filterConstructorMap} = useContext(TrackContext);

    if (!filter) {
        return <span className="track-description _empty">empty</span>
    }
    const [enabled, id, params] = filter;
    if (id) {
        const filterConstructor = filterConstructorMap[id];
        const meta: ParseMeta = filterConstructor['meta'];
        return (
            <span className={cn("track-description _type", {"_disabled": !enabled})}>
                {meta.name}
                {id === "FChain" && <> ({params[0]?.length})</>}
                {id === "BlendFilters" && <> ({params[0]?.length})</>}
            </span>
        );
    } else {
        return (
            <span className={cn("track-description _link", {"_disabled": !enabled})}>
                {params}
            </span>
        );
    }
})