import {createContext, Dispatch} from "react";
import type {EffectConstructorMap, FilterConstructorMap, PlixJsonData} from "@plix-effect/core/types/parser";
import type {PlixEditorAction} from "./PlixEditorReducer";

export interface ConstructorContextProps {
    effectConstructorMap?: EffectConstructorMap
    filterConstructorMap?: FilterConstructorMap
}
export const ConstructorContext = createContext<ConstructorContextProps|null>(null);