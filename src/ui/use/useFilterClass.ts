import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {useContext, useMemo} from "react";
import {ParseMeta} from "../types/ParseMeta";
import {ConstructorContext} from "../components/editor/ConstructorContext";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";

export function useFilterClass(filter: PlixFilterJsonData): null|"container" {
    const {filterConstructorMap} = useContext(ConstructorContext);

    return useMemo<null|"container">(() => {
        const effectId = filter && filter[1];
        if (!effectId) return null;
        const filterConstructor = filterConstructorMap[effectId];
        const meta: ParseMeta = filterConstructor['meta'];
        if (meta.paramTypes[0] === "array:effect") return "container";
        return null;
    }, [filter, filterConstructorMap]);
}