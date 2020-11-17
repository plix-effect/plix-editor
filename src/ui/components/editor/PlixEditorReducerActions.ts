import type {EditorPath} from "../../types/Editor";
import type {PlixEditorAction} from "./PlixEditorReducer";

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

export const DeleteIndexAction = (path: EditorPath, index: number) => {
    return {
        type: "deleteIndex",
        path,
        index
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

