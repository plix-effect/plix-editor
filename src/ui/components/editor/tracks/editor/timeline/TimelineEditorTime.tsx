import React, {FC, memo, useContext, useEffect, useMemo, useState} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import "./TimelineEditorGrid.scss";

const CANVAS_OVERSIZE = 1000;

const SEC = 1000;
const MIN = SEC*60;
const HR = MIN*60;
const minCycleSize = 50;
const timeSteps = [100, 200, 500, SEC, 2*SEC, 5*SEC, 10*SEC, 30*SEC,    MIN,  2*MIN,  5*MIN, 10*MIN,    HR, 10*HR ]
const gridSteps = [ 10,  20,  50, 100,   200,   SEC,    SEC,  5*SEC, 10*SEC, 10*SEC, 30*SEC,    MIN, 5*MIN,    HR ]

export interface TimelineEditorTimeProps {}
export const TimelineEditorTime: FC<TimelineEditorTimeProps> = memo(({}) => {
    const {zoom, timelineEl} = useContext(ScaleDisplayContext);
    const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement>();

    const dur = minCycleSize / zoom;
    const timeStep = timeSteps.find(step => step >= dur);
    const gridTimeStep = gridSteps[timeSteps.indexOf(timeStep)];

    useEffect(() => {
        if (!canvasEl || !timelineEl) return;

        const ctx = canvasEl.getContext("2d");

        let canvasStartPx = 0;
        let canvasEndPx = 0;

        function paint(){
            const {height} = canvasEl.parentElement.getBoundingClientRect();
            const timelineBcr = timelineEl.getBoundingClientRect();
            canvasStartPx = timelineEl.scrollLeft - CANVAS_OVERSIZE;
            const canvasWidth = timelineBcr.width + CANVAS_OVERSIZE*2;
            canvasEndPx = canvasStartPx + canvasWidth;
            canvasEl.height = height;
            canvasEl.width = canvasWidth;
            canvasEl.style.left = `${canvasStartPx}px`;

            if (!timeStep) return;

            const startCycle = Math.max(0, canvasStartPx*zoom/timeStep)|0;
            for (let i=startCycle;; i++) {
                const lineTime = timeStep * i;
                const linePx = lineTime * zoom;
                const linePos = linePx - canvasStartPx;
                if (linePos > canvasWidth) break;
                drawLine(ctx, linePos|0, 0, height, "#888");

                for (let j=1; j<(timeStep/gridTimeStep); j++) {
                    const gridWidthPx = gridTimeStep * zoom;
                    const lineGridPx = linePx + gridWidthPx * j;
                    const lineGridPos = lineGridPx - canvasStartPx;
                    if (lineGridPos > canvasWidth) break;
                    drawLine(ctx, lineGridPos|0, height-10, 10, "#444");
                }

                ctx.fillStyle = "#fff"
                ctx.fillText(getDisplayTimeValue(lineTime), linePos+2, height-15);

            }

        }

        paint();

        function onScroll(){
            const timelineBcr = timelineEl.getBoundingClientRect();
            const leftViewPos = timelineEl.scrollLeft;
            if (leftViewPos <= canvasStartPx) return paint();
            const rightViewPos = timelineEl.scrollLeft + timelineBcr.width;
            if (rightViewPos >= canvasEndPx) return paint();
        }

        timelineEl.addEventListener("scroll", onScroll);
        return () => timelineEl.removeEventListener("scroll", onScroll);

    }, [canvasEl, zoom, timeStep, gridTimeStep]);

    return useMemo(() => (
        <canvas className="timeline-editor-grid-canvas" ref={setCanvasEl}/>
    ), []);
});

function drawLine(ctx: CanvasRenderingContext2D, x:number, y:number, dy:number,  color:string){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + dy);
    ctx.stroke();
}

function getDisplayTimeValue(time: number): string{
    if (time === 0) return "0";
    if (time < 1000) return time.toFixed(0)+'ms';
    const h = (time / HR)|0;
    time = time % HR;
    const m = (time / MIN)|0;
    time = time % MIN;
    const s = time / SEC;
    let value = h > 0 ? h+"h " : "";
    value += (m>0 || h>0 && s>0) ? m+"m " : "";
    if (s > 0) value += s+"s";
    return value;
}