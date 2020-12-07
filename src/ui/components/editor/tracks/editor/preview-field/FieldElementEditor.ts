

export class FieldElementEditor {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D

    private drawingMode: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    setDrawingMode(val: boolean) {
        this.drawingMode = val;
        if (val) {
            this.canvas.addEventListener("mousemove", this.onMouseOverEditMode )
        } else {
            this.canvas.removeEventListener("mousemove", this.onMouseOverEditMode)
        }
    }

    getMousePos = (evt: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    onMouseOverEditMode = (e: MouseEvent) => {
        const ctx = this.ctx;
        const {x,y} = this.getMousePos(e);
        ctx.strokeStyle = "red";
        ctx.setLineDash([]);
        ctx.strokeRect(x,y,1,1)
    }
}