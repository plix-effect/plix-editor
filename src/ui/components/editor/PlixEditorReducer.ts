import {Reducer} from "react";
import type {PlixJsonData} from "@plix-effect/core/dist/types/parser";
import type * as actionConstructors from "./PlixEditorReducerActions";
import type {EditorPath} from "../../types/Editor";
import {getArrayKeyIndex, keyMap} from "../../utils/KeyManager";

type ActionConstructorMap = typeof actionConstructors;
type ActionsMap = {
    [key in keyof ActionConstructorMap]: ReturnType<(ActionConstructorMap)[key]>
}

export type PlixEditorAction = ActionsMap[keyof ActionsMap];

export interface PlixEditorHistoryItem {
    apply: (track: PlixJsonData) => PlixJsonData;
    revert: (track: PlixJsonData) => PlixJsonData;
}
export interface PlixEditorState {
    track: PlixJsonData,
    history: PlixEditorHistoryItem[]
    historyPosition: number
}
export const PlixEditorReducer: Reducer<PlixEditorState, PlixEditorAction> = (state, action) => {
    switch (action.type) {
        case "undo": return undoState(state);
        case "redo": return redoState(state);
        case "edit": return changeState(state, new EditHistoryItem(state.track, action.path, action.value));
    }
    return state;
}

function undoState(state: PlixEditorState): PlixEditorState {
    if (state.historyPosition <= 0) return state;
    const historyItem = state.history[state.historyPosition - 1];
    return {
        ...state,
        track: historyItem.revert(state.track),
        historyPosition: state.historyPosition - 1,
    }
}

function redoState(state: PlixEditorState): PlixEditorState {
    const historyItem = state.history[state.historyPosition];
    if (!historyItem) return state;
    return {
        ...state,
        track: historyItem.apply(state.track),
        historyPosition: state.historyPosition + 1,
    }
}

function changeState(state: PlixEditorState, historyItem: PlixEditorHistoryItem): PlixEditorState {
    const pos = state.historyPosition;
    const items = state.history.slice(0, pos).concat(historyItem);
    return {
        ...state,
        history: items,
        track: historyItem.apply(state.track),
        historyPosition: pos + 1,
    }
}
class EditHistoryItem implements PlixEditorHistoryItem {
    oldValue: any;

    constructor(track: PlixJsonData, private path: EditorPath, private value: any){
        this.oldValue = getWIthPath(track, path);
    }
    apply(track: PlixJsonData){
        console.log("CHANGE TRACK", track, this.path, this.value);
        const result = editWIthPath(track, this.path, this.value);
        console.log("RESULT", result);
        return result;
    }
    revert(track: PlixJsonData){
        return editWIthPath(track, this.path, this.oldValue);
    }
}

function getWIthPath<T>(state: T, [pathKey, ...path]: EditorPath){
    if (!pathKey) return state;
    if (Array.isArray(state)) {
        let index: number;
        if (typeof pathKey === "number" || typeof pathKey === "string") {
            index = Number(pathKey);
        } else {
            const keyIndex = getArrayKeyIndex(state, pathKey.key);
            if (keyIndex === null) throw new Error("can not edit history: get array state");
            index = keyIndex;
        }
        return getWIthPath(state[index], path);
    }
    if (typeof state === "object") {
        return getWIthPath(state[String(pathKey)], path);
    }
    throw new Error("can not edit history: get value")

}

function editWIthPath<T>(state: T, [pathKey, ...path]: EditorPath, value: any){
    if (pathKey === undefined) {
        if (JSON.stringify(state) === JSON.stringify(value)) return state;
        return value;
    }
    if (Array.isArray(state)) {
        let index: number;
        if (typeof pathKey === "number" || typeof pathKey === "string"){
            index = Number(pathKey);
        } else {
            const keyIndex = getArrayKeyIndex(state, pathKey.key);
            if (keyIndex === null) throw new Error("can not edit history");
            index = keyIndex;
        }
        const nextState = state[index];
        const editedNextState = editWIthPath(nextState, path, value);
        if (nextState === editedNextState) return state;
        const arrayKeys = keyMap.get(state);
        const result = state.map((value, i) => i === index ? editedNextState: value);
        keyMap.set(result, arrayKeys);
        return result;
    }
    if (typeof state === "object") {
        const key = String(pathKey);
        const nextState = state[key];
        const editedNextState = editWIthPath(nextState, path, value);
        if (nextState === editedNextState) return state;
        return {...state, [key]: editedNextState};
    }
    return state;
}

