import React, {FC, Fragment, memo, useContext, useMemo} from "react";
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
    const cycleCount = Math.ceil((trackWidth - offsetPx) / cycleWidth);
    if (cycleCount <= 0) return null;
    const gridWidth = cycleWidth/grid;

    return useMemo(() => (
        <Fragment>
            {offsetPx >= 1 && (
                <div
                    className="timeline-editor-grid-offset"
                    style={{width: offsetPx}}
                >
                    {offset}ms
                </div>
            )}
            {cycleWidth >= MIN_GRID_SIZE && Array.from({length: cycleCount}).map((_, i) => {
                return (
                    <div
                        key={i}
                        className="timeline-editor-grid-cycle"
                        style={{
                            left: offsetPx + cycleWidth * i,
                            width: cycleWidth,
                            backgroundSize: `${gridWidth}px 80%`,
                            backgroundImage: gridWidth >= MIN_GRID_SIZE ? "" : "none",
                        }}
                    />
                );
            })}
        </Fragment>
    ), [cycleCount, offsetPx, cycleWidth, gridWidth]);
})