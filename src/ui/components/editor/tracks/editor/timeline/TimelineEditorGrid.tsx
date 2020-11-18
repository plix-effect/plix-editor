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
    const {trackWidth, zoom, duration} = useContext(ScaleDisplayContext);
    const offsetPx = zoom*offset;
    const cycleWidth = cycle * zoom;
    const cycleCount = Math.ceil((trackWidth - offsetPx) / cycleWidth);
    if (cycleCount <= 0) return null;
    const showOffset = offsetPx >= 1;
    const showCycle = cycleWidth >= MIN_GRID_SIZE;
    const showGrid = cycleWidth/grid >= MIN_GRID_SIZE;

    return useMemo(() => {
        const offsetD = offset / duration;
        const cycleD = cycle / duration;
        return (
            <Fragment>
                {showOffset && (
                    <div
                        className="timeline-editor-grid-offset"
                        style={{width: `${offsetD*100}%`}}
                    >
                        {offset}ms
                    </div>
                )}
                {showCycle && Array.from({length: cycleCount}).map((_, i) => {
                    return (
                        <div
                            key={i}
                            className="timeline-editor-grid-cycle"
                            style={{
                                left: `${(offsetD + cycleD*i) * 100}%`,
                                width: `${cycleD*100}%`,
                                backgroundSize: `${100/grid}% 80%`,
                                backgroundImage: showGrid ? "" : "none",
                            }}
                        />
                    );
                })}
            </Fragment>
        );

    }, [cycleCount, offset, duration, showCycle, showGrid, showOffset]);
})