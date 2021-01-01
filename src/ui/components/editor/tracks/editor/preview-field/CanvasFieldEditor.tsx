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
} from "../../../../preview/canvas/dynamic/preview-field/PlixCanvasField";
import "./CanvasFieldEditor.scss"
import Form from "react-bootstrap/cjs/Form";
import {Checkbox} from "../../../../control/checkbox/Checkbox";
import {FieldElementEditor} from "./FieldElementEditor";
import {FieldElement} from "../../../../preview/canvas/dynamic/preview-field/PreviewFieldElement";
import {PenSettingsView} from "./pen-settings/PenSettingsView";
import {InlineNumberEditor} from "../inline/InlineNumberEditor";

interface CanvasFieldEditorProps {
    value: PreviewFieldConfig
    onChange: (PreviewFieldConfig) => void;
}
export const CanvasFieldEditor: FC<CanvasFieldEditorProps> = ({value, onChange}) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();
    const [drawModeEnabled, setDrawModeEnabled] = useState(false);
    const [drawingElement, setDrawingElement] = useState(null);
    const [displayIndexes, setDisplayIndexes] = useState(false);
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);

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
        elementEditor.resetDraw();
    }, [value, field])

    useEffect(() => {
        if (!field) return;
        elementEditor.setGrid([gridX, gridY]);
    }, [gridX, gridY])


    useEffect(() => {
        if (!elementEditor) return;
        elementEditor.setDrawingElement(drawModeEnabled ? drawingElement : null)
    }, [elementEditor,drawingElement,drawModeEnabled])

    const onChangeWidth = useCallback(val => {
        const clone = {...value, width: val}
        onChange(clone);
    },[value])
    const onChangeHeight = useCallback(val => {
        const clone = {...value, height: val}
        onChange(clone);
    },[value])

    const onClickRemoveLastElement = useCallback(() => {
        const elements = [...value.elements];
        elements.splice(elements.length-1,1);
        const clone: PreviewFieldConfig = {...value, elements: elements};
        onChange(clone);
    }, [value])

    const changeDisplayNumbers = useCallback((v) => {
        if (!elementEditor) return;
        setDisplayIndexes(v);
        elementEditor.setDisplayIndexes(v);
    }, [elementEditor, setDisplayIndexes])

    return (
        <div className={"canvas-field-editor"}>
            <div className={"cfe-cvs-container"}>
                <canvas ref={setCanvas}/>
            </div>
            <div className={"cfe-controls"}>
                <div className={"cfe-controls-group"}>
                    <label className={"cfe-option-label"}>Canvas size</label>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>Width: </span>
                        <div className={"cfe-option-value"}>
                            <InlineNumberEditor value={value.width} onChange={onChangeWidth} step={"any"}/>
                        </div>
                    </div>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>Height: </span>
                        <div className={"cfe-option-value"}>
                            <InlineNumberEditor value={value.height} onChange={onChangeHeight} step={"any"}/>
                        </div>
                     </div>
                    <label className={"cfe-option-label"}>Grid</label>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>X: </span>
                        <div className={"cfe-option-value"}>
                            <InlineNumberEditor value={gridX} onChange={setGridX} step={"any"}/>
                        </div>
                    </div>
                    <div className={"cfe-option"}>
                        <span className={"cfe-option-name"}>Y: </span>
                        <div className={"cfe-option-value"}>
                            <InlineNumberEditor value={gridY} onChange={setGridY} step={"any"}/>
                        </div>
                    </div>
                </div>
                <div className={"cfe-controls-group"}>
                    <label>Drawing</label>
                    <Form>
                        <Checkbox onChange={setDrawModeEnabled} value={drawModeEnabled}>Drawing enabled</Checkbox>
                    </Form>
                    <Form>
                        <Checkbox onChange={changeDisplayNumbers} value={displayIndexes}>Display indexes</Checkbox>
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