import type {EditorPath} from "../../types/Editor";

export const EditValueAction = (path: EditorPath, value: any) => {
    return {
        type: "edit",
        path,
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

