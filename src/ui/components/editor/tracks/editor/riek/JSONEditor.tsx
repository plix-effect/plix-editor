import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import {RIEInput} from 'riek'
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
        <RIEInput
            propName='json'
            value={JSON.stringify(value)}
            change={onValueChange}
            className={"riek-editor"}
        />
    )
}