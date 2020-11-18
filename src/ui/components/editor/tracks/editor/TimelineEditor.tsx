import React, {FC, useContext} from "react";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";

export interface TimelineEditorProps {
    onChange: (value: any) => void,
    records: PlixTimeEffectRecordJsonData[],
    cycle: number|null
    grid: number|null
    offset: number
}
export const TimelineEditor: FC<TimelineEditorProps> = ({records, onChange, cycle, grid, offset}) => {

    const {trackWidth} = useContext(ScaleDisplayContext);

    return (
        <div className="timeline-editor" style={{width: trackWidth}}>
            <div className="timeline-editor-grid">
                {cycle !== null && <TimelineEditorGrid offset={offset} grid={grid ?? 1} cycle={cycle} />}
            </div>
            <div className="timeline-editor-records">
                <Records records={records} />
            </div>
        </div>
    );
}