import {createContext, Dispatch, SetStateAction} from "react";
import type {EffectConstructorMap, FilterConstructorMap, PlixJsonData} from "@plix-effect/core/types/parser";
import type {PlixEditorAction} from "./PlixEditorReducer";

export interface ScaleDisplayContextProps {
    duration: number
    setDuration: Dispatch<SetStateAction<number>>
    zoom: number
    setZoom: Dispatch<SetStateAction<number>>
    position: number
    setPosition: Dispatch<SetStateAction<number>>
    trackWidth: number
}
export const ScaleDisplayContext = createContext<ScaleDisplayContextProps|null>(null);