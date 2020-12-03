import {createContext, Dispatch} from "react";
import type {PlixJsonData} from "@plix-effect/core/types/parser";
import type {PlixEditorAction} from "./PlixEditorReducer";

export interface TrackContextProps {
    track: PlixJsonData
    dispatch: Dispatch<PlixEditorAction>
    undoCounts?: number
    redoCounts?: number
}
export const TrackContext = createContext<TrackContextProps|null>(null);