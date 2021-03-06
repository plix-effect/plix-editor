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
import {useSelectionControl, useSelectionPath} from "../../../SelectionContext";
import {TIMELINE_LCM} from "@plix-effect/core";

export interface RecordProps {
    record: PlixTimeEffectRecordJsonData,
    path: EditorPath,
    bpm: number,
    offset: number,
    captured: boolean,
}
export const Record: FC<RecordProps> = memo(({path, bpm, offset, record, record: [enabled, link, startM, endM], captured}) => {
    const {duration} = useContext(ScaleDisplayContext) ?? {duration: 1};
    const dragRef = useContext(DragContext);
    const {dispatch} = useContext(TrackContext) || {};
    const recordRef = useRef<HTMLDivElement>();
    const cycle = 60000 / bpm;
    const start = offset + startM * cycle / TIMELINE_LCM;
    const recordDuration = (endM - startM) * cycle / TIMELINE_LCM;

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const selectionPath = useSelectionPath();

    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath, path]);

    const onDragStartName = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            effect: [true, null, link, []],
            typedValue: {type: "effect", value: [true, null, link, []]},
            effectLink: [true, null, link, []],
            recordsMove: {
                records: [record],
                bpm,
                offset
            },
            deleteAction: DeleteAction(path),
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'all';
        recordRef.current.classList.add("_drag");
    }, [record, path]);

    const onDragName = useCallback(() => {
        const dropEffect = dragRef.current?.dropEffect
        recordRef.current.classList.remove("_move", "_copy", "_link", "_none");
        if (dropEffect) recordRef.current.classList.add(`_${dropEffect}`);
    }, [record, path]);

    const onClick = useCallback(({ctrlKey, altKey, shiftKey}: MouseEvent<HTMLDivElement>) => {
        if (!dispatch) return;
        if (!ctrlKey && altKey && !shiftKey) {
            return dispatch(DeleteValueAction(path.slice(0, -1), record));
        }
        if (ctrlKey && !altKey && !shiftKey) {
            return dispatch(EditValueAction([...path, 0], !enabled));
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path)
        if (ctrlKey && !altKey && shiftKey) {
            return toggleSelect(path);
        }
    }, [path, record, select, toggleSelect]);

    const onDragStartLeft = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordsScale: {records: [record], side: "left"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        recordRef.current.classList.add("_drag", "_move");
    }, [record]);

    const onDragStartRight = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordsScale: {records: [record], side: "right"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        recordRef.current.classList.add("_drag", "_move");
    }, [record]);

    const onDragEndAll = useCallback((event: DragEvent<HTMLDivElement>) => {
        recordRef.current.classList.remove("_drag", "_move", "_copy", "_link", "_none");
    }, [record]);

    return useMemo(() => {
        const startD = start / duration;
        const durD = recordDuration / duration;
        return (
            <div
                className={cn("timeline-record", {"_selected": selected, "_captured": captured})}
                style={{
                    left: `${startD * 100}%`,
                    width: `${durD * 100}%`,
                }}
                ref={recordRef}
                onClick={onClick}
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
                />
                <div
                    className="timeline-record-scaling _right"
                    draggable
                    onDragStart={onDragStartRight}
                    onDragEnd={onDragEndAll}
                />

            </div>
        );

    }, [duration, start, link, recordDuration, enabled, onDragStartRight, onDragStartLeft, selected, captured]);
});