import React, {FC, Fragment, memo, useMemo} from "react";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss"
import {Record} from "./Record";
import {EditorPath} from "../../../../../types/Editor";

export interface RecordsProps {
    records: PlixTimeEffectRecordJsonData[],
    path: EditorPath,
}
export const Records: FC<RecordsProps> = memo(({records, path}) => {

    return useMemo(() => {
        return (
            <Fragment>
                {records.map((record, i) => {
                    return (
                        <Record record={record} key={i} path={[...path, i]} />
                    );
                })}
            </Fragment>
        );

    }, [records]);
})