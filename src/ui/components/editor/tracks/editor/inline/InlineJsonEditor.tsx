import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";
import Editable from 'react-x-editable';
import "./InlineInputEditor.scss"
import {useClickOutside} from "../../../../../use/useClickOutside";

export interface InlineJsonEditorEditorProps {
    value: any,
    onChange: (value: any) => void
    inputType?: string
}
export const InlineJsonEditor: FC<InlineJsonEditorEditorProps> = ({value, onChange, inputType= "text"}) => {

    const [editMode, setEditMode] = useState(false);
    const [inputValue, setInputValue] = useState(() => {
        return JSON.stringify(value);
    });
    const inputRef = useRef<HTMLInputElement>();
    const containerRef = useRef<HTMLFormElement>();

    const submit = useCallback(() => {
        try {
            const newValue = JSON.parse(inputValue);
            onChange(newValue);
            setEditMode(false);
        } catch {}
    }, [setEditMode, onChange, inputValue]);

    const onClickOutsideCb = useCallback(() => {
        submit();
    }, [submit]);
    useClickOutside(containerRef, onClickOutsideCb, editMode)

    const changeEdit = useCallback(() => setEditMode(v => !v), [setEditMode]);

    const onChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, [setInputValue]);



    const onSubmit = useCallback((event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
    }, [submit]);

    useEffect(() => {
        setEditMode(false);
        setInputValue(JSON.stringify(value));
    }, [value])

    const onKeyPress = (event) => {
        if(event.key === 'Enter'){
            changeEdit()
        }
    }

    const content = editMode ?
        (
            <input
                className={"form-control-xs"}
                ref={inputRef}
                value={inputValue}
                autoFocus={true}
                type={inputType}
                onChange={onChangeInput}
            />
        )
        :
        (
            <span onClick={changeEdit}>{JSON.stringify(value)}</span>
        )
    ;


    return (
        <form ref={containerRef} className={"inline-input-editor"} onSubmit={onSubmit}>
            {content}
        </form>
    );
}