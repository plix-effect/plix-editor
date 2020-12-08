import type {EditorPath} from "../../types/Editor";
import {EffectConstructorMap, FilterConstructorMap, PlixJsonData} from "@plix-effect/core/dist/types/parser";

export const EditValueAction = (path: EditorPath, value: any) => {
    return {
        type: "edit",
        path,
        value
    } as const;
}

export const PushValueAction = (path: EditorPath, value: any) => {
    return {
        type: "push",
        path,
        value
    } as const;
}

export const InsertValuesAction = (path: EditorPath, index: number, values: any[]) => {
    return {
        type: "insert",
        path,
        index,
        values
    } as const;
}

export const DeleteAction = (path: EditorPath) => {
    return {
        type: "delete",
        path
    } as const;
}

export const DeleteIndexAction = (path: EditorPath, index: number) => {
    return {
        type: "deleteIndex",
        path,
        index
    } as const;
}

export const DeleteValueAction = (path: EditorPath, value: any) => {
    return {
        type: "deleteValue",
        path,
        value
    } as const;
}

export const InsertIndexAction = (path: EditorPath, index: number, value: any) => {
    return {
        type: "insert",
        path,
        index,
        values: [value]
    } as const;
}

export const RenameAliasAction = (aliasType: "effect"|"filter", from: string, to: string, effectConstructorMap: EffectConstructorMap, filterConstructorMap: FilterConstructorMap,) => {
    return {
        type: "rename",
        aliasType,
        from,
        to,
        effectConstructorMap,
        filterConstructorMap,
    } as const;
}

export const UndoAction = () => {
    return {
        type: "undo"
    } as const;
}

export const RedoAction = () => {
    return {
        type: "redo"
    } as const;
}

export const OpenAction = (track: PlixJsonData) => {
    return {
        type: "open",
        track
    } as const;
}

export type MultiActionSupport = (
    | ReturnType<typeof EditValueAction>
    | ReturnType<typeof PushValueAction>
    | ReturnType<typeof InsertValuesAction>
    | ReturnType<typeof InsertIndexAction>
    | ReturnType<typeof DeleteAction>
    | ReturnType<typeof DeleteIndexAction>
    | ReturnType<typeof DeleteValueAction>
);
export type MultiActionType = MultiActionSupport|MultiAction;

interface MultiAction {type: "multi", actions: readonly MultiActionType[] }
export const MultiAction = (actions: MultiActionType[]): MultiAction => {
    return {
        type: "multi",
        actions
    } as const;
}

