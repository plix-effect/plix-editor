import {Reducer} from "react";
import type {PlixJsonData} from "@plix-effect/core/dist/types/parser";
import type * as actionConstructors from "./PlixEditorReducerActions";
import type {EditorPath, HistoryPath} from "../../types/Editor";
import {generateKeyId, getArrayKeyIndex, keyMap, settleKeys} from "../../utils/KeyManager";

type ActionConstructorMap = typeof actionConstructors;
type ActionsMap = {
    [key in keyof ActionConstructorMap]: ReturnType<(ActionConstructorMap)[key]>
}

export type PlixEditorAction = ActionsMap[keyof ActionsMap];

export interface PlixEditorHistoryItem {
    apply: (track: PlixJsonData) => PlixJsonData;
    revert: (track: PlixJsonData) => PlixJsonData;
    merge: (item: PlixEditorHistoryItem) => void|PlixEditorHistoryItem;
    timestamp: number,
}
export interface PlixEditorState {
    track: PlixJsonData,
    history: PlixEditorHistoryItem[]
    historyPosition: number
}

const MERGE_HISTORY_TIMEOUT = 10000;
export const PlixEditorReducer: Reducer<PlixEditorState, PlixEditorAction> = (state, action) => {
    switch (action.type) {
        case "undo": return undoState(state);
        case "redo": return redoState(state);
        case "edit": return changeState(
            state,
            new EditHistoryItem(getWIthPath(state.track, toHistoryPath(state.track, action.path)), toHistoryPath(state.track, action.path), action.value)
        );
        case "push": return changeState(state, new PushHistoryItem(toHistoryPath(state.track, action.path), action.value));
        case "deleteIndex": return changeState(
            state,
            new DeleteIndexHistoryItem(
                getWIthPath(state.track, toHistoryPath(state.track, action.path))[action.index],
                toHistoryPath(state.track, action.path),
                action.index
            )
        );
        case "deleteValue": return changeState(
            state,
            new DeleteIndexHistoryItem(
                action.value,
                toHistoryPath(state.track, action.path),
                getWIthPath(state.track, toHistoryPath(state.track, action.path)).indexOf(action.value)
            )
        );
        case "insert": return changeState(
            state,
            new InsertIndexHistoryItem(
                action.value,
                toHistoryPath(state.track, action.path),
                action.index
            )
        );
        case "multi": {
            const newState = action.actions.reduce((s, a) => PlixEditorReducer(s, a), state);
            const initHistoryPos = state.historyPosition;
            const newHistoryPos = newState.historyPosition;
            if (newHistoryPos <= initHistoryPos+1) return newState;
            const newHistory = newState.history.slice(0, initHistoryPos);
            newHistory.push(new MultiHistoryItem(newState.history.slice(initHistoryPos)))
            return {
                ...newState,
                history: newHistory,
                historyPosition: initHistoryPos + 1
            }
        }
    }

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
    const prevHistoryItem = state.history[state.historyPosition-1];
    const now = performance.now();

    const newTrack = historyItem.apply(state.track);
    if (newTrack === state.track) return state;

    if (prevHistoryItem && prevHistoryItem.timestamp + MERGE_HISTORY_TIMEOUT > now) {
        const mergedHistoryItem = prevHistoryItem.merge(historyItem);
        if (mergedHistoryItem) {
            return {
                ...state,
                history: state.history.slice(0, state.historyPosition-1).concat(mergedHistoryItem),
                track: newTrack,
            }
        }
    }

    return {
        ...state,
        history: state.history.slice(0, state.historyPosition).concat(historyItem),
        track: newTrack,
        historyPosition: state.historyPosition + 1,
    }

}

class MultiHistoryItem implements PlixEditorHistoryItem {
    public readonly timestamp = performance.now();
    constructor(private items: PlixEditorHistoryItem[]) {}
    apply(track: PlixJsonData){
        return this.items.reduce((t, item) => item.apply(t), track);
    }
    revert(track: PlixJsonData){
        return this.items.reduceRight((t, item) => item.revert(t), track);
    }
    merge(){
        return null;
    }
}

class EditHistoryItem<T> implements PlixEditorHistoryItem {
    public readonly timestamp: number;

    constructor(
        private readonly oldValue: T,
        public readonly path: HistoryPath,
        public readonly value: T,
        timestamp?: number,
    ){
        this.timestamp = timestamp ?? performance.now();
    }
    apply(track: PlixJsonData){
        return editWIthPath(track, this.path, this.value);
    }
    revert(track: PlixJsonData){
        return editWIthPath(track, this.path, this.oldValue);
    }
    merge(item: PlixEditorHistoryItem) {
        if (item instanceof EditHistoryItem && pathIsEqual(this.path, item.path)) {
            return new EditHistoryItem(this.oldValue, item.path, item.value, this.timestamp);
        }
        return null;
    }
}

class PushHistoryItem<T> implements PlixEditorHistoryItem {
    public readonly timestamp: number;

    constructor(
        public readonly path: HistoryPath,
        public readonly value: T,
    ){
        this.timestamp = performance.now();
    }
    apply(track: PlixJsonData){
        return pushWIthPath(track, this.path, this.value);
    }
    revert(track: PlixJsonData){
        return popWIthPath(track, this.path);
    }
    merge() {
        return null;
    }
}

class DeleteIndexHistoryItem<T> implements PlixEditorHistoryItem {
    public readonly timestamp = performance.now();

    constructor(
        private readonly oldValue: T,
        public readonly path: HistoryPath,
        public readonly index: number,
    ){}

    apply(track: PlixJsonData){
        if (this.index < 0) return track;
        return deleteIndexWIthPath(track, this.path, this.index);
    }
    revert(track: PlixJsonData){
        if (this.index < 0) return track;
        return insertIndexValueWIthPath(track, this.path, this.index, this.oldValue);
    }
    merge() {
        return null;
    }
}

class InsertIndexHistoryItem<T> implements PlixEditorHistoryItem {
    public readonly timestamp = performance.now();

    constructor(
        private readonly value: T,
        public readonly path: HistoryPath,
        public readonly index: number,
    ){
        this.timestamp = performance.now();
    }
    apply(track: PlixJsonData){
        return insertIndexValueWIthPath(track, this.path, this.index, this.value);

    }
    revert(track: PlixJsonData){
        return deleteIndexWIthPath(track, this.path, this.index);
    }
    merge() {
        return null;
    }
}

function getWIthPath<T>(state: T, [pathKey, ...path]: HistoryPath){
    if (pathKey === undefined) return state;
    if (Array.isArray(state)) {
        return getWIthPath(state[Number(pathKey)], path);
    }
    if (typeof state === "object") {
        return getWIthPath(state[String(pathKey)], path);
    }
    throw new Error("can not edit history: get value")

}

function editWIthPath<T>(state: T, path: HistoryPath, value: any){
    if (path[0] === undefined) {
        if (JSON.stringify(state) === JSON.stringify(value)) return state;
        return value;
    }
    return reducePath(editWIthPath, state, path, value);
}

function pushWIthPath<T>(state: T, path: HistoryPath, value: any){
    if (state === undefined) {
        if (typeof path[0] === "string") state = {} as unknown as T;
        if (typeof path[0] === "number") state = [] as unknown as T;
    }
    if (path[0] === undefined) {
        if (state === undefined) state = [] as unknown as T;
        if (Array.isArray(state)) {
            const arrayKeys = settleKeys(state as unknown as any[]);
            const newArray = state.concat([value]);
            const newArrayKeys = arrayKeys.concat([generateKeyId()]);
            keyMap.set(newArray, newArrayKeys);
            return newArray;
        }
        return state;
    }
    return reducePath(pushWIthPath, state, path, value);
}

function insertIndexValueWIthPath<T>(state: T, path: HistoryPath, index: number, value: any){
    if (state === undefined) {
        if (typeof path[0] === "string") state = {} as unknown as T;
        if (typeof path[0] === "number") state = [] as unknown as T;
    }
    if (path.length === 0) {
        if (Array.isArray(state)) {
            const stateCopy = state.slice(0);
            const arrayKeys = settleKeys(state as unknown as any[]).slice(0);
            stateCopy.splice(index, 0, value);
            arrayKeys.splice(index, 0, generateKeyId());
            return stateCopy;
        }
        return state;
    }
    return reducePath(insertIndexValueWIthPath, state, path, index, value);
}

function deleteIndexWIthPath<T>(state: T, path: HistoryPath, index: number){
    if (state === undefined) return;
    if (path.length === 0) {
        if (Array.isArray(state)) {
            if (state.length <= index) return state;
            const stateCopy = state.slice(0);
            const arrayKeys = settleKeys(state as unknown as any[]).slice(0);
            stateCopy.splice(index, 1);
            arrayKeys.splice(index, 1);
            keyMap.set(stateCopy, arrayKeys);
            return stateCopy;
        }
        return state;
    }
    return reducePath(deleteIndexWIthPath, state, path, index);
}

function popWIthPath<T>(state: T, path: HistoryPath){
    if (path[0] === undefined) {
        if (Array.isArray(state)) {
            const arrayKeys = settleKeys(state as unknown as any[]);
            const newArray = state.slice(0, -1);
            const newArrayKeys = arrayKeys.slice(0, -1);
            keyMap.set(newArray, newArrayKeys);
            return newArray;
        }
        return state;
    }
    return reducePath(popWIthPath, state, path);
}

function reducePath<T, A extends any[]>(handler: <C>(state: C, path: HistoryPath, ...args: A) => C, state: T, [pathKey, ...path]: HistoryPath, ...args: A){
    if (Array.isArray(state)) {
        const index = Number(pathKey);
        const nextState = state[index];
        const editedNextState = handler(nextState, path, ...args);
        if (nextState === editedNextState) return state;
        const arrayKeys = keyMap.get(state as any[]);
        const dummy = Array.from({length: Math.max(state.length, index+1)})
        const result = dummy.map((_, i) => i === index ? editedNextState: state[i] ?? null);
        keyMap.set(result, arrayKeys);
        return result;
    }
    if (typeof state === "object") {
        const key = String(pathKey);
        const nextState = state[key];
        const editedNextState = handler(nextState, path, ...args);
        if (nextState === editedNextState) return state;
        if (editedNextState === undefined) {
            const {[key]: ignored, ...stateWithNoKey} = state as any;
            return stateWithNoKey;
        }
        return {...state, [key]: editedNextState};
    }
    return handler(null, path, ...args);
}

function pathIsEqual(path1: HistoryPath, path2: HistoryPath): boolean{
    if (!path1 || !path2) return false;
    if (path1.length !== path2.length) return false;
    for (let i = 0; i < path1.length; i++) {
        if (path1[i] !== path2[i]) return false;
    }
    return true;
}

function toHistoryPath(track: PlixJsonData, editorPath: EditorPath): HistoryPath{
    const historyPath: HistoryPath = [];
    let data: any = track;
    for (const editorPathElement of editorPath) {
        if (typeof editorPathElement === "object") {
            const keyIndex = getArrayKeyIndex(data, editorPathElement.key);
            if (keyIndex === null) throw new Error("can not change history path");
            historyPath.push(keyIndex);
            data = data[keyIndex];
        } else {
            historyPath.push(editorPathElement);
            data = data[editorPathElement];
        }
    }
    return historyPath;
}