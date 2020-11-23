import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import {ValueableRefType} from "./InlineEditor";

export interface InlineJsonEditorEditorProps {
    value: any,
    onSubmit: (value: any) => void
    inputType: "text"|"number",
    valuaebleRef: MutableRefObject<ValueableRefType>
}
export const InlineJsonEditor: FC<InlineJsonEditorEditorProps> = ({value, onSubmit, inputType="text", valuaebleRef}) => {
    const [inputValue, setInputValue] = useState(() => {
        return JSON.stringify(value);
    });
    const inputRef = useRef<HTMLInputElement>();

    const onChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, [setInputValue]);

    const submitForm = useCallback(() => {
        try {
            const newValue = JSON.parse(inputValue);
            onSubmit(newValue);
        } catch {}
    }, [onSubmit, inputValue]);


    const onSubmitForm = useCallback((event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitForm();
    }, [submitForm]);

    useEffect(() => {
        setInputValue(JSON.stringify(value));
    }, [value])

    useEffect(() => {
        valuaebleRef.current = {
            value: JSON.parse(inputValue)
        }
    }, [inputValue])

    return (
        <form onSubmit={onSubmitForm} className={"inline-input-editor"}>
            <input
                className={"form-control"}
                ref={inputRef}
                value={inputValue}
                autoFocus={true}
                type={inputType}
                onChange={onChangeInput}
            />
        </form>
    );
}