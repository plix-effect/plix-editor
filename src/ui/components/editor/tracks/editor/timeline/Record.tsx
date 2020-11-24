import React, {DragEvent, FC, memo, useCallback, useContext, useMemo, MouseEvent, useRef} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss";
import {DragContext} from "../../../DragContext";
import {DeleteAction, DeleteValueAction, EditValueAction} from "../../../PlixEditorReducerActions";
import {EditorPath} from "../../../../../types/Editor";
import {generateColorByText} from "../../../../../utils/generateColorByText";
import {TrackContext} from "../../../TrackContext";
import cn from "classnames";

export interface RecordProps {
    record: PlixTimeEffectRecordJsonData,
    path: EditorPath,
}
export const Record: FC<RecordProps> = memo(({path, record, record: [enabled, link, start, recordDuration]}) => {
    const {duration} = useContext(ScaleDisplayContext);
    const dragRef = useContext(DragContext);
    const {dispatch} = useContext(TrackContext);
    const recordRef = useRef<HTMLDivElement>()

    const onDragStartName = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            effect: [true, null, link, []],
            recordMove: {
                record: record,
                deleteAction: DeleteAction(path)
            },
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'all';
        recordRef.current.classList.add("_edit");
    }, [record, path]);

    const onDragName = useCallback((event: DragEvent<HTMLDivElement>) => {
        recordRef.current.classList.toggle("_move", !event.ctrlKey);
    }, [record, path]);

    const onClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        if (event.altKey) {
            return dispatch(DeleteValueAction(path.slice(0, -1), record));
        }
        if (event.ctrlKey) {
            return dispatch(EditValueAction([...path, 0], !enabled));
        }
    }, [path, record]);

    const onDragStartLeft = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordScale: {record: record, side: "left"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        recordRef.current.classList.add("_edit", "_move");
    }, [record]);

    const onDragStartRight = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordScale: {record: record, side: "right"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        recordRef.current.classList.add("_edit", "_move");
    }, [record]);

    const onDragEndAll = useCallback((event: DragEvent<HTMLDivElement>) => {
        recordRef.current.classList.remove("_edit", "_move");
    }, [record]);

    return useMemo(() => {
        const startD = start / duration;
        const durD = recordDuration / duration;
        return (
            <div
                className={cn("timeline-record")}
                style={{
                    left: `${startD * 100}%`,
                    width: `${durD * 100}%`,
                }}
                ref={recordRef}
                onClick={onClick}
                title={createTitleRecord(record)}
            >
                <div
                    onDragStart={onDragStartName}
                    onDrag={onDragName}
                    onDragEnd={onDragEndAll}
                    className={cn("timeline-record-name", {"_disabled": !enabled})}
                    draggable
                    style={{backgroundColor: generateColorByText(link, enabled ? 1 : 0.2, 0.3, enabled ? 1 : 0.5)}}
                >{link}</div>
                <div
                    className="timeline-record-scaling _left"
                    draggable
                    onDragStart={onDragStartLeft}
                    onDragEnd={onDragEndAll}
                    title={createTitleResize(record, "left")}
                />
                <div
                    className="timeline-record-scaling _right"
                    draggable
                    onDragStart={onDragStartRight}
                    onDragEnd={onDragEndAll}
                    title={createTitleResize(record, "right")}
                />

            </div>
        );

    }, [duration, start, link, recordDuration, enabled, onDragStartRight, onDragStartLeft]);
});

const createTitleRecord = (record: PlixTimeEffectRecordJsonData) =>
    `${record[1]}\n\n` +
    "[Alt + Click] = delete\n" +
    `[Ctrl + Click] = ${record[0] ? 'disable' : 'enable'}\n` +
    "[Drag] = move to new position\n" +
    "[Shift + Drag] = don't snap on grid\n" +
    "[Ctrl + Drag] = copy\n"
;

const createTitleResize = (record: PlixTimeEffectRecordJsonData, pos) =>
    `start = ${Math.round(record[2])}ms\n` +
    `duration = ${Math.round(record[3])}ms\n\n` +
    "[Drag] = resize\n" +
    "[Shift + Drag] = don't snap on grid\n"
;