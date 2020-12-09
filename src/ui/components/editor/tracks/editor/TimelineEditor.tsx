import React, {FC, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import type {DragEvent} from "react";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";
import {DragContext, DragTypes} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {
    EditValueAction,
    InsertIndexAction,
    InsertValuesAction,
    MultiAction,
    PushValueAction
} from "../../PlixEditorReducerActions";
import {EditorPath} from "../../../../types/Editor";
import {generateColorByText} from "../../../../utils/generateColorByText";
import {TIMELINE_LCM} from "@plix-effect/core";
import {TimelineEditorRecordGroup} from "./timeline/TimelineEditorRecordGroup";
import {getArrayKey} from "../../../../utils/KeyManager";
import useLatestCallback from "../../../../use/useLatestCallback";

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

    const [recordsGroup, setRecordsGroup] = useState<PlixTimeEffectRecordJsonData[]|null>(null);
    const [newCaptureGroup, setNewCaptureGroup] = useState<PlixTimeEffectRecordJsonData[]|null>(null);

    useEffect(() => {
        setRecordsGroup(newCaptureGroup);
    }, [records]);

    useEffect(() => {
        if (newCaptureGroup) setRecordsGroup(newCaptureGroup);
        setNewCaptureGroup(null);
    }, [newCaptureGroup]);

    const dummyRef = useRef<HTMLDivElement>();
    const editorRef = useRef<HTMLDivElement>();

    const createInsertRecordsAction = useCallback((insertRecords: PlixTimeEffectRecordJsonData[]) => {
        const index = records.findIndex(rec => rec[3] > insertRecords[0][3]);
        if (index < 0) return InsertValuesAction(path, records.length, insertRecords);
        return InsertValuesAction(path, index, insertRecords);
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
        movingRecords: PlixTimeEffectRecordJsonData[],
        recordDurationM: number,
        targetAsLink: boolean,
    ) => {
        let dropEffect: "move"|"copy"|"link" = dragRef.current.deleteAction && !event.ctrlKey ? "move" : "copy"
        if (targetAsLink) dropEffect = "link";

        const [[startM, endM], canMove] = getMovingResult(movingRecords, cursorPosM, recordStartM, recordDurationM, !event.shiftKey, grid, records, durationM, dropEffect);
        const dummyStart = offset + startM * cycle / TIMELINE_LCM;
        const dummyDuration = (endM - startM) * cycle / TIMELINE_LCM;
        const dummyEnabled = movingRecords.length === 1 ? movingRecords[0][0] : true;
        const dummyName = movingRecords.length === 1 ? movingRecords[0][1] : null;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], canMove, dummyEnabled, dummyName);
        if (!canMove) return;
        return allowEventWithDropEffect(event, dropEffect, (event) => {
            event.dataTransfer.dropEffect = dropEffect;
            const movingStartM = movingRecords[0][2];
            const movingEndM = movingRecords[movingRecords.length - 1][3];
            const scalingSizeM = movingEndM - movingStartM;
            const sizeM = endM - startM;
            const scalingGain = sizeM / scalingSizeM;
            const newRecords: PlixTimeEffectRecordJsonData[] = movingRecords.map(record => {
                const recStartM = startM + (record[2]-movingStartM) * scalingGain;
                const recEndM = startM + (record[3]-movingStartM) * scalingGain;
                return [record[0], record[1], recStartM|0, recEndM|0];
            });
            const insertAction = createInsertRecordsAction(newRecords);
            if (dropEffect === "move" && dragRef.current.deleteAction) {
                dispatch(MultiAction([insertAction, dragRef.current.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(insertAction);
            }
            if (newRecords.length > 1) setNewCaptureGroup(newRecords);
        });
    }, [dragRef, cycle, grid, offset, records, durationM]);

    const onMultiSelect = useCallback((
        event: DragEvent<HTMLDivElement>,
        indexFrom: number,
        indexTo: number,
    ) => {
        const startM = records[indexFrom][2];
        const endM = records[indexTo][3];
        const dummyStart = offset + startM * cycle / TIMELINE_LCM;
        const dummyDuration = (endM - startM) * cycle / TIMELINE_LCM;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], true, false, "", true);
        return allowEventWithDropEffect(event, "link", (event) => {
            const selectedRecords = [];
            for (let i=indexFrom; i<=indexTo; i++) selectedRecords.push(records[i]);
            setRecordsGroup(selectedRecords);
        });
    }, [dragRef, cycle, grid, offset, records, durationM]);

    const onRecordScale = useCallback((
        event: DragEvent<HTMLDivElement>,
        {records: scalingRecords, side}: DragTypes['recordsScale'],
        cursorPosM: number,
    ) => {
        if (!scalingRecords.every(record => records.includes(record))) return;
        const [[startM, endM], canMove] = getScalingResult(scalingRecords, records, side, cursorPosM, durationM, !event.shiftKey, grid);
        const dummyStart = offset + startM * cycle / TIMELINE_LCM;
        const dummyDuration = (endM - startM) * cycle / TIMELINE_LCM;
        const dummyEnabled = scalingRecords.length === 1 ? scalingRecords[0][0] : true;
        const dummyName = scalingRecords.length === 1 ? scalingRecords[0][1] : null;
        setDummyPosition(dummyRef.current, duration, [dummyStart, dummyDuration], canMove, dummyEnabled, dummyName);
        if (!canMove) return;
        return allowEventWithDropEffect(event, "move", (event) => {
            event.dataTransfer.dropEffect = "move";
            const scalingStartM = scalingRecords[0][2];
            const scalingEndM = scalingRecords[scalingRecords.length - 1][3];
            const scalingSizeM = scalingEndM - scalingStartM;
            const sizeM = endM - startM;
            const scalingGain = sizeM / scalingSizeM;
            const newRecords: PlixTimeEffectRecordJsonData[] = scalingRecords.map(record => {
                const recStartM = startM + (record[2]-scalingStartM) * scalingGain;
                const recEndM = startM + (record[3]-scalingStartM) * scalingGain;
                return [record[0], record[1], recStartM|0, recEndM|0];
            });
            const editActions = newRecords.map((newRecord, i) => {
                const record = scalingRecords[i];
                const key = getArrayKey(records, records.indexOf(record))
                return EditValueAction([...path, {key}], newRecord);
            });
            dispatch(editActions.length === 1 ? editActions[0] : MultiAction(editActions));
            if (newRecords.length > 1) setNewCaptureGroup(newRecords);
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
        if (!dragRef.current) return clearDummy(dummyRef.current);
        dragRef.current.dropEffect = event.dataTransfer.dropEffect = "none";
        const editorRect = editorRef.current.getBoundingClientRect();

        let dragRecords: PlixTimeEffectRecordJsonData[];
        let recordStartM: number;
        let recordBpm: number;
        let targetAsLink: boolean;
        const cursorPosTime = (event.clientX - editorRect.left) / zoom;
        const cursorPosM = (cursorPosTime - offset) / cycle * TIMELINE_LCM;
        const recordsMove = dragRef.current.recordsMove;
        const effectLink = dragRef.current.effectLink;
        const effect = dragRef.current.effect;
        if (recordsMove) {
            dragRecords = recordsMove.records;
            const eventPosTime = (event.clientX - editorRect.left - dragRef.current.offsetX) / zoom;
            recordStartM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
            recordBpm = recordsMove.bpm;
            targetAsLink = false;
        } else if (effectLink || effect) {
            const recordDuration = TIMELINE_LCM; // todo: calculate best record duration
            if (effectLink) {
                dragRecords = [[true, effectLink[2], 0, recordDuration]];
                targetAsLink = true;
            } else {
                if (effect && effect[1] === null && (effect[3] ?? []).length === 0) {
                    dragRecords = [[true, String(effect[2]), 0, recordDuration]];
                }
            }
            const shiftTime = cycle * recordDuration / TIMELINE_LCM / 2; // drag center of element
            const eventPosTime =  (event.clientX - editorRect.left) / zoom - shiftTime;
            recordStartM = (eventPosTime - offset) / cycle * TIMELINE_LCM;
            recordBpm = bpm;
        }

        if (dragRecords) {
            // check collision with mouse position
            const [collisionIndex, collisionRecord] = getCollisionRecord(dragRecords, records, cursorPosM);

            const firstDragRecord = dragRecords[0];
            if (event.altKey && dragRecords.length === 1) { // multi-select
                const selfIndex = records.indexOf(firstDragRecord);
                if (selfIndex === -1 || collisionIndex === -1) return clearDummy(dummyRef.current);
                return onMultiSelect(event, Math.min(selfIndex, collisionIndex), Math.max(selfIndex, collisionIndex));
            }

            if (collisionRecord) {
                if (dragRecords.length > 1) return;
                const recordsIsSame = collisionRecord[0] === firstDragRecord[0] && collisionRecord[1] === firstDragRecord[1]
                if (!recordsIsSame) return onRecordReplace(event, firstDragRecord, collisionIndex, collisionRecord, targetAsLink);
            }

            // move record to new position
            const startM = dragRecords[0][2]
            const endM = dragRecords[dragRecords.length-1][3]
            const recordDurationM = (endM - startM) * (bpm / recordBpm);
            return onRecordMove(event, cursorPosM, recordStartM, dragRecords, recordDurationM, targetAsLink);
        }
        const recordsScale = dragRef.current.recordsScale;
        if (recordsScale) {
            return onRecordScale(event, recordsScale, cursorPosM);
        }

    }, [zoom, duration, cycle, grid, offset, records, createInsertRecordsAction, onRecordMove, onRecordScale, onRecordReplace]);

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

                <TimelineEditorRecordGroup recordsGroup={recordsGroup} records={records} path={path} offset={offset} bpm={bpm} grid={grid} repeatStart={repeatStart} repeatEnd={repeatEnd} setRecordsGroup={setRecordsGroup}>
                    <div className="timeline-editor-dummy" ref={dummyRef}>
                        <div className="timeline-record-name --dummy-record"/>
                    </div>
                    <div className="timeline-editor-grid">
                        <TimelineEditorGrid offset={offset} grid={grid ?? 1} bpm={bpm} repeatStart={repeatStart}  repeatEnd={repeatEnd} />
                    </div>
                    <div className="timeline-editor-records">
                        <Records records={records} path={path} bpm={bpm} offset={offset} capturedRecords={recordsGroup}/>
                    </div>
                </TimelineEditorRecordGroup>
            </div>
        </div>
    );
}

function getScalingResult(
    scalingRecords: PlixTimeEffectRecordJsonData[],
    records: PlixTimeEffectRecordJsonData[],
    side: "left"|"right",
    cursorPosM: number,
    maxDurationM: number,
    bindToGrid: boolean,
    grid: number|null,
): [position: [startBeat: number, endBeat: number], available: boolean]{
    cursorPosM = Math.round(cursorPosM);
    const scalingStartM = scalingRecords[0][2];
    const scalingEndM = scalingRecords[scalingRecords.length-1][3];
    const moveFromM = (side === "left") ? scalingStartM : scalingEndM
    const freeSpaceM = getFreeSpace(scalingRecords, records, moveFromM, maxDurationM, "move");
    if (side === "right") freeSpaceM[0] = scalingStartM;
    else freeSpaceM[1] = scalingEndM;

    let targetPosM = cursorPosM;
    if (bindToGrid) targetPosM = getGridPosition(cursorPosM, grid, freeSpaceM);

    const newRecordPosM: PositionM = [scalingStartM, scalingEndM];
    if (side === "right") newRecordPosM[1] = Math.min(targetPosM, freeSpaceM[1]);
    if (side === "left") newRecordPosM[0] = Math.max(targetPosM, freeSpaceM[0]);

    const canMove = canMoveRecord(scalingRecords, records, newRecordPosM[0], newRecordPosM[1], "move")
    return [newRecordPosM, canMove];
}

function getMovingResult(
    movingRecords: PlixTimeEffectRecordJsonData[],
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
    const freeSpaceM = getFreeSpace(movingRecords, records, cursorPosM, maxDurationM, dropEffect);
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
        const canMove = canMoveRecord(movingRecords, records, limitedPositionM[0], limitedPositionM[1], dropEffect);
        return [limitedPositionM, canMove];
    }

    // free move mode
    if (!bindToGrid) {
        const recordEndM = recordStartM + recordDurationM;
        const canMove = canMoveRecord(movingRecords, records, recordStartM, recordEndM, dropEffect);
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

    const canMove = canMoveRecord(movingRecords, records, gridPositionM[0], gridPositionM[1], dropEffect);
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
        const bgColor = name == null ? "" : generateColorByText(name, enabled ? 1 : 0.2, 0.3, enabled ? 1 : 0.5);
        dummyRecord.classList.toggle("_disabled", !enabled);
        dummyRecord.style.backgroundColor = bgColor;
    }

}

function canMoveRecord(
    ignoreRecords: PlixTimeEffectRecordJsonData[],
    records: PlixTimeEffectRecordJsonData[],
    startM: number,
    endM: number,
    effect: "move"|"copy"|"link"|"none",
) {
    for (const rec of records) {
        if (effect === "move" && ignoreRecords.includes(rec)) continue;
        const [,,recStartM, recEndM] = rec;
        if (endM <= recStartM) continue;
        if (startM >= recEndM) continue;
        return false;
    }
    return true;
}

function getCollisionRecord(
    ignoreRecords: PlixTimeEffectRecordJsonData[],
    records: PlixTimeEffectRecordJsonData[],
    timeM: number,
): [number, PlixTimeEffectRecordJsonData|null] {
    for (let i = 0; i < records.length; i++){
        let rec = records[i];
        if (ignoreRecords.includes(rec)) continue;
        const [,,recStartM, recEndM] = rec;
        if (timeM >= recEndM) continue;
        if (timeM <= recStartM) return [-1, null];
        return [i, rec];
    }
    return [-1, null];
}

function getFreeSpace(
    ignoreRecords: PlixTimeEffectRecordJsonData[],
    records: PlixTimeEffectRecordJsonData[],
    timeM: number,
    maxDurationM: number,
    effect: "copy"|"move"|"link"|"none"
): PositionM {
    let leftEl: PlixTimeEffectRecordJsonData;
    let rightEl: PlixTimeEffectRecordJsonData;
    for (let i = 0; i < records.length; i++){
        let rec = records[i];
        if (effect === "move" && ignoreRecords.includes(rec)) continue;
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