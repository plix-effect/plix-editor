import React, {FC, useCallback, useState} from "react";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "../../../../preview/canvas/preview-field/PlixCanvasField";
import {PreviewFieldEditorModal} from "./PreviewFieldEditorModal";

interface PreviewFieldEditorProps {
    onChange: (PreviewFieldConfig) => void;
    value: PreviewFieldConfig|null
}


export const PreviewFieldEditor: FC = () => {

    const [open, setOpen] = useState(false);
    const onClose = useCallback((value: PreviewFieldConfig|null) => {
        setOpen(false);
        // ToDo onChange value
    }, [setOpen])
    const openModal = useCallback(() => {
        setOpen(true);
    }, [setOpen])

    return (
        <React.Fragment>
            <button className={"btn btn-sm btn-light"} onClick={openModal}>Edit / View PreviewField</button>
            <PreviewFieldEditorModal close={onClose} isOpen={open} value={DEFAULT_PREVIEW_FIELD_CONFIG}/>
        </React.Fragment>
    )
}