import {createContext} from "react";
import type {EffectConstructorMap, FilterConstructorMap, PlixJsonData} from "@plix-effect/core/types/parser";
import type {PlixEditorAction} from "./PlixEditorReducer";

export interface TrackContextProps {
    track: PlixJsonData
    dispatch: (action: PlixEditorAction) => void
    effectConstructorMap?: EffectConstructorMap
    filterConstructorMap?: FilterConstructorMap
    undoCounts?: number
    redoCounts?: number
}
export const TrackContext = createContext<TrackContextProps|null>(null);