import React, {createContext, Dispatch, FC, memo, useContext, useEffect, useMemo, useRef, useState} from "react";
import useLatestCallback from "../../use/useLatestCallback";
import {EditorPath} from "../../types/Editor";
import type {PlixJsonData} from "@plix-effect/core/types/parser";
import {EffectConstructorMap, FilterConstructorMap} from "@plix-effect/core/dist/types/parser";
import {ConstructorContext} from "./ConstructorContext";
import {getArrayKeyIndex} from "../../utils/KeyManager";
import {ParseMeta} from "../../types/ParseMeta";
import {PlixEditorAction} from "./PlixEditorReducer";
import {EditValueAction, InsertValuesAction, PushValueAction} from "./PlixEditorReducerActions";


interface SelectionItemContextProps {
    selectedItem: any;
    selectedType: string|null;
}
const SelectionItemContext = createContext<SelectionItemContextProps>({selectedItem: null, selectedType: null});
const SelectionPathContext = createContext<EditorPath|null>(null);
interface SelectionControlContextProps {
    isSelectedPath: (path: EditorPath|null) => boolean,
    select: (path: EditorPath|null) => void,
    toggleSelect: (path: EditorPath) => void,
    deselect: (path: EditorPath) => void,
}
const SelectionControlContext = createContext<SelectionControlContextProps|null>(null);

export interface SelectionProviderProps {
    track: PlixJsonData;
    dispatch: Dispatch<PlixEditorAction>
}
export const SelectionProvider: FC<SelectionProviderProps> = memo(({children, track, dispatch}) => {

    const shiftKeyDown = useRef(false);

    interface SelectionData {
        selectedItem: any;
        selectedType: string|null;
        selectedPath: EditorPath|null;
    }
    const [selectionData, setSelectionData] = useState<SelectionData>({
        selectedItem: null,
        selectedType: null,
        selectedPath: null,
    });

    const {effectConstructorMap, filterConstructorMap} = useContext(ConstructorContext);

    const onCopy = useLatestCallback((event: DocumentEventMap["copy"]) => {
        const focusedNode = document.querySelectorAll(":focus:not(body)");
        if (focusedNode.length > 0) return;
        const data = JSON.stringify({
            type: selectionData.selectedType,
            item: selectionData.selectedItem,
        });
        event.clipboardData.setData('application/json', data);
        event.clipboardData.setData('text/plain', data);
        event.preventDefault();
    });

    const onPaste = useLatestCallback((event: DocumentEventMap["paste"]) => {
        const focusedNode = document.querySelectorAll(":focus:not(body)");
        if (focusedNode.length > 0) return;
        // PASTE DATA -> CURRENT DATA: ACTION / SHIFT-ACTION
        // effectId -> effectId: replace / replace
        // array:x -> x in array: insert after / skip
        // xx -> array:x insert after / insert before
        // x -> x in array: insert after / skip
        // x -> x: replace / replace
        try {
            let data = event.clipboardData.getData('application/json');
            if (!data) data = event.clipboardData.getData('text/plain'); // ctrl + shift + v
            const {type, item} = JSON.parse(data);
            if (type === "effectId" || type === "filterId") return;
            const selectionInArray = isSelectionInArray(track, selectionData.selectedPath, effectConstructorMap, filterConstructorMap);
            if (selectionData.selectedType === "record" && type === "record") {
                const selItem = selectionData.selectedItem;
                if (item[0] === selItem[0] && item[1] === selItem[1]) return;
                dispatch(EditValueAction(selectionData.selectedPath, [item[0],item[1],selItem[2],selItem[3]]));
                return event.preventDefault();
            }
            if ("array:"+type === selectionData.selectedType) {
                let index = shiftKeyDown.current ? 0 : selectionData.selectedItem.length;
                dispatch(InsertValuesAction(selectionData.selectedPath, index, [item]));
                return event.preventDefault();
            }
            if (type === "array:"+selectionData.selectedType && selectionInArray && !shiftKeyDown.current) {
                const parentSelection = getParentSelection(track, selectionData.selectedPath, effectConstructorMap, filterConstructorMap);
                const lastPathElement = selectionData.selectedPath[selectionData.selectedPath.length-1];
                let index = Number(lastPathElement);
                if (typeof lastPathElement === "object") index = getArrayKeyIndex(parentSelection.item, lastPathElement.key);
                dispatch(InsertValuesAction(parentSelection.path, index+1, item));
                return event.preventDefault();
            }
            if (type === selectionData.selectedType && selectionInArray && !shiftKeyDown.current) {
                const parentSelection = getParentSelection(track, selectionData.selectedPath, effectConstructorMap, filterConstructorMap);
                const lastPathElement = selectionData.selectedPath[selectionData.selectedPath.length-1];
                let index = Number(lastPathElement);
                if (typeof lastPathElement === "object") index = getArrayKeyIndex(parentSelection.item, lastPathElement.key);
                dispatch(InsertValuesAction(parentSelection.path, index+1, [item]));
                return event.preventDefault();
            }
            if (type === selectionData.selectedType) {
                dispatch(EditValueAction(selectionData.selectedPath, item));
                return event.preventDefault();
            }
        } catch (ignored) {
            return;
        }
    });

    useEffect(() => {
        const onKeyUpDown = (event: DocumentEventMap["keyup"]|DocumentEventMap["keydown"]) => {
            shiftKeyDown.current = event.shiftKey;
        }

        document.addEventListener("keydown", onKeyUpDown);
        document.addEventListener("keyup", onKeyUpDown);
        document.addEventListener("copy", onCopy);
        document.addEventListener("cut", onCopy);
        document.addEventListener("paste", onPaste);
        return () => {
            document.removeEventListener("keydown", onKeyUpDown);
            document.removeEventListener("keyup", onKeyUpDown);
            document.removeEventListener("copy", onCopy);
            document.removeEventListener("cut", onCopy);
            document.removeEventListener("paste", onPaste);
        }
    }, []);

    useEffect(() => {
        if (selectionData.selectedPath) select(selectionData.selectedPath);
    }, [track]);

    const select = useLatestCallback((path: EditorPath|null) => {
        if (!path) return setSelectionData({
            selectedPath: null,
            selectedItem: null,
            selectedType: null,
        });
        const selectionInfo = selectItem("track", track, effectConstructorMap, filterConstructorMap, path);
        if (!selectionInfo) return select(null);
        setSelectionData({
            selectedPath: path,
            selectedItem: selectionInfo.item,
            selectedType: selectionInfo.type,
        });
    });

    const deselect = useLatestCallback((path: EditorPath) => {
        if (selectionData.selectedPath === path) select(null)
    });

    const isSelectedPath = useLatestCallback((path: EditorPath|null): boolean => {
        const selectedPath = selectionData.selectedPath;
        if (selectedPath == path) return true;
        if (!selectedPath || !path) return false;
        const length = path.length;
        if (selectedPath.length !== length) return false;
        for (let i=0; i<length; i++){
            const a = selectedPath[i];
            const b = path[i];
            if (a === b) continue;
            if (typeof a === "object" && typeof b === "object"){
                if (a.key === b.key) continue;
            }
            return false;
        }
        return true;
    });

    const toggleSelect = useLatestCallback((path: EditorPath) => {
        return select(isSelectedPath(path) ? null : path);
    });

    const selectionControlValue = useMemo<SelectionControlContextProps>(() => ({
        select, toggleSelect, deselect, isSelectedPath
    }), [select, toggleSelect, deselect, isSelectedPath]);

    const selectionItemValue = useMemo<SelectionItemContextProps>(() => ({
        selectedItem: selectionData.selectedItem,
        selectedType: selectionData.selectedType
    }), [selectionData.selectedItem, selectionData.selectedType]);

    return (
        <SelectionControlContext.Provider value={selectionControlValue}>
            <SelectionPathContext.Provider value={selectionData.selectedPath}>
                <SelectionItemContext.Provider value={selectionItemValue}>
                    {children}
                </SelectionItemContext.Provider>
            </SelectionPathContext.Provider>
        </SelectionControlContext.Provider>
    );
});

export function useSelectionPath(): EditorPath|null{
    return useContext(SelectionPathContext);
}

export function useSelectionItem(): SelectionItemContextProps{
    return useContext(SelectionItemContext);
}

export function useSelectionControl(): SelectionControlContextProps{
    return useContext(SelectionControlContext);
}

export const staticSelectTypes = {
    track: {
        render: "effect",
        effects: "map:effect",
        filters: "map:filter",
        editor: "trackOptions",
        profiles: "map:profile"
    },
    trackOptions: {
        duration: "number",
        fieldConfig: "fieldConfig",
    },
    profile: {
        effects: "map:effect",
        filters: "map:filter",
        fieldConfig: "fieldConfig"
    },
}

function selectItem(
    type: string,
    item: any,
    effectConstructorMap: EffectConstructorMap,
    filterConstructorMap: FilterConstructorMap,
    [pathEl, ...path]: EditorPath
): (null | {item:any, type:string}) {
    if (item === undefined) return null;
    if (pathEl === undefined) return {item, type};
    let key;
    if (typeof pathEl === "string" || typeof pathEl === "number") key = pathEl;
    else key = getArrayKeyIndex(item, pathEl.key);
    let nextType: string;
    if (type in staticSelectTypes){
        nextType = staticSelectTypes[type][key];
    } else if (type.startsWith("array:")) {
        nextType = type.substring(6);
    } else if (type.startsWith("map:")) {
        nextType = type.substring(4);
    } else if (type === "effect") {
        const effectId = item[1];
        nextType = ["boolean", "effectId", `effectParams:${effectId}`, "array:filter"][key];
    } else if (type === "filter") {
        const filterId = item[1];
        nextType = ["boolean", "filterId", `filterParams:${filterId}`][key];
    } else if (type.startsWith("effectParams:")) {
        const effectId = type.substring(13);
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        nextType = meta.paramTypes[key];
    } else if (type.startsWith("filterParams:")) {
        const effectId = type.substring(13);
        const filterConstructor = filterConstructorMap[effectId];
        const meta: ParseMeta = filterConstructor['meta'];
        nextType = meta.paramTypes[key];
    }
    if (!nextType) return null;
    return selectItem(nextType, item[key], effectConstructorMap, filterConstructorMap, path);
}

function isSelectionInArray(
    track: PlixJsonData,
    path: EditorPath,
    effectConstructorMap: EffectConstructorMap,
    filterConstructorMap: FilterConstructorMap
) {
    const selection = getParentSelection(track, path, effectConstructorMap, filterConstructorMap);
    if (!selection) return false;
    if (selection.type.startsWith("array:")) return true;
}

export function getParentSelection(
    track: PlixJsonData,
    path: EditorPath,
    effectConstructorMap: EffectConstructorMap,
    filterConstructorMap: FilterConstructorMap,
    parentLevel: number = 1
) {
    if (path.length < 1) return null;
    const parentPath = path.slice(0, path.length - parentLevel);
    const item = selectItem("track", track, effectConstructorMap, filterConstructorMap, parentPath);
    if (!item) return null;
    return {...item, path: parentPath};
}

