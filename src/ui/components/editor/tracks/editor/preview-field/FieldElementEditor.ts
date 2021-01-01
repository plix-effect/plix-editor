import {PlixCanvasField, RegularCanvasGeneric} from "../../../../preview/canvas/dynamic/preview-field/PlixCanvasField";
import {FieldElement} from "../../../../preview/canvas/dynamic/preview-field/PreviewFieldElement";
import {ITypedEventEmitter, TypedEventEmitter} from "../../../../../utils/TypedEventEmitter";
import {shade} from "@plix-effect/core/color";

export type DrawingFieldElement = Omit<FieldElement, "geometry">;

type FieldElementEditorEvents = {
    elementPlaced: (element: FieldElement) => void;
}

const ELEMENT_COLOR = "rgba(234,234,234,1)"
const GRID_COLOR = "rgba(75,75,75,0.42)"
const NEW_ITEM_COLOR = "rgb(73,255,0)"
const HOVER_COLOR = "rgba(255,255,255,1)"

export class FieldElementEditor extends TypedEventEmitter<FieldElementEditorEvents> {

    private canvas: HTMLCanvasElement;
    private field: PlixCanvasField<RegularCanvasGeneric>;
    private ctx: CanvasRenderingContext2D
    private drawingElement?: DrawingFieldElement;
    private grid: [number, number] | null = null
    private displayIndexes: boolean = false;


    constructor(canvas: HTMLCanvasElement, field: PlixCanvasField<RegularCanvasGeneric>) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.field = field;
        this.setDrawingModeEnabled(false);
        this.field.setContourColor(ELEMENT_COLOR)
    }

    setDrawingElement(element: DrawingFieldElement|null) {
        this.drawingElement = element;
        this.lastDrawingElement = null;
        this.resetDraw();
        const isDrawMode = element != null;
        this.setDrawingModeEnabled(isDrawMode)
        this.setCommonModeEnabled(!isDrawMode)
    }

    setDisplayIndexes(val: boolean) {
        this.displayIndexes = val;
        this.resetDraw();
    }

    private get gridEnabled() {
        const grid = this.grid;
        return grid && (grid[0] > 0 && grid[1] > 0)
    }

    public setGrid(grid: [number, number]) {
        this.grid = grid;
        this.resetDraw();
    }

    public resetDraw(){
        this.field.resetDraw();
        this.drawGrid();
        if (this.displayIndexes) this.drawIndexes();
    }
    
    private drawGrid() {
        if (!this.gridEnabled) return;
        const ctx = this.ctx;
        const [gridX, gridY] = this.grid;
        const countX = Math.floor(this.canvas.width / gridX);
        const countY = Math.floor(this.canvas.width / gridY);
        const startGridX = gridX / 2;
        const startGridY = gridY / 2;
        ctx.setLineDash([]);
        ctx.strokeStyle = GRID_COLOR;
        for (let xi = 0; xi < countX; xi++) {
            for (let yi = 0; yi < countY; yi++) {
                const x = startGridX + xi * gridX;
                const y = startGridY + yi * gridY;
                ctx.beginPath();
                ctx.strokeRect(x,y,1,1)
                ctx.stroke();
            }
        }
    }

    private drawIndexes() {
        const elements = this.field.getConfig().elements;
        const ctx = this.ctx;
        elements.forEach((e, i) => {
            if (e.type !== "pixel") return;
            ctx.fillStyle = ELEMENT_COLOR;
            ctx.font = "9px Robotto";
            const quartSize = e.props.size/4;
            const x = e.geometry[0]-quartSize-1;
            const y = e.geometry[1]+quartSize;
            ctx.fillText(String(i), x, y);
        })
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
        let {x, y} = this.getMousePos(e);
        if (this.gridEnabled) {
            const [gx, gy] = this.grid;
            x = x - x%gx + gx/2;
            y = y - y%gy + gy/2;
        }
        let lastDrawingElement = this.lastDrawingElement;
        if (lastDrawingElement == null || this.lastDrawingElement) {
            this.lastDrawingElement = lastDrawingElement = {...this.drawingElement, geometry: [x,y]} as any
        } else {
            lastDrawingElement.geometry = [x,y]
        }
        this.resetDraw();
        this.field.drawElement(lastDrawingElement, undefined, NEW_ITEM_COLOR)
    }



    private onMoseMoveCommonMode = (e: MouseEvent) => {
        this.resetDraw();
        const {x,y} = this.getMousePos(e);
        const [hoverElement, i] = this.field.getElementAtPos(x,y);
        if (hoverElement) {
            this.field.drawElement(hoverElement, undefined, HOVER_COLOR);
            this.canvas.title = `Element: ${i}\nProps: ${JSON.stringify(hoverElement.props)}`
        } else {
            this.canvas.title = "";
        }
    }

}