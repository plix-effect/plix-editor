import React, {FC, memo, useContext, useMemo} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss";

export interface RecordProps {
    record: PlixTimeEffectRecordJsonData
}
export const Record: FC<RecordProps> = memo(({record: [enabled, link, start, recordDuration]}) => {
    const {duration} = useContext(ScaleDisplayContext);

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
                <div className="timeline-record-scaling _left" draggable />
                <div className="timeline-record-scaling _right" draggable />
                <div
                    className="timeline-record-name"
                    draggable
                    style={{backgroundColor: generateColorByText(link)}}
                >{link}</div>
            </div>
        );

    }, [duration, start, link, recordDuration, enabled]);
});

function generateColorByText(value: string){
    let v = 0;
    for (let i = 0; i < value.length; i++) {
        v = v += value.charCodeAt(i);
    }
    return `hsl(${v%360},100%,40%)`;
}