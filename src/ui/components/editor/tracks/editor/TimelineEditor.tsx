import React, {FC, useCallback, useContext, useRef} from "react";
import type {DragEvent} from "react";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";
import {DragContext, DragTypes} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {EditValueAction, InsertIndexAction, MultiAction, PushValueAction} from "../../PlixEditorReducerActions";
import {EditorPath} from "../../../../types/Editor";
import {generateColorByText} from "../../../../utils/generateColorByText";
import {TIMELINE_LCM} from "@plix-effect/core";

type PositionM = [startM: number, endM: number];

export interface TimelineEditorProps {
    records: PlixTimeEffectRecordJsonData[],
    bpm: number,
    grid: number,
    offset: number,
    repeatStart: number,
    repeatEnd: number,
    path: EditorPath,
}

export const TimelineEditor: FC<TimelineEditorProps> = ({records, bpm, grid, offset, repeatStart, repeatEnd, path}) => {

    // const cycle = 60000/bpm;
    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const {trackWidth, duration, zoom} = useContext(ScaleDisplayContext);
    const {dispatch} = useContext(TrackContext);
    const onDropActionRef = useRef<(event: DragEvent<HTMLDivElement>) => void>();
    const cycle = 60000 / bpm;

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
        if (dragCount.current === 0) clearDummy(dummyRef.current);
        if (dragRef.current) dragRef.current.dropEffect = null;
    }, []);

    const setDropEffect = useCallback((event: DragEvent<HTMLDivElement>, effect: typeof dragRef.current.dropEffect) => {
        dragRef.current.dropEffect = event.dataTransfer.dropEffect = effect;
    }, []);

    const allowEventWithDropEffect = useCallback((event: DragEvent<HTMLDivElement>, effect: typeof dragRef.current.dropEffect, handler: (event: DragEvent<HTMLDivElement>) => void) => {
        setDropEffect(event, effect);
        onDropActionRef.current = handler;
        event.preventDefault();
    }, []);

    const onRecordMove = useCallback((
        event: DragEvent<HTMLDivElement>,
        timeM: number,
        record: PlixTimeEffectRecordJsonData,
        recordDurationM: number,
        targetAsLink: boolean,
    ) => {
        let dropEffect: "move"|"copy"|"link" = dragRef.current.deleteAction && !event.ctrlKey ? "move" : "copy"
        if (targetAsLink) dropEffect = "link";
        const [[startM, endM], canMove] = getMovingResult(record, timeM, recordDurationM, !event.shiftKey, cycle, grid, records, dropEffect);
        const dummyStart = offset + startM * cycle / TIMELINE_LCM;
        const dummyDuration = (endM - startM) * cycle / TIMELINE_LCM;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], canMove, record[0], record[1]);
        if (!canMove) return;
        return allowEventWithDropEffect(event, dropEffect, (event) => {
            event.dataTransfer.dropEffect = dropEffect;
            const newRecordValue: PlixTimeEffectRecordJsonData = [record[0], record[1], startM, endM];
            const insertAction = createInsertRecordAction(newRecordValue);
            if (dropEffect === "move" && dragRef.current.deleteAction) {
                dispatch(MultiAction([insertAction, dragRef.current.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(insertAction);
            }
        });
    }, [dragRef, cycle, grid, offset, records]);

    const onRecordReplace = useCallback((
        event: DragEvent<HTMLDivElement>,
        record: PlixTimeEffectRecordJsonData,
        collisionIndex: number,
        collisionRecord: PlixTimeEffectRecordJsonData,
        targetAsLink: boolean
    ) => {
        let dropEffect: "move"|"copy"|"link" = dragRef.current.deleteAction && !event.ctrlKey ? "move" : "copy";
        if (targetAsLink) dropEffect = "link";
        const dummyStart = offset + collisionRecord[2] * cycle / TIMELINE_LCM;
        const dummyDuration = (collisionRecord[3] - collisionRecord[2]) * cycle / TIMELINE_LCM;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], true, record[0], record[1], true);
        return allowEventWithDropEffect(event, dropEffect, (event) => {
            event.dataTransfer.dropEffect = dropEffect;
            const newRecordValue: PlixTimeEffectRecordJsonData = [record[0], record[1], collisionRecord[2], collisionRecord[3]];
            const editAction = EditValueAction([...path, collisionIndex], newRecordValue);
            if (dropEffect === "move" && dragRef.current.deleteAction) {
                dispatch(MultiAction([editAction, dragRef.current.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(editAction);
            }
        });
    }, [dragRef, cycle, grid, offset, records]);


    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        dragRef.current.dropEffect = event.dataTransfer.dropEffect = "none";
        const editorRect = editorRef.current.getBoundingClientRect();
        // const dummy = dummyRef.current;



        let record: PlixTimeEffectRecordJsonData;
        let recordPosM: number;
        let recordBpm: number;
        let targetAsLink: boolean;
        const cursorPosTime = (event.clientX - editorRect.left) / zoom;
        const cursorPosM = (cursorPosTime - offset) / cycle * TIMELINE_LCM;
        const recordMove = dragRef.current.recordMove;
        const effectLink = dragRef.current.effectLink;
        if (recordMove) {
            record = recordMove.record;
            const eventPosTime = (event.clientX - editorRect.left - dragRef.current.offsetX) / zoom;
            recordPosM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
            recordBpm = recordMove.bpm;
            targetAsLink = false;
        } else if (effectLink) {
            const recordDuration = TIMELINE_LCM; // todo: calculate best record duration
            record = [true, effectLink[2], 0, recordDuration];
            const shiftTime = cycle * recordDuration / TIMELINE_LCM / 2; // drag center of element
            console.log("shiftTime", shiftTime);
            const eventPosTime =  (event.clientX - editorRect.left) / zoom - shiftTime;
            recordPosM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
            recordBpm = bpm;
            targetAsLink = true;
        }

        if (record) {
            // check collision with mouse position
            const [collisionIndex, collisionRecord] = getCollisionRecord(record, records, cursorPosM);
            if (collisionRecord) {
                const recordsIsSame = collisionRecord[0] === record[0] && collisionRecord[1] === record[1]
                if (!recordsIsSame) return onRecordReplace(event, record, collisionIndex, collisionRecord, targetAsLink);
            }

            // move record to new position
            const [,,startM, endM] = record;
            const recordDurationM = (endM - startM) * (bpm / recordBpm);
            return onRecordMove(event, recordPosM, record, recordDurationM, targetAsLink);
        }
    }, [zoom, duration, cycle, grid, offset, records, createInsertRecordAction, onRecordMove]);

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
                <div className="timeline-editor-dummy" ref={dummyRef}>
                    <div className="timeline-record-name --dummy-record"/>
                </div>
                <div className="timeline-editor-grid">
                    <TimelineEditorGrid offset={offset} grid={grid ?? 1} bpm={bpm} repeatStart={repeatStart}  repeatEnd={repeatEnd} />
                </div>
                <div className="timeline-editor-records">
                    <Records records={records} path={path} bpm={bpm} offset={offset}/>
                </div>
            </div>
        </div>
    );
}

// function getScalingResult(
//     recordScale: { record: PlixTimeEffectRecordJsonData, side: "left"|"right" },
//     eventPosTime: number,
//     bindToGrid: boolean,
//     cycle: number|null,
//     grid: number|null,
//     offset: number,
//     records: PlixTimeEffectRecordJsonData[],
//
// ): [position: [startBeat: number, endBeat: number], available: boolean]{
//     const selectedPosition = getSelectedPosition(bindToGrid, eventPosTime, cycle, grid, offset);
//     const moveRecordPosition = getNewPositionAfterScaling(recordScale, selectedPosition);
//     if (moveRecordPosition[1] <= 0) { // overflow
//         return [[recordScale.record[2], recordScale.record[3]], false];
//     }
//     const canMove = canMoveRecord(recordScale.record, records, moveRecordPosition, "move");
//     return [moveRecordPosition, canMove];
// }

function getMovingResult(
    record: PlixTimeEffectRecordJsonData,
    recordStartM: number,
    recordDurationM: number,
    bindToGrid: boolean,
    cycle: number|null,
    grid: number|null,
    records: PlixTimeEffectRecordJsonData[],
    dropEffect: "move"|"copy"|"link"|"none",
): [position: PositionM, available: boolean]{
    if (!bindToGrid) {
        const recordEndM = recordStartM + recordDurationM;
        // просто переносим рекорд и проверяем, можно ли.
        const canMove = canMoveRecord(record, records, recordStartM, recordEndM, dropEffect);
        return [[recordStartM, recordEndM], canMove];
    }
    return [[0,1],false];
    // const posEndTime = posTime + recordDuration;
    // const selectedPositionLeft = getSelectedPosition(bindToGrid, posTime, cycle, grid, offset);
    // const selectedPositionRight = getSelectedPosition(bindToGrid, posEndTime, cycle, grid, offset);
    // let selectedPosition
    // if (selectedPositionLeft < offset) {
    //     selectedPosition = selectedPositionRight - recordDuration;
    // } else {
    //     const leftDif = Math.abs(selectedPositionLeft - posTime);
    //     const rightDif = Math.abs(selectedPositionRight - posEndTime);
    //     selectedPosition = (leftDif <= rightDif) ? selectedPositionLeft : selectedPositionRight - recordDuration;
    // }
    // if (selectedPosition < 0) selectedPosition = 0;
    // const moveRecordPosition: [number, number] = [selectedPosition, recordDuration];
    // const canMove = canMoveRecord(record, records, moveRecordPosition, dropEffect);
    // return [moveRecordPosition, canMove];
}

// function getNewPositionAfterScaling(
//     recordScale: { record: PlixTimeEffectRecordJsonData, side: "left"|"right" },
//     selectedPosition: number
// ): [position: number, duration: number]{
//     const [,,recordPosition, recordWidth] = recordScale.record;
//     if (recordScale.side === "right") {
//         return [recordPosition, selectedPosition - recordPosition]
//     } else {
//         return [selectedPosition, recordPosition + recordWidth - selectedPosition]
//     }
// }

function clearDummy(dummy: HTMLDivElement){
    dummy.style.display = "none";
}

function setDummyPosition(
    dummy: HTMLDivElement,
    duration: number,
    [posStart, posDuration]: [start: number, duration: number],
    available: boolean,
    enabled: boolean,
    name: string,
    foreground: boolean = false,
){
    const dummyStartD = posStart / duration;
    const dummyDurationD = posDuration / duration;
    dummy.style.display = "";
    dummy.style.left = `${dummyStartD * 100}%`;
    dummy.classList.toggle("_unavailable", !available);
    dummy.classList.toggle("_foreground", foreground);
    dummy.style.width = `${dummyDurationD * 100}%`;
    const dummyRecord = dummy.querySelector(".--dummy-record") as HTMLElement;
    dummyRecord.style.display = available ? "" : "none";
    if (available) {
        dummyRecord.textContent = name;
        const bgColor = generateColorByText(name, enabled ? 1 : 0.2, 0.3, enabled ? 1 : 0.5);
        dummyRecord.classList.toggle("_disabled", !enabled);
        dummyRecord.style.backgroundColor = bgColor;
    }

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
    startM: number,
    endM: number,
    effect: "move"|"copy"|"link"|"none",
) {
    for (const rec of records) {
        if (effect === "move" && rec === record) continue;
        const [,,recStartM, recEndM] = rec;
        if (endM <= recStartM) continue;
        if (startM >= recEndM) continue;
        return false;
    }
    return true;
}

function getCollisionRecord(
    record: PlixTimeEffectRecordJsonData,
    records: PlixTimeEffectRecordJsonData[],
    timeM: number,
): [number, PlixTimeEffectRecordJsonData|null] {
    for (let i = 0; i < records.length; i++){
        let rec = records[i];
        if (rec === record) continue;
        const [,,recStartM, recEndM] = rec;
        if (timeM >= recEndM) continue;
        if (timeM <= recStartM) return [-1, null];
        return [i, rec];
    }
    return [-1, null];
}