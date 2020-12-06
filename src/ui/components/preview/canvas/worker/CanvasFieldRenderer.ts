import {PlixCanvasField} from "./PlixCanvasField";
import {BLACK, toRgba} from "@plix-effect/core/color";
import parseRender from "@plix-effect/core/dist/parser";


export class CanvasFieldRenderer {

    private field: PlixCanvasField;
    private parsedData: ReturnType<typeof parseRender>;
    private duration: number

    constructor(field: PlixCanvasField) {
        this.field = field;
    }

    setParsedData(data: ReturnType<typeof parseRender>) {
        this.parsedData = data;
    }

    setDuration(value: number) {
        this.duration = value;
    }

    renderTime(time: number) {
        this.field.resetDraw();
        if (!this.parsedData) return;
        const count = this.field.elementsCount;
        const line = this.parsedData.effect(time, this.duration);
        for (let i = 0; i < count; i++) {
            const mod = line(i, count);
            const color = mod(BLACK);
            this.field.draw(i, toRgba(color));
        }
    }

    private currentRenderProcessId?: Symbol = null;
    public startRendering(playFromTimestamp, playbackRate) {
        const currentRafProcessId = this.currentRenderProcessId = Symbol();
        const doRender = () => {
            if (currentRafProcessId !== this.currentRenderProcessId) return;
            requestAnimationFrame(doRender);
            const time = performance.now() - playFromTimestamp;
            this.renderTime(time * playbackRate);
        }
        doRender();
    }

    public stopRendering() {
        this.currentRenderProcessId = null;
    }

    public get rendering() {return this.currentRenderProcessId != null}
}