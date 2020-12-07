import React, {FC, useEffect, useState} from "react";
import {BSModal} from "../../../../modal/BSModal";
import {BSModalPart} from "../../../../modal/BSModalPart";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "../../../../preview/canvas/worker/PlixCanvasField";
import {CanvasFieldEditor} from "./CanvasFieldEditor";

interface PreviewFieldEditorModalProps {
    isOpen: boolean,
    close: (config: PreviewFieldConfig|null) => void;
    value: PreviewFieldConfig
}
export const PreviewFieldEditorModal: FC<PreviewFieldEditorModalProps> = ({isOpen, close, value}) => {
    const [fieldConfig, setFieldConfig] = useState<PreviewFieldConfig>(() => ({...value}));
    useEffect(() => {
        setFieldConfig({...value});
    }, [value])


    return (
        <BSModal isOpen={isOpen} close={close} size={"xl"}>
            <p>PreviewField configuration</p>
            <div>
                <CanvasFieldEditor value={fieldConfig} onChange={setFieldConfig}/>
            </div>
            <BSModalPart>
                {closeFn => (
                    <div className={"btn-group"}>
                        <button className={"btn btn-sm btn-success"} onClick={closeFn}>OK</button>
                        <button className={"btn btn-sm btn-danger"} onClick={closeFn}>Cancel</button>
                    </div>
                )}
            </BSModalPart>
        </BSModal>
    )
}