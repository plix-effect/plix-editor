import React, {FC, Fragment, memo, useMemo} from "react";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import "./Record.scss"
import {Record} from "./Record";
import {EditorPath} from "../../../../../types/Editor";
import {getArrayKey} from "../../../../../utils/KeyManager";

export interface RecordsProps {
    records: PlixTimeEffectRecordJsonData[],
    bpm: number,
    path: EditorPath,
    offset: number,
}
export const Records: FC<RecordsProps> = memo(({records, path, bpm, offset}) => {

    return useMemo(() => {
        return (
            <Fragment>
                {records.map((record, i) => {
                    const key = getArrayKey(records, i);
                    const valPath: EditorPath = [...path, {key: String(key)}]
                    return (
                        <Record record={record} key={key} path={valPath} bpm={bpm} offset={offset} />
                    );
                })}
            </Fragment>
        );

    }, [records, path, bpm, offset]);
})