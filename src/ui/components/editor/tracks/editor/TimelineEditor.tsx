import React, {FC, useCallback, useContext, useEffect, useRef} from "react";
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
    cycle: number|null
    grid: number|null
    offset: number
}
export const TimelineEditor: FC<TimelineEditorProps> = ({records, onChange, cycle, grid, offset}) => {

    const dragRef = useContext(DragContext);
    const dragCount = useRef(0);
    const {trackWidth, duration} = useContext(ScaleDisplayContext);

    const dummyRef = useRef<HTMLDivElement>()
    const editorRef = useRef<HTMLDivElement>()

    const onDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current++;
        if (dragRef.current?.record) {
            event.preventDefault();
        }
    }, []);

    const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current--;
        if (dragCount.current === 0) dummyRef.current.style.display = "none";
    }, []);

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        const record = dragRef.current?.record;
        if (record) {
            const editorRect = editorRef.current.getBoundingClientRect();
            event.dataTransfer.dropEffect = event.shiftKey ? "copy" : "move";
            const dummy = dummyRef.current;
            if (!dummy) return;
            const durD = record[3] / duration;

            dummy.style.display = "";
            dummy.style.width = `${durD*100}%`;
            const dragLeft = (event.clientX - editorRect.left - dragRef.current.offsetX);
            const dummyLeft = event.ctrlKey ? dragLeft : dragLeft + 25 - (dragLeft%50);
            dummy.style.left = `${dummyLeft}px`;
            event.preventDefault();
        }
    }, [duration]);

    const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragCount.current = 0;
        dummyRef.current.style.display = "none";
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
                <div className="timeline-editor-dummy" ref={dummyRef}>dummy</div>
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