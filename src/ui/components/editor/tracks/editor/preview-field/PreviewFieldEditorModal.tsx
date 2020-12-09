import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {BSModal} from "../../../../modal/BSModal";
import {BSModalPart} from "../../../../modal/BSModalPart";
import {PreviewFieldConfig} from "../../../../preview/canvas/preview-field/PlixCanvasField";
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

    const onClose = useCallback((v?: PreviewFieldConfig) => {
        if (!v) {
            setFieldConfig({...value})
            close(null);
        } else {
            close(v);
        }
    }, [setFieldConfig, value, close])


    const buttonsView = useMemo(() => {
        return (closeFn) => {
            const saveClose = () => {
                closeFn(fieldConfig);
            }
            const cancelClose = () => {
                closeFn(undefined);
            }

            return (
                <div className={"btn-group"}>
                    <button className={"btn btn-sm btn-success"} onClick={saveClose}>OK</button>
                    <button className={"btn btn-sm btn-danger"} onClick={cancelClose}>Cancel</button>
                </div>
            )
        }
    }, [fieldConfig])


    return (
        <BSModal isOpen={isOpen} close={onClose} size={"xl"}>
            <p>PreviewField configuration</p>
            <div>
                <CanvasFieldEditor value={fieldConfig} onChange={setFieldConfig}/>
            </div>
            <BSModalPart>
                {buttonsView}
            </BSModalPart>
        </BSModal>
    )
}