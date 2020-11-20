import {createContext, MutableRefObject} from "react";
import {PlixEffectJsonData, PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";

export interface DragTypes {
    effect: PlixEffectJsonData,
    filter: PlixFilterJsonData,
    record: PlixTimeEffectRecordJsonData,
    recordScale: {
        record: PlixTimeEffectRecordJsonData,
        side: "left"|"right"
    },
}

export type DragType = Partial<DragTypes> & {offsetX: number, offsetY: number}

export const DragContext = createContext<MutableRefObject<DragType>|null>(null);