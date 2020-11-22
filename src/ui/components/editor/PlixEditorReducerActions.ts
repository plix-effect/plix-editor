import type {EditorPath} from "../../types/Editor";

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
        value
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

export type MultiActionType = (
    | ReturnType<typeof EditValueAction>
    | ReturnType<typeof PushValueAction>
    | ReturnType<typeof InsertIndexAction>
    | ReturnType<typeof DeleteAction>
    | ReturnType<typeof DeleteIndexAction>
    | ReturnType<typeof DeleteValueAction>
);
export const MultiAction = (actions: MultiActionType[]) => {
    return {
        type: "multi",
        actions
    } as const;
}

