import React, {FC, useCallback, useState} from "react";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "../../../../preview/canvas/dynamic/preview-field/PlixCanvasField";
import {PreviewFieldEditorModal} from "./PreviewFieldEditorModal";

interface PreviewFieldEditorProps {
    onChange: (PreviewFieldConfig) => void;
    value: PreviewFieldConfig|null
}


export const PreviewFieldEditor: FC<PreviewFieldEditorProps> = ({onChange, value}) => {

    const [open, setOpen] = useState(false);
    const onClose = useCallback((value: PreviewFieldConfig|null) => {
        setOpen(false);
        onChange(value);
    }, [setOpen])
    const openModal = useCallback(() => {
        setOpen(true);
    }, [setOpen])

    return (
        <React.Fragment>
            <button className={"btn btn-sm btn-light"} onClick={openModal}>Edit / View PreviewField</button>
            <PreviewFieldEditorModal close={onClose} isOpen={open} value={value ?? DEFAULT_PREVIEW_FIELD_CONFIG}/>
        </React.Fragment>
    )
}