import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {useContext, useMemo} from "react";
import {ParseMeta} from "../types/ParseMeta";
import {ConstructorContext} from "../components/editor/ConstructorContext";

export function useEffectClass(effect: PlixEffectJsonData): null|"container"|"timeline" {
    const {effectConstructorMap} = useContext(ConstructorContext);

    return useMemo<null|"container"|"timeline">(() => {
        const effectId = effect && effect[1];
        if (!effectId) return null;
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        if (meta.paramTypes[0] === "array:effect") return "container";
        if (meta.paramTypes[0] === "array:track") return "timeline";
        return null;
    }, [effect, effectConstructorMap]);
}