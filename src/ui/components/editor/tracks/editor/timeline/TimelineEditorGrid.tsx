import React, {FC, memo, useContext, useMemo} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import "./TimelineEditorGrid.scss";

const MIN_GRID_SIZE = 5;

export interface TimelineEditorGridProps {
    cycle: number
    grid: number
    offset: number
}
export const TimelineEditorGrid: FC<TimelineEditorGridProps> = memo(({cycle, grid, offset}) => {
    const {trackWidth, zoom} = useContext(ScaleDisplayContext);
    const offsetPx = zoom*offset;
    const cycleWidth = cycle * zoom;
    if (cycleWidth < MIN_GRID_SIZE) return null;
    const cycleCount = Math.ceil((trackWidth - offsetPx) / cycleWidth);
    if (cycleCount <= 0) return null;

    const elements = useMemo(() => (
        Array.from({length:cycleCount}).map((_, i) => {
            return (
                <div
                    key={i}
                    className="timeline-editor-grid-cycle"
                    style={{left: offsetPx + cycleWidth*i, width: cycleWidth}}
                />
            );
        })
    ), [cycleCount, offsetPx, cycleWidth]);

    return (
        <>{elements}</>
    );
})