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
    recordMove: {
        record: PlixTimeEffectRecordJsonData,
        deleteAction: MultiActionType
    },
}

export type DragType = Partial<DragTypes> & {offsetX: number, offsetY: number}

export const DragContext = createContext<MutableRefObject<DragType>|null>(null);