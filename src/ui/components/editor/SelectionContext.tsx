import React, {createContext, FC, useContext, useEffect, useMemo, useRef, useState} from "react";
import useLatestCallback from "../../use/useLatestCallback";
import {EditorPath} from "../../types/Editor";
import type {PlixJsonData} from "@plix-effect/core/types/parser";
import {EffectConstructorMap, FilterConstructorMap} from "@plix-effect/core/dist/types/parser";
import {ConstructorContext} from "./ConstructorContext";
import {getArrayKeyIndex} from "../../utils/KeyManager";
import {ParseMeta} from "../../types/ParseMeta";


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

export interface CreatePlaybackProps {
    track: PlixJsonData;
}
export const CreateSelectionData: FC<CreatePlaybackProps> = ({children, track}) => {

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
}

export function useSelectionPath(): EditorPath|null{
    return useContext(SelectionPathContext);
}

export function useSelectionItem(): SelectionItemContextProps{
    return useContext(SelectionItemContext);
}

export function useSelectionControl(): SelectionControlContextProps{
    return useContext(SelectionControlContext);
}

const staticSelectTypes = {
    track: {
        render: "effect",
        effects: "array:effect",
        filters: "array:filter",
        options: "trackOptions",
    },
    trackOptions: {
        duration: "number",
        count: "number",
    }
}

function selectItem(
    type: string,
    item: any,
    effectConstructorMap: EffectConstructorMap,
    filterConstructorMap: FilterConstructorMap,
    [pathEl, ...path]: EditorPath
): (null | {item:any, type:string}) {
    if (pathEl === undefined) return {item, type};
    let key;
    if (typeof pathEl === "string" || typeof pathEl === "number") key = pathEl;
    else key = getArrayKeyIndex(item, pathEl.key);
    let nextType: string;
    if (type in staticSelectTypes){
        nextType = staticSelectTypes[type][key];
    } else if (type.startsWith("array:") && typeof key === "number") {
        nextType = type.substring(6);
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


