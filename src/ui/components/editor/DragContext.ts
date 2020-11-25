import {createContext, MutableRefObject} from "react";
import {PlixEffectJsonData, PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {MultiActionType} from "./PlixEditorReducerActions";

export interface DragTypes {
    effect: PlixEffectJsonData,
    effectAlias: string,
    filter: PlixFilterJsonData,
    recordScale: {
        record: PlixTimeEffectRecordJsonData,
        side: "left"|"right"
    },
    typedValue: { type: string, value: any }
    record: PlixTimeEffectRecordJsonData,
    deleteAction: MultiActionType,
    dropEffect: null | "none" | "copy" | "link" | "move",
    offsetX: number,
    offsetY: number
}

export type DragType = Partial<DragTypes>

export const DragContext = createContext<MutableRefObject<DragType>>({current: {}});