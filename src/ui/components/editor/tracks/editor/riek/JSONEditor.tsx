import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import Editable from 'react-x-editable';
import "./riek.scss"

export interface JSONEditorProps {
    value: any,
    onChange: (value: any) => void
}
export const JSONEditor: FC<JSONEditorProps> = ({value, onChange}) => {

    const onValueChange = useCallback((obj) => {
        const newValue = JSON.parse(obj.json);
        onChange(newValue);
    },[onChange])

    return (
        <Editable
            name="username"
            dataType="text"
            value={JSON.stringify(value)}
            handleSubmit={console.log}
        />
    )
}