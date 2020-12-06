import {HSLAColor, PlixColor, RGBAColor} from "@plix-effect/core/types";
import {hslaToRgba} from "@plix-effect/core/color";

export type FieldElementPosition = [number, number];

export type FieldElementPixel = {
    type: "pixel",
    color?: PlixColor,
    position: FieldElementPosition,
    shape: "circle"|"square",
    size: number
}

export type FieldElementLine = {
    type: "line",
    position: FieldElementPosition
    // ToDo
}

export type FieldElement =
    | FieldElementPixel
    | FieldElementLine
;

export interface FieldConfig {
    width: number,
    height: number,
    elements: FieldElement[],
}

const TWO_PI = 2 * Math.PI;

type OffscreenCanvasGeneric = {
    canvas: OffscreenCanvas
    ctx: OffscreenCanvasRenderingContext2D
}
type RegularCanvasGeneric = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
}
type CanvasGeneric =
    | OffscreenCanvasGeneric
    | RegularCanvasGeneric
;

const contourColor = "#444";

export class PlixCanvasField<T extends CanvasGeneric = any> {

    private cfg: FieldConfig
    private canvas: T['canvas'];
    private ctx: T['ctx'];

    constructor(canvas: T['canvas']) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    setFieldConfig(cfg: FieldConfig) {
        this.cfg = cfg;
        this.canvas.height = cfg.height;
        this.canvas.width = cfg.width;
    }

    get elementsCount() {
        return this.cfg.elements.length;
    }

    public draw(index: number, color?: RGBAColor) {
        const element = this.cfg.elements[index];
        if (element.type === "line") this.drawLine(element, color);
        else if (element.type === "pixel") this.drawPixel(element, color);
    }

    public resetDraw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        const elements = this.cfg.elements;
        for (let i = 0; i < elements.length; i++) {
            this.draw(i, null);
        }
    }

    private drawLine (lineInfo: FieldElementLine, color?: RGBAColor) {
        console.warn("drawLine not implemented")
    }

    private drawPixel(pixelInfo: FieldElementPixel, color?: RGBAColor) {
        const [x,y] = pixelInfo.position;
        const ctx = this.ctx;
        const size = pixelInfo.size;

        function getSizeGain() {
            const {r,g,b,a} = color;
            const lum = 0.3 * r*a + 0.59 * g*a + 0.11 * b*a; // luminosity value: 0-255
            const sizeGain = Math.min(lum/128, 1);
            return sizeGain;
        }

        function drawSquare() {
            ctx.strokeStyle = contourColor;
            const halfSize = size/2;
            ctx.setLineDash([halfSize/2, halfSize/2]);
            ctx.strokeRect(x-halfSize-1, y-halfSize-1, size+2, size+2)
            if (!color) return;
            const sizeGain = getSizeGain();
            const colorSize = sizeGain*size;
            const halfColorSize = colorSize/2;
            const {r,g,b,a} = color;
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fillRect(x-halfColorSize, y-halfColorSize, colorSize, colorSize)
        }

        function drawCircle() {
            ctx.beginPath();
            const radius = Math.floor(size/2)
            ctx.setLineDash([radius/2, radius/2]);
            ctx.arc(x, y, radius+1, 0, TWO_PI);
            ctx.strokeStyle = contourColor;
            ctx.stroke();
            if (!color) return;
            const {r,g,b,a} = color;
            const sizeGain = getSizeGain()
            const innerRadius = Math.round(Math.sqrt(sizeGain)*radius);
            ctx.beginPath();
            ctx.arc(x, y, innerRadius, 0, TWO_PI);
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fill();
        }

        if (pixelInfo.shape === "circle") {
            drawCircle();
        } else {
            drawSquare();
        }
    }
}