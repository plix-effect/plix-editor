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
    const durationM = (repeatEnd ? repeatEnd : (duration - offset) / cycle) * TIMELINE_LCM;

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
        cursorPosM: number,
        recordStartM: number,
        record: PlixTimeEffectRecordJsonData,
        recordDurationM: number,
        targetAsLink: boolean,
    ) => {
        let dropEffect: "move"|"copy"|"link" = dragRef.current.deleteAction && !event.ctrlKey ? "move" : "copy"
        if (targetAsLink) dropEffect = "link";
        const [[startM, endM], canMove] = getMovingResult(record, cursorPosM, recordStartM, recordDurationM, !event.shiftKey, grid, records, durationM, dropEffect);
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
    }, [dragRef, cycle, grid, offset, records, durationM]);


    const onRecordScale = useCallback((
        event: DragEvent<HTMLDivElement>,
        {record, side}: DragTypes['recordScale'],
        cursorPosM: number,
    ) => {
        if (!records.includes(record)) return;

        const [[startM, endM], canMove] = getScalingResult(record, records, side, cursorPosM, durationM, !event.shiftKey, grid);
        const dummyStart = offset + startM * cycle / TIMELINE_LCM;
        const dummyDuration = (endM - startM) * cycle / TIMELINE_LCM;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], canMove, record[0], record[1]);
        if (!canMove) return;
        return allowEventWithDropEffect(event, "move", (event) => {
            event.dataTransfer.dropEffect = "move";
            const newRecordValue: PlixTimeEffectRecordJsonData = [record[0], record[1], startM, endM];
            const index = records.indexOf(record);
            const editAction = EditValueAction([...path, index], newRecordValue);
            dispatch(editAction);
        });
    }, [dragRef, cycle, grid, offset, records, durationM]);

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
        let recordStartM: number;
        let recordBpm: number;
        let targetAsLink: boolean;
        const cursorPosTime = (event.clientX - editorRect.left) / zoom;
        const cursorPosM = (cursorPosTime - offset) / cycle * TIMELINE_LCM;
        const recordMove = dragRef.current.recordMove;
        const effectLink = dragRef.current.effectLink;
        if (recordMove) {
            record = recordMove.record;
            const eventPosTime = (event.clientX - editorRect.left - dragRef.current.offsetX) / zoom;
            recordStartM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
            recordBpm = recordMove.bpm;
            targetAsLink = false;
        } else if (effectLink) {
            const recordDuration = TIMELINE_LCM; // todo: calculate best record duration
            record = [true, effectLink[2], 0, recordDuration];
            const shiftTime = cycle * recordDuration / TIMELINE_LCM / 2; // drag center of element
            const eventPosTime =  (event.clientX - editorRect.left) / zoom - shiftTime;
            recordStartM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
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
            return onRecordMove(event, cursorPosM, recordStartM, record, recordDurationM, targetAsLink);
        }
        const recordScale = dragRef.current.recordScale;
        if (recordScale) {
            return onRecordScale(event, recordScale, cursorPosM);
        }

    }, [zoom, duration, cycle, grid, offset, records, createInsertRecordAction, onRecordMove, onRecordScale, onRecordReplace]);

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

function getScalingResult(
    record: PlixTimeEffectRecordJsonData,
    records: PlixTimeEffectRecordJsonData[],
    side: "left"|"right",
    cursorPosM: number,
    maxDurationM: number,
    bindToGrid: boolean,
    grid: number|null,
): [position: [startBeat: number, endBeat: number], available: boolean]{
    cursorPosM = Math.round(cursorPosM);
    const moveFromM = (side === "left") ? record[2] : record[3]
    const freeSpaceM = getFreeSpace(record, records, moveFromM, maxDurationM, "move");
    if (side === "right") freeSpaceM[0] = record[2];
    else freeSpaceM[1] = record[3];

    let targetPosM = cursorPosM;
    if (bindToGrid) targetPosM = getGridPosition(cursorPosM, grid, freeSpaceM);

    const newRecordPosM: PositionM = [record[2], record[3]];
    if (side === "right") newRecordPosM[1] = Math.min(targetPosM, freeSpaceM[1]);
    if (side === "left") newRecordPosM[0] = Math.max(targetPosM, freeSpaceM[0]);

    const canMove = canMoveRecord(record, records, newRecordPosM[0], newRecordPosM[1], "move")
    return [newRecordPosM, canMove];
}

function getMovingResult(
    record: PlixTimeEffectRecordJsonData,
    cursorPosM: number,
    recordStartM: number,
    recordDurationM: number,
    bindToGrid: boolean,
    grid: number|null,
    records: PlixTimeEffectRecordJsonData[],
    maxDurationM: number,
    dropEffect: "move"|"copy"|"link"|"none",
): [position: PositionM, available: boolean]{
    recordStartM = Math.round(recordStartM);
    recordDurationM = Math.round(recordDurationM);
    const freeSpaceM = getFreeSpace(record, records, cursorPosM, maxDurationM, dropEffect);
    const freeSpaceDurationM = freeSpaceM[1] - freeSpaceM[0];

    // shrink mode
    if (freeSpaceDurationM <= recordDurationM) return [freeSpaceM, true];

    // bind to free space
    let limitedPositionM: PositionM;
    if (recordStartM <= freeSpaceM[0]) {
        limitedPositionM = [freeSpaceM[0], freeSpaceM[0]+recordDurationM];
    } else if (recordStartM + recordDurationM >= freeSpaceM[1]) {
        limitedPositionM = [freeSpaceM[1] - recordDurationM, freeSpaceM[1]];
    }
    if (limitedPositionM) {
        const canMove = canMoveRecord(record, records, limitedPositionM[0], limitedPositionM[1], dropEffect);
        return [limitedPositionM, canMove];
    }

    // free move mode
    if (!bindToGrid) {
        const recordEndM = recordStartM + recordDurationM;
        const canMove = canMoveRecord(record, records, recordStartM, recordEndM, dropEffect);
        return [[recordStartM, recordEndM], canMove];
    }
    // snap to grid

    const leftGridPosM = getGridPosition(recordStartM, grid, freeSpaceM);
    const rightGridPosM = getGridPosition(recordStartM + recordDurationM, grid, freeSpaceM);
    const leftDif = Math.abs(recordStartM - leftGridPosM);
    const rightDif = Math.abs(recordStartM + recordDurationM - rightGridPosM);
    let gridPositionM: PositionM;

    // check if grid is over free space
    if (leftDif <= rightDif) gridPositionM = [leftGridPosM, leftGridPosM+recordDurationM];
    else gridPositionM = [rightGridPosM-recordDurationM, rightGridPosM];

    if (gridPositionM[0] <= freeSpaceM[0]) gridPositionM = [freeSpaceM[0], freeSpaceM[0]+recordDurationM];
    else if (gridPositionM[1] >= freeSpaceM[1]) gridPositionM = [freeSpaceM[1] - recordDurationM, freeSpaceM[1]];

    const canMove = canMoveRecord(record, records, gridPositionM[0], gridPositionM[1], dropEffect);
    return [gridPositionM, canMove];
}

function getGridPosition(
    positionM: number,
    grid: number,
    freeSpace: PositionM,
): number {
    const step = TIMELINE_LCM / grid;
    const stepsLeft = (positionM / step)|0;
    let gridLeftM = Math.max(stepsLeft * step, freeSpace[0]);
    let gridRightM = Math.min((stepsLeft+1) * step, freeSpace[1]);
    return (positionM - gridLeftM > gridRightM - positionM) ? gridRightM : gridLeftM;
}

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

function getFreeSpace(
    record: PlixTimeEffectRecordJsonData,
    records: PlixTimeEffectRecordJsonData[],
    timeM: number,
    maxDurationM: number,
    effect: "copy"|"move"|"link"|"none"
): PositionM {
    let leftEl: PlixTimeEffectRecordJsonData;
    let rightEl: PlixTimeEffectRecordJsonData;
    for (let i = 0; i < records.length; i++){
        let rec = records[i];
        if (effect === "move" && rec === record) continue;
        const [,,recStartM, recEndM] = rec;
        if (recStartM >= timeM) {
            rightEl = rec;
            break;
        }
        if (recEndM <= timeM) leftEl = rec;
    }
    if (leftEl && rightEl) return [leftEl[3], rightEl[2]];
    if (leftEl) return [leftEl[3], maxDurationM];
    if (rightEl) return [0, rightEl[2]];
    return [0, maxDurationM];
}