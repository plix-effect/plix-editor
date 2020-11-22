import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import Editable from 'react-x-editable';
import "./InlineInputEditor.scss"

export interface JSONEditorProps {
    value: any,
    onChange: (value: any) => void
}
export const NumberEditor: FC<JSONEditorProps> = ({value, onChange}) => {

    const onValueChange = useCallback((obj) => {
        const newValue = JSON.parse(obj.json);
        onChange(newValue);
    },[onChange])

    return (
        <Editable
            name="number"
            dataType="text"
            showButtons={false}
            value={JSON.stringify(value)}
            handleSubmit={console.log}
            bsInputClass={"inline-editor"}
        />
    )
}