import React, {FC, Fragment, memo, useContext, useEffect, useMemo, useRef, useState} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import "./TimelineEditorGrid.scss";

const MIN_GRID_SIZE = 5;
const CANVAS_OVERSIZE = 1000;

export interface TimelineEditorGridProps {
    cycle: number
    grid: number
    offset: number
}
export const TimelineEditorGrid: FC<TimelineEditorGridProps> = memo(({cycle, grid, offset}) => {
    const {trackWidth, zoom, timelineEl} = useContext(ScaleDisplayContext);
    const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement>();
    const offsetPx = zoom*offset;
    const cycleWidth = cycle * zoom;
    const cycleCount = Math.ceil((trackWidth - offsetPx) / cycleWidth);
    const showCycle = cycleWidth >= MIN_GRID_SIZE;
    const showGrid = grid > 1 && cycleWidth/grid >= MIN_GRID_SIZE;

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
            const offsetWidth = (offset * zoom);

            if (!cycle) {
                hatchRect(ctx, 0, 0, canvasWidth, height, 15, "#444");
                if (offsetWidth >= canvasStartPx) {
                    drawLine(ctx, offsetWidth-canvasStartPx, 0, height, "#888");
                }
                return;
            }

            if (offsetWidth >= canvasStartPx) {
                hatchRect(ctx, 0, 0, offsetWidth-canvasStartPx, height, 15, "#444");
                drawLine(ctx, offsetWidth-canvasStartPx, 0, height, "#888");
            }
            const cycleWidth = cycle * zoom;
            const startCycle = Math.max(0, ((canvasStartPx-offsetWidth)/cycleWidth)|0);


            if (showCycle) for (let i=startCycle; i<cycleCount; i++) {
                const linePos = (offset + cycle * i) * zoom - canvasStartPx;
                if (linePos > canvasWidth) break;
                drawLine(ctx, linePos|0, 0, height, "#888");

                if (showGrid) for (let j=1; j<grid; j++) {
                    const lineGridPos = ((offset + cycle * i) + (cycle * j/grid)) * zoom - canvasStartPx;
                    if (lineGridPos > canvasWidth) break;
                    drawLine(ctx, lineGridPos|0, 4, height-8, "#444");
                }

                if (cycleWidth >= 10) {
                    ctx.fillStyle = "#fff"
                    ctx.fillText(String(i+1), linePos+2, 10, cycleWidth);
                }
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

    }, [canvasEl, zoom, cycle, grid, offset, showCycle, showGrid])

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

function hatchRect(ctx: CanvasRenderingContext2D, x1:number, y1:number, dx:number, dy:number, delta:number, color:string){
    ctx.rect(x1, y1, dx, dy);
    ctx.save();
    ctx.clip();
    const majorAxe = Math.max(dx, dy);
    ctx.strokeStyle = color;

    for (let n = -majorAxe; n < majorAxe; n += delta) {
         ctx.beginPath();
         ctx.moveTo(n + x1, y1);
         ctx.lineTo(dy + n + x1 , y1 + dy);
         ctx.stroke();
    }
    ctx.restore();
}