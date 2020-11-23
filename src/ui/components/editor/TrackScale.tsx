import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import "./TrackScale.scss";
import {ScaleDisplayContext} from "./ScaleDisplayContext";

export const TrackScale: FC = () => {
    const seprataion = 1000;
    const {trackWidth, zoom, duration} = useContext(ScaleDisplayContext);
    const offsetD = seprataion / duration;
    const count = Math.ceil(duration/seprataion);

    return (
        <div className="track-scale" style={{height: 41}}>
            <div className={"timeline-editor"} style={{width: trackWidth}}>
                <div className={"timeline-editor-grid"}>
                    {
                        Array.from({length: count}).map((_, i) => {
                            const widthPercent = offsetD*100;
                            return (
                                <div
                                    key={i}
                                    className="timeline-editor-grid-offset"
                                    style={{width: `${widthPercent}%`, left: `${i*widthPercent}%`}}
                                >
                                    {seprataion*(i+1)/1000}s
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )

}