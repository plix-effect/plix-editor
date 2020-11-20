import React, {FC, useCallback, useContext, useRef} from "react";
import type {DragEvent} from "react";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";
import {DragContext} from "../../DragContext";

export interface TimelineEditorProps {
    onChange: (value: any) => void,
    records: PlixTimeEffectRecordJsonData[],
    cycle: number|null,
    grid: number|null,
    offset: number,
}
export const TimelineEditor: FC<TimelineEditorProps> = ({records, onChange, cycle, grid, offset}) => {

    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const {trackWidth, duration, zoom} = useContext(ScaleDisplayContext);

    const dummyRef = useRef<HTMLDivElement>()
    const editorRef = useRef<HTMLDivElement>()

    const onDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current++;
        if (dragRef.current?.record) {
            return event.preventDefault();
        }
        if (dragRef.current?.recordScale && records.includes(dragRef.current?.recordScale.record)) {
            return event.preventDefault();
        }
    }, []);

    const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current--;
        if (dragCount.current === 0) dummyRef.current.style.display = "none";
    }, []);

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        const editorRect = editorRef.current.getBoundingClientRect();
        const dragLeftPosPx = event.clientX - editorRect.left - dragRef.current.offsetX;
        const dragLeftPosTime = dragLeftPosPx / zoom;
        const eventPosTime = (event.clientX - editorRect.left) / zoom;
        // const record = dragRef.current?.record;
        // if (record) {
        //     const editorRect = editorRef.current.getBoundingClientRect();
        //     event.dataTransfer.dropEffect = event.shiftKey ? "copy" : "move";
        //     const dummy = dummyRef.current;
        //     if (!dummy) return;
        //     const durD = record[3] / duration;
        //
        //     dummy.style.display = "";
        //     dummy.style.width = `${durD*100}%`;
        //     const dragLeft = (event.clientX - editorRect.left - dragRef.current.offsetX);
        //     const dummyLeft = event.ctrlKey ? dragLeft : dragLeft + 25 - (dragLeft%50);
        //     dummy.style.left = `${dummyLeft}px`;
        //     dummy.classList.toggle("_unavailable", dragLeft > 300);
        //     event.preventDefault();
        // }
        const recordScale = dragRef.current?.recordScale
        if (recordScale && records.includes(recordScale.record)) {
            handleDragScale(event, dummyRef.current, eventPosTime, duration, recordScale, records, cycle, grid, offset);
            event.preventDefault();
        }
    }, [zoom, duration]);

    const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current = 0;
        dummyRef.current.style.display = "none";
        console.log("MOVE TO NEW POSITION", dragRef.current, event);
    }, []);

    return (
        <div
            className="timeline-editor-drag-content"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div ref={editorRef} className="timeline-editor" style={{width: trackWidth}}>
                <div className="timeline-editor-dummy" ref={dummyRef} />
                <div className="timeline-editor-grid">
                    {cycle !== null && <TimelineEditorGrid offset={offset} grid={grid ?? 1} cycle={cycle} />}
                </div>
                <div className="timeline-editor-records">
                    <Records records={records} />
                </div>
            </div>
        </div>
    );
}

function handleDragScale(
    event: DragEvent<HTMLDivElement>,
    dummy: HTMLDivElement,
    dragPosTime: number,
    duration: number,
    recordScale: { record: PlixTimeEffectRecordJsonData, side: "left"|"right" },
    records: PlixTimeEffectRecordJsonData[],
    cycle: number|null,
    grid: number|null,
    offset: number
){
    event.dataTransfer.dropEffect = "none";
    const bindToGrid = (cycle !== null) && !event.ctrlKey;
    const selectedPosTime = bindToGrid ? getNearGridPosition(dragPosTime, cycle, grid, offset) : dragPosTime;

    if (selectedPosTime < 0) return clearDummy(event, dummy);
    if (selectedPosTime > duration) return clearDummy(event, dummy);

    dummy.style.display = "";
    dummy.classList.toggle("_unavailable", false);

    const selectedPosTimeD = selectedPosTime / duration;
    const trackPosD = recordScale.record[2] / duration;
    const trackDurD = recordScale.record[3] / duration;

    let newPosStartTime, newPosDuration;
    if (recordScale.side === "right") {
        newPosStartTime = recordScale.record[2];
        newPosDuration = selectedPosTime - newPosStartTime;
    } else {
        newPosStartTime = selectedPosTime;
        newPosDuration = recordScale.record[2] + recordScale.record[3] - newPosStartTime;
        const trackEndD = trackPosD + trackDurD;
        if (selectedPosTimeD >= trackEndD) {
            dummy.style.left = `${trackPosD * 100}%`;
            dummy.style.width = `${trackDurD * 100}%`;
            dummy.classList.toggle("_unavailable", true);
            return;
        }
        dummy.style.left = `${selectedPosTimeD * 100}%`;
        dummy.style.width = `${(trackEndD - selectedPosTimeD) * 100}%`;
    }
    if (newPosDuration <= 0) {
        dummy.style.left = `${trackPosD * 100}%`;
        dummy.style.width = `${trackDurD * 100}%`;
        dummy.classList.toggle("_unavailable", true);
        return;
    }
    const newPosStartTimeD = newPosStartTime / duration;
    const newPosDurationD = newPosDuration / duration;
    dummy.style.left = `${newPosStartTimeD * 100}%`;
    dummy.style.width = `${newPosDurationD * 100}%`;
    if (!canMoveRecord(recordScale.record, records, newPosStartTime, newPosDuration)) {
        dummy.classList.toggle("_unavailable", true);
        return;
    }
    event.dataTransfer.dropEffect = "move";
    event.preventDefault();
}

function clearDummy(event: DragEvent<HTMLDivElement>, dummy: HTMLDivElement){
    dummy.style.display = "none";
    event.dataTransfer.dropEffect = "none";
}

function getNearGridPosition(
    dragLeftPosTime: number,
    cycle: number|null,
    grid: number|null,
    offset: number,
){
    if (!cycle) return dragLeftPosTime;
    if (dragLeftPosTime < offset) return dragLeftPosTime;
    const gridSize = cycle/(grid??1);
    const gridsLeft = Math.floor((dragLeftPosTime-offset) / gridSize);
    const leftGridPos = offset + gridSize * gridsLeft;
    const leftGridDif = dragLeftPosTime - leftGridPos;
    if (leftGridDif < gridSize/2) return leftGridPos;
    return leftGridPos + gridSize;
}

function canMoveRecord(
    record: PlixTimeEffectRecordJsonData,
    records: PlixTimeEffectRecordJsonData[],
    start: number,
    duration: number,
) {
    for (const rec of records) {
        if (rec === record) continue;
        const [,,recPos, recDuration] = rec;
        if (start + duration <= recPos) continue;
        if (start >= recPos + recDuration) continue;
        return false;
    }
    return true;
}