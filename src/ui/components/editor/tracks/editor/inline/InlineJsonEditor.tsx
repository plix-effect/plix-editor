import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import {useInlineEditableContainer} from "../../../../../use/useInlineEditableContainer";

export interface InlineJsonEditorEditorProps {
    value: any,
    onChange: (value: any) => void
    inputType: "text"|"number"
}
export const InlineJsonEditor: FC<InlineJsonEditorEditorProps> = ({value, onChange, inputType="text"}) => {
    const [inputValue, setInputValue] = useState(() => {
        return JSON.stringify(value);
    });
    const inputRef = useRef<HTMLInputElement>();

    const submit = useCallback(() => {
        try {
            const newValue = JSON.parse(inputValue);
            onChange(newValue);
        } catch {}
    }, [onChange, inputValue]);

    const formRef = useRef<HTMLFormElement>();
    const onClickOutsideCb = useCallback(() => {
        submit()
    },[submit])
    const [editMode, setEditMode, toggleEditMode] = useInlineEditableContainer(formRef,false, onClickOutsideCb)

    const onChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, [setInputValue]);

    const onSubmitForm = useCallback((event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
        setEditMode(false);
    }, [submit]);

    useEffect(() => {
        setInputValue(JSON.stringify(value));
    }, [value])

    return (
        <form ref={formRef} onSubmit={onSubmitForm} className={"inline-input-editor"}>
            {
                editMode ?
                    (
                        <input
                            className={"form-control"}
                            ref={inputRef}
                            value={inputValue}
                            autoFocus={true}
                            type={inputType}
                            onChange={onChangeInput}
                        />
                    )
                :
                    (
                        <span className={"inline-editor-span"} onClick={toggleEditMode}>{JSON.stringify(value)}</span>
                    )
            }
        </form>
    );
}