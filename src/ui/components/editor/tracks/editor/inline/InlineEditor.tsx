import React, {ChangeEvent, FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState} from "react";
import "./InlineEditor.scss"
import {useClickOutside} from "../../../../../use/useClickOutside";
import {InlineJsonEditor} from "./InlineJsonEditor";
import {InlineEffectTypeEditor} from "./InlineEffectTypeEditor";

export type InlineEditorType =
    | "json"
    | "number"
    | "effectType"
;

export interface InlineEditorEditorProps {
    value: any,
    onChange: (value: any) => void,
    type: InlineEditorType
}

export interface ValueableRefType<T = any> {
    value: T
}

export const InlineEditor: FC<InlineEditorEditorProps> = ({value, onChange, type}) => {

    const [editMode, setEditMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>();
    const editorRef = useRef<ValueableRefType>();

    const submit = useCallback((value) => {
        try {
            onChange(value);
            setEditMode(false);
        } catch {}
    }, [setEditMode, onChange]);

    const onClickOutsideCb = useCallback(() => {
        editorRef.current && submit(editorRef.current.value);
    }, [submit]);
    useClickOutside(containerRef, onClickOutsideCb, editMode)

    const changeEdit = useCallback(() => setEditMode(v => !v), [setEditMode]);

    const editorContent = useMemo(() => {
        switch (type) {
            case "effectType":
                return <InlineEffectTypeEditor valuaebleRef={editorRef} onChange={submit} effect={value}/>
            case "number":
            case "json":
            default:
                return <InlineJsonEditor valuaebleRef={editorRef} inputType={type === "json" ? "text" : "number"} onSubmit={submit} value={value}/>
        }
    }, [type, value]);

    const viewContent = useMemo(() => {
        switch (type) {
            case "effectType":
                return <span onClick={changeEdit}>{value[1]}</span>
            case "number":
            case "json":
            default:
                return <span onClick={changeEdit}>{JSON.stringify(value)}</span>
        }
    }, [type, value]);

    const content = editMode ? editorContent : viewContent;

    return (
        <div ref={containerRef} className={"inline-editor-container"}>
            {content}
        </div>
    );
}