import React, {FC, useContext} from "react";
import "./TrackScale.scss";
import {ScaleDisplayContext} from "./ScaleDisplayContext";
import {TrackPlayPosition} from "./tracks/editor/TrackPlayPosition";

export const TrackScale: FC = () => {
    const seprataion = 1000;
    const {trackWidth, duration} = useContext(ScaleDisplayContext);
    const offsetD = seprataion / duration;
    const count = Math.ceil(duration/seprataion);

    return (
        <div className="track-scale">
            <TrackPlayPosition/>
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