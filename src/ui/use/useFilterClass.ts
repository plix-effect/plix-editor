import {useContext, useMemo} from "react";
import {ParseMeta} from "../types/ParseMeta";
import {ConstructorContext} from "../components/editor/ConstructorContext";
import {PlixFilterJsonData} from "@plix-effect/core/types/parser";

export function useFilterClass(filter: PlixFilterJsonData): null|"container" {
    const {filterConstructorMap} = useContext(ConstructorContext);

    return useMemo<null|"container">(() => {
        const filterId = filter && filter[1];
        if (!filterId) return null;
        const filterConstructor = filterConstructorMap[filterId];
        const meta: ParseMeta = filterConstructor['meta'];
        if (meta.paramTypes[0] === "array:filter") return "container";
        return null;
    }, [filter, filterConstructorMap]);
}