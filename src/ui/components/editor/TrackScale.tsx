import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import "./TrackScale.scss";
import {ScaleDisplayContext} from "./ScaleDisplayContext";


const ZOOM_FACTOR = 1.3

export const TrackScale: FC = () => {

    const {zoom, setZoom, duration} = useContext(ScaleDisplayContext);

    const zoomIn = useCallback(() => setZoom(v => v*ZOOM_FACTOR), [setZoom])
    const zoomOut = useCallback(() => setZoom(v => v/ZOOM_FACTOR), [setZoom])

    const width = useMemo(() => zoom * duration, [zoom, duration])

    return (
        <div className="track-scale">
            <span className="track-scale-controls">
                <button onClick={zoomOut}>(-)</button>
                <button onClick={zoomIn}>(+)</button>
            </span>
            <span className="track-scale-line" style={{width: width}}>
                line
            </span>
        </div>
    )

}