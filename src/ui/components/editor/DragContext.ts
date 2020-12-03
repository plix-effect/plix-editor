import {createContext, MutableRefObject} from "react";
import {PlixEffectJsonData, PlixEffectAliasJsonData, PlixFilterJsonData, PlixFilterAliasJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {MultiActionType} from "./PlixEditorReducerActions";

export interface DragTypes {
    effect: PlixEffectJsonData,
    effectLink: PlixEffectAliasJsonData,
    filter: PlixFilterJsonData,
    filterLink: PlixFilterAliasJsonData,
    recordScale: {
        record: PlixTimeEffectRecordJsonData,
        side: "left"|"right"
    },
    typedValue: { type: string, value: any }
    recordMove: {
        record: PlixTimeEffectRecordJsonData,
        bpm: number,
        offset: number
    },
    deleteAction: MultiActionType,
    dropEffect: null | "none" | "copy" | "link" | "move",
    offsetX: number,
    offsetY: number
}

export type DragType = Partial<DragTypes>

export const DragContext = createContext<MutableRefObject<DragType>>({current: {}});