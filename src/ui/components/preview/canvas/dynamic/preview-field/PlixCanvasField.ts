import {HSLAColor, PlixColor, RGBAColor} from "@plix-effect/core/types";
import {hslaToRgba} from "@plix-effect/core/color";
import {FieldElement, FieldElementLine, FieldElementPixel} from "./PreviewFieldElement";


export interface PreviewFieldConfig {
    width: number,
    height: number,
    elements: FieldElement[],
}

const TWO_PI = 2 * Math.PI;

export type OffscreenCanvasGeneric = {
    canvas: OffscreenCanvas
    ctx: OffscreenCanvasRenderingContext2D
}
export type RegularCanvasGeneric = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
}
export type CanvasGeneric =
    | OffscreenCanvasGeneric
    | RegularCanvasGeneric
;

const contourColor = "#444";

export const DEFAULT_PREVIEW_FIELD_CONFIG: PreviewFieldConfig = {
    width: 1000,
    height: 100,
    elements: Array.from({length: 20}).map((_, i) => {
        const size = 25;
        return {type: "pixel", props: {shape: i<10 ? "circle" : "square", size: size,}, geometry: [40 + i * (size + 10), 40]}
    })
}

export class PlixCanvasField<T extends CanvasGeneric> {

    private cfg: PreviewFieldConfig
    private canvas: T['canvas'];
    private ctx: T['ctx'];
    private contourColor: any = contourColor;

    constructor(canvas: T['canvas']) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    setConfig(cfg: PreviewFieldConfig) {
        this.cfg = cfg;
        this.canvas.height = cfg.height;
        this.canvas.width = cfg.width;
        this.resetDraw()
    }

    getConfig() {
        return this.cfg;
    }

    get elementsCount() {
        return this.cfg.elements.length;
    }

    public setContourColor(clr: any) {
        this.contourColor = clr;
    }

    public drawElementFromConfig(index: number, color?: RGBAColor, outlineColor = this.contourColor): void {
        const element = this.cfg.elements[index];
        this.drawElement(element, color, outlineColor);
    }

    public drawElement(element: FieldElement, color?: RGBAColor, outlineColor = this.contourColor): void {
        if (element.type === "line") this.drawLine(element, color, outlineColor);
        else if (element.type === "pixel") this.drawPixel(element, color, outlineColor);
    }

    public resetDraw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        const elements = this.cfg.elements;
        for (let i = 0; i < elements.length; i++) {
            this.drawElementFromConfig(i, null);
        }
    }

    public drawLine (lineInfo: FieldElementLine, color?: RGBAColor, outlineColor = this.contourColor) {
        console.warn("drawLine not implemented")
    }

    public drawPixel(pixelInfo: FieldElementPixel, color?: RGBAColor, outlineColor = this.contourColor) {
        const [x,y] = pixelInfo.geometry;
        const ctx = this.ctx;
        const size = pixelInfo.props.size;

        function getSizeGain() {
            const {r,g,b,a} = color;
            const lum = 0.3 * r*a + 0.59 * g*a + 0.11 * b*a; // luminosity value: 0-255
            const sizeGain = Math.min(lum/128, 1);
            return sizeGain;
        }

        function drawSquare() {
            ctx.strokeStyle = outlineColor;
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
            ctx.strokeStyle = outlineColor;
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

        if (pixelInfo.props.shape === "circle") {
            drawCircle();
        } else {
            drawSquare();
        }
    }

    public getElementAtPos(x: number, y: number): [FieldElement, number] {
        const index = this.cfg.elements.findIndex((value, i) => {
            if (value.type === "pixel") {
                const size = value.props.size;
                const halfSize = size/2;
                const [eX, eY] = value.geometry;
                const dx = eX -x;
                const dy = eY -y;
                if (value.props.shape === "circle") {
                    return Math.sqrt(dx*dx + dy*dy) <= halfSize;
                } else {
                    return Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize
                }
            }
            return false;
        });
        if (index == -1) return [null, -1];
        return [this.cfg.elements[index], index];
    }
}