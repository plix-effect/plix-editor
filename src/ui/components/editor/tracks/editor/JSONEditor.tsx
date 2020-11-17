import React, {ChangeEvent, ChangeEventHandler, FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {HSLAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import {colorToNumber, numberToColor} from "@plix-effect/core/color";
import "../../track-elements/ColorView.scss";

export interface JSONEditorProps {
    value: any,
    onChange: (value: any) => void
}
export const JSONEditor: FC<JSONEditorProps> = ({value, onChange}) => {

    const [editMode, setEditMode] = useState(false);
    const [inputValue, setInputValue] = useState(() => {
        return JSON.stringify(value);
    });
    const inputRef = useRef<HTMLInputElement>();

    const changeEdit = useCallback(() => setEditMode(v => !v), [setEditMode]);

    const onChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, [setInputValue]);

    const onSubmit = useCallback((event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const newValue = JSON.parse(inputValue);
            onChange(newValue);
            setEditMode(false);
        } catch {}
    }, [setInputValue, inputValue]);

    useEffect(() => {
        setEditMode(false);
        setInputValue(JSON.stringify(value));
    }, [value])

    if (editMode) return (
        <form onSubmit={onSubmit}>
            <input type="submit" value="OK"/>
            <input ref={inputRef} value={inputValue} autoFocus={true} onChange={onChangeInput}/>
        </form>
    );

    return (<>
        <input type="button" value="EDIT" onClick={changeEdit} />
        {JSON.stringify(value)}
    </>);
}