import React, {FC, useCallback, useMemo} from "react";
import "./InlineEditor.scss"
import {InlineInputEditor} from "./InlineInputEditor";

export interface InlineJsonEditorProps {
    value: any,
    onChange: (value: any) => void
}
export const InlineJsonEditor: FC<InlineJsonEditorProps> = ({value, onChange}) => {
    const stringVal = useMemo(() => {
        return JSON.stringify(value);
    },[value]);

    const onChangeValue = useCallback((newVal) => {
        const newJson = JSON.parse(newVal);
        onChange(newJson)
    }, [onChange])

    return (
        <InlineInputEditor value={stringVal} onChange={onChangeValue}/>
    )
}