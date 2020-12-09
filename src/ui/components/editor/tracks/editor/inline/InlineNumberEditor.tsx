import React, {FC, useCallback} from "react";
import "./InlineEditor.scss"
import {InlineInputEditor} from "./InlineInputEditor";

export interface InlineNumberEditorProps {
    value: any,
    onChange: (value: any) => void
    step?: number|"any"
    min?: number
}
export const InlineNumberEditor: FC<InlineNumberEditorProps> = ({value, onChange, step="any", min}) => {

    const onChangeAsNumber = useCallback((value) => {
        const numberValue = value !== undefined ? Number(value) : undefined;
        return onChange(numberValue)
    }, [onChange])

    return (
        <InlineInputEditor value={value} onChange={onChangeAsNumber} inputParams={{type: "number", step: step, min: min}}/>
    )
}