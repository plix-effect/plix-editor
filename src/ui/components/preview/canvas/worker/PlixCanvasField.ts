import {HSLAColor} from "@plix-effect/core/types";
import {hslaToRgba} from "@plix-effect/core/color";

interface FieldConfig {
    width: number,
    height: number,
    pixels: [number,number][],
    shape: "circle"|"square"
    size: number
}

const TWO_PI = 2 * Math.PI;

export class PlixCanvasField {

    private cfg: FieldConfig
    private canvas: OffscreenCanvas;
    private ctx: OffscreenCanvasRenderingContext2D;

    constructor(canvas: OffscreenCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    setFieldConfig(cfg: FieldConfig) {
        this.cfg = cfg
    }

    drawEmptyPixels() {

    }

    drawPixel(index: number, color?: HSLAColor) {
        const [x,y] = this.cfg.pixels[index];
        const ctx = this.ctx;
        const radius = this.cfg.size;
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.arc(x, y, radius+1, 0, TWO_PI);
        ctx.strokeStyle = "#444";
        ctx.stroke();
        if (!color) return;
        const sizeGain = Math.min(color[2]*2, 1); // L
        const rds = Math.round(Math.sqrt(sizeGain)*radius);
        const {r,g,b,a} = hslaToRgba(color);
        ctx.beginPath();
        ctx.arc(x, y, rds, 0, TWO_PI);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
    }
}