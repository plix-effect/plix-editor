import React, {FC, memo, useContext, useEffect, useMemo, useState} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import "./TimelineEditorGrid.scss";

const MIN_GRID_SIZE = 5;
const CANVAS_OVERSIZE = 1000;

export interface TimelineEditorGridProps {
    bpm: number
    grid: number
    offset: number
    repeatStart: number
    repeatEnd: number
}
export const TimelineEditorGrid: FC<TimelineEditorGridProps> = memo(({bpm, grid, offset, repeatStart, repeatEnd}) => {
    const {trackWidth, zoom, timelineEl} = useContext(ScaleDisplayContext);
    const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement>();
    const cycle = 60000 / bpm;
    const offsetPx = offset * zoom;
    const cycleWidth = cycle * zoom;
    const cycleCount = Math.ceil((trackWidth - offsetPx) / cycleWidth);
    const showCycle = cycleWidth >= MIN_GRID_SIZE;
    const showGrid = grid > 1 && cycleWidth/grid >= MIN_GRID_SIZE;
    const repeatStartTime = repeatStart > 0 ? offset + cycle * repeatStart : 0;
    const repeatEndTime = repeatEnd > 0 ? offset + cycle * repeatEnd : 0;
    const repeatStartPx = repeatStartTime * zoom;
    const repeatEndPx = repeatEndTime * zoom;

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
                const linePx = (offset + cycle * i) * zoom;
                if (repeatEndPx > 0 && linePx > repeatEndPx) break;
                const linePos = linePx - canvasStartPx;
                if (linePos > canvasWidth) break;
                const inRepeat = repeatEndPx > 0 && linePx >= repeatStartPx;
                drawLine(ctx, linePos|0, 0, height, inRepeat ? "#ff0" : "#888");

                if (showGrid) for (let j=1; j<grid; j++) {
                    const gridWidthPx = (cycle / grid) * zoom;
                    const lineGridPx = (offset + cycle * i) * zoom + gridWidthPx * j;
                    const lineGridPos = lineGridPx - canvasStartPx;
                    if (lineGridPos > canvasWidth) break;
                    const inRepeat = repeatEndPx > 0 && lineGridPx >= repeatStartPx;
                    drawLine(ctx, lineGridPos|0, 4, height-8, inRepeat ? "#880" : "#444");
                    if (gridWidthPx >= 40) {
                        ctx.fillStyle = "#444"
                        ctx.fillText(`${j}/${grid}`, (lineGridPos|0)+2, 10, cycleWidth);
                    }
                }

                if (cycleWidth >= 10) {
                    ctx.fillStyle = "#fff"
                    ctx.fillText(String(i), linePos+2, 10, cycleWidth);
                }
            }

            if (repeatEndPx > 0) {
                const repeatEndLinePos = Math.max(repeatEndPx - canvasStartPx, 0);
                if (repeatEndLinePos <= canvasWidth) {
                    ctx.clearRect(repeatEndLinePos, 0, canvasWidth - repeatEndLinePos, height);
                    hatchRect(ctx, repeatEndLinePos, 0, canvasWidth - repeatEndLinePos, height, 15, "#880");
                    drawLine(ctx, repeatEndLinePos|0, 0, height, "#ff0");
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

    }, [canvasEl, zoom, cycle, grid, offset, showCycle, showGrid, repeatStartPx, repeatEndPx])

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