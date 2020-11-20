import React, {DragEventHandler, FC, memo, useCallback, useContext, useMemo} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss";
import {DragContext} from "../../../DragContext";
import {DeleteValueAction} from "../../../PlixEditorReducerActions";
import {EditorPath} from "../../../../../types/Editor";

export interface RecordProps {
    record: PlixTimeEffectRecordJsonData,
    path: EditorPath,
}
export const Record: FC<RecordProps> = memo(({path, record, record: [enabled, link, start, recordDuration]}) => {
    const {duration} = useContext(ScaleDisplayContext);
    const dragRef = useContext(DragContext);

    const onDragStartName: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            effect: [true, null, link, []],
            recordMove: {
                record: record,
                deleteAction: DeleteValueAction(path.slice(0, -1), record)
            },
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        event.dataTransfer.effectAllowed = 'all';
    }, [record, path]);

    const onDragEndName: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        if (event.dataTransfer.dropEffect === "copy") {
            console.log("delete current record", event.dataTransfer.dropEffect);
        }
    }, [record]);

    const onDragStartLeft: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            recordScale: {record: record, side: "left"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
    }, [record]);

    const onDragStartRight: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            recordScale: {record: record, side: "right"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
    }, [record]);

    return useMemo(() => {
        const startD = start / duration;
        const durD = recordDuration / duration;
        return (
            <div
                className="timeline-record"
                style={{
                    left: `${startD * 100}%`,
                    width: `${durD * 100}%`,
                }}
            >
                <div
                    onDragStart={onDragStartName} onDragEnd={onDragEndName}
                    className="timeline-record-name"
                    draggable
                    style={{backgroundColor: generateColorByText(link)}}
                >{link}</div>
                <div className="timeline-record-scaling _left" draggable onDragStart={onDragStartLeft}/>
                <div className="timeline-record-scaling _right" draggable onDragStart={onDragStartRight} />

            </div>
        );

    }, [duration, start, link, recordDuration, enabled, onDragStartRight, onDragStartLeft, onDragEndName]);
});

function generateColorByText(value: string){
    let v = 0;
    for (let i = 0; i < value.length; i++) {
        v = v += value.charCodeAt(i);
    }
    return `hsl(${v%360},100%,40%)`;
}