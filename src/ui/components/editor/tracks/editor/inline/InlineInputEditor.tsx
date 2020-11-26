import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import {useInlineEditableContainer} from "../../../../../use/useInlineEditableContainer";

export interface InlineInputEditorProps {
    value: any,
    onChange: (value: any) => void
    inputParams?: React.InputHTMLAttributes<HTMLInputElement>
}
export const InlineInputEditor: FC<InlineInputEditorProps> = ({value, onChange, inputParams={}}) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>();

    const submit = useCallback(() => {
        try {
            onChange(inputValue);
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
        setInputValue(value);
    }, [value])

    return (
        <form ref={formRef} onSubmit={onSubmitForm} className={"inline-input-editor"}>
            {
                editMode ?
                    (
                        <input
                            {...inputParams}
                            className={"form-control"}
                            ref={inputRef}
                            value={inputValue}
                            autoFocus={true}
                            onChange={onChangeInput}
                        />
                    )
                :
                    (
                        <span className={"inline-editor-span"} title={"Click to edit"} onClick={toggleEditMode}>{value}</span>
                    )
            }
        </form>
    );
}