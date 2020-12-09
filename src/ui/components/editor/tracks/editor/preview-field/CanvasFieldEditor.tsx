import React, {
    ChangeEvent,
    ChangeEventHandler,
    FC,
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    PlixCanvasField,
    PreviewFieldConfig,
    RegularCanvasGeneric
} from "../../../../preview/canvas/preview-field/PlixCanvasField";
import "./CanvasFieldEditor.scss"
import Form from "react-bootstrap/cjs/Form";
import {Checkbox} from "../../../../control/checkbox/Checkbox";
import {FieldElementEditor} from "./FieldElementEditor";
import {FieldElement} from "../../../../preview/canvas/preview-field/PreviewFieldElement";
import {PenSettingsView} from "./pen-settings/PenSettingsView";

interface CanvasFieldEditorProps {
    value: PreviewFieldConfig
    onChange: (PreviewFieldConfig) => void;
}
export const CanvasFieldEditor: FC<CanvasFieldEditorProps> = ({value, onChange}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [drawModeEnabled, setDrawModeEnabled] = useState(false);
    const [drawingElement, setDrawingElement] = useState(null);

    const [field, elementEditor] = useMemo(() => {
        if (!canvas) return [null,null];
        const field = new PlixCanvasField<RegularCanvasGeneric>(canvas);
        const editor =  new FieldElementEditor(canvas, field);
        return [field, editor]
    }, [canvas])

    useEffect(() => {
        if (!elementEditor) return;
        const addElement = (element: FieldElement) => {
            const clone: PreviewFieldConfig = {...value, elements: [...value.elements, element]};
            onChange(clone);
        }
        elementEditor.on("elementPlaced", addElement);

        return () => {
            elementEditor.off("elementPlaced", addElement)
        }
    }, [value, onChange, elementEditor])


    useEffect(() => {
        if (!field) return;
        field.setConfig(value);
        field.resetDraw();
    }, [value, field])


    useEffect(() => {
        if (!elementEditor) return;
        elementEditor.setDrawingElement(drawModeEnabled ? drawingElement : null)
    }, [elementEditor,drawingElement,drawModeEnabled])

    const onChangeWidth = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const clone = {...value, width: Number(e.target.value)}
        onChange(clone);
    },[value])
    const onChangeHeight = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const clone = {...value, height: Number(e.target.value)}
        onChange(clone);
    },[value])

    const onClickRemoveLastElement = useCallback(() => {
        const elements = [...value.elements];
        elements.splice(elements.length-1,1);
        const clone: PreviewFieldConfig = {...value, elements: elements};
        onChange(clone);
    }, [value])

    return (
        <div className={"canvas-field-editor"}>
            <div className={"cfe-cvs-container"}>
                <canvas ref={setCanvas}/>
            </div>
            <div className={"cfe-controls"}>
                <div className={"cfe-controls-group"}>
                    <label>Canvas size</label>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>Width: </span>
                        <input value={value.width} type={"number"} step={"any"} className={"form-control cfe-option-value"} onChange={onChangeWidth}/>
                    </div>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>Height: </span>
                        <input value={value.height} type={"number"} step={"any"} className={"form-control cfe-option-value"} onChange={onChangeHeight}/>
                    </div>
                </div>
                <div className={"cfe-controls-group"}>
                    <label>Drawing</label>
                    <Form>
                        <Checkbox onChange={setDrawModeEnabled} value={drawModeEnabled}>Drawing enabled</Checkbox>
                    </Form>
                    <div>
                        <button className={"btn btn-danger"} onClick={onClickRemoveLastElement}>Remove last element</button>
                    </div>
                </div>
                <div className={"cfe-controls-group"}>
                    <label>Pen</label>
                    <PenSettingsView onChange={setDrawingElement}/>
                </div>

            </div>
        </div>
    )
}