import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import {RIENumber} from 'riek';
import "./riek.scss"

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
        <RIENumber
            propName='json'
            value={JSON.stringify(value)}
            change={onValueChange}
            className={"riek-editor"}
        />
    )
}