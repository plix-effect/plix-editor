import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/dist/types/parser";

export interface TimelineEditorProps {
    effect: PlixEffectConfigurableJsonData,
    onChange: (value: any) => void
}
export const TimelineEditor: FC<TimelineEditorProps> = ({effect, onChange}) => {

    const [editMode, setEditMode] = useState(false);
    const [inputValue, setInputValue] = useState(() => {
        return JSON.stringify(effect);
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
        setInputValue(JSON.stringify(effect));
    }, [effect])

    if (editMode) return (
        <form onSubmit={onSubmit}>
            <input type="submit" value="OK"/>
            <input ref={inputRef} value={inputValue} autoFocus onChange={onChangeInput}/>
        </form>
    );

    return (<>
        <input type="button" value="EDIT" onClick={changeEdit} />
        {JSON.stringify(effect)}
    </>);
}