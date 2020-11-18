import React, {FC, Fragment, memo, useContext, useMemo} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Records.scss"

export interface RecordsProps {
    records: PlixTimeEffectRecordJsonData[]
}
export const Records: FC<RecordsProps> = memo(({records}) => {
    const {duration} = useContext(ScaleDisplayContext);


    return useMemo(() => {
        return (
            <Fragment>
                {records.map(([enabled, link, start, recordDuration], i) => {
                    const startD = start / duration;
                    const durD = recordDuration / duration;
                    return (
                        <div
                            key={i}
                            className="timeline-record"
                            style={{
                                left: `${startD * 100}%`,
                                width: `${durD * 100}%`,
                            }}
                        >
                            <div className="timeline-record-name">{link}</div>
                        </div>
                    );
                })}
            </Fragment>
        );

    }, [records, duration]);
})