import {PlixCanvasField, RegularCanvasGeneric} from "../../../../preview/canvas/dynamic/preview-field/PlixCanvasField";
import {FieldElement} from "../../../../preview/canvas/dynamic/preview-field/PreviewFieldElement";
import {ITypedEventEmitter, TypedEventEmitter} from "../../../../../utils/TypedEventEmitter";
import {shade} from "@plix-effect/core/color";

export type DrawingFieldElement = Omit<FieldElement, "geometry">;

type FieldElementEditorEvents = {
    elementPlaced: (element: FieldElement) => void;
}

export class FieldElementEditor extends TypedEventEmitter<FieldElementEditorEvents> {

    private canvas: HTMLCanvasElement;
    private field: PlixCanvasField<RegularCanvasGeneric>;
    private ctx: CanvasRenderingContext2D
    private drawingElement?: DrawingFieldElement;


    constructor(canvas: HTMLCanvasElement, field: PlixCanvasField<RegularCanvasGeneric>) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.field = field;
        this.setDrawingModeEnabled(false);
    }

    setDrawingElement(element: DrawingFieldElement|null) {
        this.drawingElement = element;
        this.lastDrawingElement = null;
        this.field.resetDraw();
        const isDrawMode = element != null;
        this.setDrawingModeEnabled(isDrawMode)
        this.setCommonModeEnabled(!isDrawMode)
    }

    private setDrawingModeEnabled(val: boolean) {
        if (val) {
            this.canvas.addEventListener("mousemove", this.onMouseMoveEditMode );
            this.canvas.addEventListener("click", this.onClickInDrawingMode );
        } else {
            this.canvas.removeEventListener("mousemove", this.onMouseMoveEditMode)
            this.canvas.removeEventListener("click", this.onClickInDrawingMode );
        }
    }
    private setCommonModeEnabled(val: boolean) {
        if (val) {
            this.canvas.addEventListener("mousemove", this.onMoseMoveCommonMode );
        } else {
            this.canvas.removeEventListener("mousemove", this.onMoseMoveCommonMode);
        }
    }

    private getMousePos = (evt: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    private onClickInDrawingMode = () => {
        this.emit("elementPlaced", {...this.lastDrawingElement});
        // this.field.drawElement(this.lastDrawingElement)
        this.lastDrawingElement = null;
    }

    private onMouseMoveEditMode = (e: MouseEvent) => {
        if (this.drawingElement.type === "pixel") {
            this.onDrawingPixel(e)
        }
    }

    lastDrawingElement?: FieldElement;
    private onDrawingPixel = (e: MouseEvent) => {
        const {x,y} = this.getMousePos(e);
        let lastDrawingElement = this.lastDrawingElement;
        if (lastDrawingElement == null || this.lastDrawingElement) {
            this.lastDrawingElement = lastDrawingElement = {...this.drawingElement, geometry: [x,y]} as any
        } else {
            lastDrawingElement.geometry = [x,y]
        }
        this.field.resetDraw();
        this.field.drawElement(lastDrawingElement, undefined, "green")
    }



    private onMoseMoveCommonMode = (e: MouseEvent) => {
        const conf = this.field.getConfig();
        this.field.resetDraw();
        const {x,y} = this.getMousePos(e);
        const [hoverElement, i] = this.field.getElementAtPos(x,y);
        if (hoverElement) {
            this.field.drawElement(hoverElement, undefined, "white");
            this.canvas.title = `Element: ${i}\nProps: ${JSON.stringify(hoverElement.props)}`
        } else {
            this.canvas.title = "";
        }
    }
}