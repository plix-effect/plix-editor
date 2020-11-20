import React, {FC, useCallback, useContext, useRef} from "react";
import type {DragEvent} from "react";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";
import {DragContext} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {EditValueAction, InsertIndexAction, MultiAction, PushValueAction} from "../../PlixEditorReducerActions";
import {EditorPath} from "../../../../types/Editor";

export interface TimelineEditorProps {
    records: PlixTimeEffectRecordJsonData[],
    cycle: number|null,
    grid: number|null,
    offset: number,
    path: EditorPath,
}
export const TimelineEditor: FC<TimelineEditorProps> = ({records, cycle, grid, offset, path}) => {

    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const {trackWidth, duration, zoom} = useContext(ScaleDisplayContext);
    const {dispatch} = useContext(TrackContext);
    const onDropActionRef = useRef<(event: DragEvent<HTMLDivElement>) => void>();

    const dummyRef = useRef<HTMLDivElement>();
    const editorRef = useRef<HTMLDivElement>();

    const createInsertRecordAction = useCallback((record: PlixTimeEffectRecordJsonData) => {
        const index = records.findIndex(rec => rec[3] > record[3]);
        if (index < 0) return PushValueAction(path, record);
        return InsertIndexAction(path, index, record);
    }, [records]);

    const onDragEnter = useCallback(() => {
        dragCount.current++;
    }, []);

    const onDragLeave = useCallback(() => {
        dragCount.current--;
        if (dragCount.current === 0) clearDummy(dummyRef.current)
    }, []);

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        event.dataTransfer.dropEffect = "none";
        const dummy = dummyRef.current;
        const editorRect = editorRef.current.getBoundingClientRect();

        // scale record
        const recordScale = dragRef.current?.recordScale;
        if (recordScale && records.includes(recordScale.record)) {
            const eventPosTime = (event.clientX - editorRect.left) / zoom;
            const [pos, canMove] = getScalingResult(recordScale, eventPosTime, !event.ctrlKey, cycle, grid, offset, records);
            setDummyPosition(dummy, duration, pos, canMove);
            if (!canMove) return;
            event.dataTransfer.dropEffect = "move";
            onDropActionRef.current = () => {
                const record = recordScale.record;
                const newRecordValue = [record[0], record[1], pos[0], pos[1]]
                dispatch(EditValueAction([...path, records.indexOf(record)], newRecordValue))
            }
            return event.preventDefault();
        }
        const recordMove = dragRef.current?.recordMove;
        if (recordMove) {
            const action: "copy"|"move" = event.shiftKey ? "copy" : "move"
            const record = recordMove.record;
            const posTime = (event.clientX - editorRect.left - dragRef.current.offsetX) / zoom;
            const [pos, canMove] = getMovingResult(record, posTime, !event.ctrlKey, cycle, grid, offset, records, action);
            setDummyPosition(dummy, duration, pos, canMove);
            if (!canMove) return;
            event.dataTransfer.dropEffect = action;
            onDropActionRef.current = (event) => {
                event.dataTransfer.dropEffect = action;
                const newRecordValue: PlixTimeEffectRecordJsonData = [record[0], record[1], pos[0], pos[1]];
                const insertAction = createInsertRecordAction(newRecordValue);
                if (action === "copy") {
                    dispatch(insertAction)
                } else { // action === "move"
                    dispatch(MultiAction([insertAction, recordMove.deleteAction]))
                }
            }
            return event.preventDefault();
        }

        return clearDummy(dummy);
    }, [zoom, duration, cycle, grid, offset, records, createInsertRecordAction]);

    const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current = 0;
        dummyRef.current.style.display = "none";
        onDropActionRef.current?.(event)
    }, [dragCount, dummyRef, onDropActionRef]);

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
                    <Records records={records} path={path} />
                </div>
            </div>
        </div>
    );
}

function getScalingResult(
    recordScale: { record: PlixTimeEffectRecordJsonData, side: "left"|"right" },
    eventPosTime: number,
    bindToGrid: boolean,
    cycle: number|null,
    grid: number|null,
    offset: number,
    records: PlixTimeEffectRecordJsonData[],

): [position: [startPosition: number, duration: number], available: boolean]{
    const selectedPosition = getSelectedPosition(bindToGrid, eventPosTime, cycle, grid, offset);
    const moveRecordPosition = getNewPositionAfterScaling(recordScale, selectedPosition);
    if (moveRecordPosition[1] <= 0) { // overflow
        return [[recordScale.record[2], recordScale.record[3]], false];
    }
    const canMove = canMoveRecord(recordScale.record, records, moveRecordPosition, "move");
    return [moveRecordPosition, canMove];
}

function getMovingResult(
    record: PlixTimeEffectRecordJsonData,
    posTime: number,
    bindToGrid: boolean,
    cycle: number|null,
    grid: number|null,
    offset: number,
    records: PlixTimeEffectRecordJsonData[],
    effect: "move"|"copy",
): [position: [startPosition: number, duration: number], available: boolean]{
    const recordDuration = record[3];
    const posEndTime = posTime + recordDuration;
    const selectedPositionLeft = getSelectedPosition(bindToGrid, posTime, cycle, grid, offset);
    const selectedPositionRight = getSelectedPosition(bindToGrid, posEndTime, cycle, grid, offset);
    const leftDif = Math.abs(selectedPositionLeft - posTime);
    const rightDif = Math.abs(selectedPositionRight - posEndTime);
    const selectedPosition = (leftDif <= rightDif) ? selectedPositionLeft : selectedPositionRight - recordDuration;
    const moveRecordPosition: [number, number] = [selectedPosition, recordDuration];
    const canMove = canMoveRecord(record, records, moveRecordPosition, effect);
    return [moveRecordPosition, canMove];
}

function getNewPositionAfterScaling(
    recordScale: { record: PlixTimeEffectRecordJsonData, side: "left"|"right" },
    selectedPosition: number
): [position: number, duration: number]{
    const [,,recordPosition, recordWidth] = recordScale.record;
    if (recordScale.side === "right") {
        return [recordPosition, selectedPosition - recordPosition]
    } else {
        return [selectedPosition, recordPosition + recordWidth - selectedPosition]
    }
}

function clearDummy(dummy: HTMLDivElement){
    dummy.style.display = "none";
}

function setDummyPosition(
    dummy: HTMLDivElement,
    duration: number,
    [posStart, posDuration]: [start: number, duration: number],
    available: boolean
){
    const dummyStartD = posStart / duration;
    const dummyDurationD = posDuration / duration;
    dummy.style.display = "";
    dummy.style.left = `${dummyStartD * 100}%`;
    dummy.classList.toggle("_unavailable", !available);
    dummy.style.width = `${dummyDurationD * 100}%`;
}

function getSelectedPosition(
    bindToGrid: boolean,
    dragLeftPosTime: number,
    cycle: number|null,
    grid: number|null,
    offset: number,
){
    if (dragLeftPosTime < 0) return 0;
    if (!bindToGrid) return dragLeftPosTime;
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
    [start, duration]: [start: number, duration: number],
    effect: "move"|"copy",
) {
    for (const rec of records) {
        if (effect === "move" && rec === record) continue;
        const [,,recPos, recDuration] = rec;
        if (start + duration <= recPos) continue;
        if (start >= recPos + recDuration) continue;
        return false;
    }
    return true;
}