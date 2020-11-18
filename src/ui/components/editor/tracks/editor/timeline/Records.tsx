import React, {FC, Fragment, memo, useContext, useMemo} from "react";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss"
import {Record} from "./Record";

export interface RecordsProps {
    records: PlixTimeEffectRecordJsonData[]
}
export const Records: FC<RecordsProps> = memo(({records}) => {

    return useMemo(() => {
        return (
            <Fragment>
                {records.map((record, i) => {
                    return (
                        <Record record={record} key={i} />
                    );
                })}
            </Fragment>
        );

    }, [records]);
})