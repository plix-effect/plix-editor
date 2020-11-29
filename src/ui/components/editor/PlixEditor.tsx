import {
    FC,
    default as React,
    useMemo,
    useReducer,
    useState,
    useRef,
    useEffect,
    useCallback,
    DragEvent,
    memo, ComponentType
} from "react";
import "./PlixEditor.scss";
import {SplitTopBottom} from "../divider/SplitTopBottom";
import {TrackEditor} from "./TrackEditor";
import {TrackContextProps, TrackContext} from "./TrackContext";
import {ConstructorContextProps, ConstructorContext} from "./ConstructorContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import {PlixEditorReducer} from "./PlixEditorReducer";
import {DragContext, DragType} from "./DragContext";
import {OpenAction} from "./PlixEditorReducerActions";
import {AudioFileContext} from "./AudioFileContext";
import {CreatePlayback} from "./PlaybackContext";
import {SplitLeftRight} from "../divider/SplitLeftRight";
import {CreateSelectionData, useSelectionItem, useSelectionPath} from "./SelectionContext";
import {AudioPlayer} from "./AudioPlayer";
import {readMp3Json} from "../../utils/Mp3Meta";

const defaultTrack: PlixJsonData & {editor: any} = {
    effects: {},
    filters: {},
    render: [true, "Chain", [[
        [true, "Timeline", [[], 1000, 8, 0], [[true, "Blend", [1, "normal"]]]],
        [true, "Timeline", [[], 1000, 8, 100], [[true, "Blend", [1, "normal"]]]],
        [true, "Timeline", [[], 0, 8, 1000], [[true, "Blend", [1, "normal"]]]],
    ]], []],
    editor: {duration: 10_000, count: 10}
};

export const PlixEditor: FC = () => {

    const dragRef = useRef<DragType>(null);
    useEffect(() => {
        const clearDragRef = () => dragRef.current = null;
        document.addEventListener("dragend", clearDragRef);
        document.addEventListener("drop", clearDragRef);
        return () => {
            document.removeEventListener("dragend", clearDragRef);
            document.removeEventListener("drop", clearDragRef);
        }
    }, [dragRef]);

    const [{track, history, historyPosition}, dispatch] = useReducer(PlixEditorReducer, null, () => {
        const savedTrack = localStorage.getItem("plix_editor_track");
        return ({
            track: (savedTrack ? JSON.parse(savedTrack) : defaultTrack) as PlixJsonData,
            history: [],
            historyPosition: 0
        });
    });

    const [audioFile, setAudioFile] = useState<File|null>(null);

    useEffect(() => void (async () => {
        const db = await openPlixDB();
        const transaction = db.transaction("audio", "readonly");
        transaction.objectStore("audio").get("audio").onsuccess = (event) => {
            const file = event.target['result'];
            if (file) setAudioFile(file);
        };
    })(), []);

    useEffect(() => {
        localStorage.setItem("plix_editor_track", JSON.stringify(track));
    }, [track])

    const trackContextValue: TrackContextProps = useMemo(() => ({
        undoCounts: historyPosition,
        redoCounts: history.length - historyPosition,
        track,
        dispatch,

    }), [track, dispatch, historyPosition, history]);

    const constructorContextValue: ConstructorContextProps = useMemo(() => ({
        effectConstructorMap: effectConstructorMap as ConstructorContextProps["effectConstructorMap"],
        filterConstructorMap: filterConstructorMap as ConstructorContextProps["filterConstructorMap"],
    }), []);

    const storeAudioFile = useCallback(async (file: File|null) => {
        setAudioFile(file);
        const db = await openPlixDB();
        const transaction = db.transaction("audio", "readwrite");
        if (!file) {
            transaction.objectStore("audio").clear();
        } else {
            transaction.objectStore("audio").put(file, "audio")
        }
    }, [setAudioFile]);

    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        const items = Array.from(event.dataTransfer.items);
        let jsonItem = items.find(item => item.kind === "file" && item.type === "application/json");
        let audioItem = items.find(item => item.kind === "file" && item.type === "audio/mpeg");
        if (jsonItem || audioItem) event.preventDefault();
    }, []);

    const onDrop = useCallback(async (event: DragEvent<HTMLElement>) => {
        const items = Array.from(event.dataTransfer.items);
        let audioItem = items.find(item => item.kind === "file" && item.type === "audio/mpeg");
        if (audioItem) {
            const audioFile = audioItem.getAsFile();
            event.preventDefault();
            void storeAudioFile(audioFile); // save to db;
            const buffer = await audioFile.arrayBuffer();
            const track = readMp3Json(buffer);
            if (track) dispatch(OpenAction(track as PlixJsonData));
            return;
        }
        let jsonItem = items.find(item => item.kind === "file" && item.type === "application/json");
        if (jsonItem) {
            event.preventDefault();
            const text = await jsonItem.getAsFile().text();
            const track = JSON.parse(text);
            dispatch(OpenAction(track));
            return;
        }
    }, []);



    const audioFileContextValue = useMemo(() => ({
        audioFile,
        setAudioFile: storeAudioFile
    }), [audioFile, setAudioFile])

    return (
        <div className="plix-editor" onDragOver={onDragOver} onDrop={onDrop}>
            <ConstructorContext.Provider value={constructorContextValue}>
                <AudioFileContext.Provider value={audioFileContextValue}>
                    <CreatePlayback duration={track?.['editor']?.['duration'] ?? 60*1000}>
                        <CreateSelectionData track={track}>
                            <DragContext.Provider value={dragRef}>
                                <TrackContext.Provider value={trackContextValue}>
                                    <AudioPlayer/>
                                    <SplitTopBottom minTop={100} minBottom={200} storageKey="s1">
                                        <TrackEditor />
                                        <SplitLeftRight minLeft={100} minRight={200} storageKey={"btm"}>
                                            <div style={{flexGrow: 1, backgroundColor: "green"}}>libs</div>
                                            <div>
                                                canvas or
                                                <ShowSelectedElement/>
                                            </div>
                                        </SplitLeftRight>
                                    </SplitTopBottom>
                                </TrackContext.Provider>
                            </DragContext.Provider>
                        </CreateSelectionData>
                    </CreatePlayback>
                </AudioFileContext.Provider>
            </ConstructorContext.Provider>
        </div>
    );
}

const ShowSelectedElement = memo(() => {
    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    return (
        <div>
            <div>Render time: {performance.now()}</div>
            <div>Path: {JSON.stringify(path)}</div>
            <div>Selected type: {selectedType}</div>
            <div>Selected item: {JSON.stringify(selectedItem)}</div>
        </div>
    )
});

async function openPlixDB(){
    const dbRequest = indexedDB.open("plix-effect", 1.0);
    dbRequest.onupgradeneeded = function() {
        const db = dbRequest.result;
        db.objectStoreNames.contains("audio") || db.createObjectStore("audio");
    };
    await new Promise(resolve => dbRequest.onsuccess = resolve);
    return dbRequest.result;
}