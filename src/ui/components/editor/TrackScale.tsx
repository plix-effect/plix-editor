import React, {FC, MouseEventHandler, useCallback, useContext, useEffect, useRef} from "react";
import "./TrackScale.scss";
import {ScaleDisplayContext} from "./ScaleDisplayContext";
import {TrackPlayPosition} from "./tracks/editor/TrackPlayPosition";
import {TimelineEditorTime} from "./tracks/editor/timeline/TimelineEditorTime";
import {usePlaybackControl} from "./PlaybackContext";

const ZOOM_FACTOR = Math.sqrt(2);

export const TrackScale: FC = () => {
    const {timelineEl, setZoom} = useContext(ScaleDisplayContext);

    const {duration, zoom, trackWidth} = useContext(ScaleDisplayContext);
    const {pause} = usePlaybackControl();

    const mouseLeftRef = useRef(0);
    useEffect(() => {
        const onMouseMove = ({pageX}: DocumentEventMap["mousemove"]) => {
            mouseLeftRef.current = pageX;
        }
        document.addEventListener("mousemove", onMouseMove);
        return () => document.removeEventListener("mousemove", onMouseMove);
    })

    const multiplyZoom = useCallback((value: number) => {
        setZoom(v => {
            let z = v*value;
            if (z > 1) {
                z = 1;
            } else if (duration * z < 500) {
                z = 500/duration;
            }
            if (z === v) return v;
            if (timelineEl) {
                const {left} = timelineEl.getBoundingClientRect();
                const dif = Math.max(mouseLeftRef.current - left, 0);
                const newScrollLeftPos = (timelineEl.scrollLeft + dif) * z / v - (dif)
                timelineEl.scrollLeft = newScrollLeftPos;
                // fix scrollLeft after resizing
                setTimeout(() => timelineEl.scrollLeft = newScrollLeftPos, 50);
            }
            return z;

        });
    }, [setZoom, duration, timelineEl, mouseLeftRef]);

    const zoomIn = useCallback(() => multiplyZoom(ZOOM_FACTOR), [multiplyZoom])
    const zoomOut = useCallback(() => multiplyZoom(1/ZOOM_FACTOR), [multiplyZoom]);

    const onClickTrack: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!timelineEl) return;
        const {left} = timelineEl.getBoundingClientRect();
        const pos = event.pageX - left + timelineEl.scrollLeft;
        const time = pos / zoom;
        pause(time);
    }, [zoom, timelineEl]);

    return (
        <div className="track-scale" style={{width: trackWidth}}>
            <TrackPlayPosition/>
            <div className="track-scale-container" onClick={onClickTrack}>
                <TimelineEditorTime />
            </div>
            <div className="track-scale-interface">
                <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={zoomOut} title={"Zoom out"}>
                    <i className="fa fa-search-minus"/>
                </button>
                <button className={"btn btn-primary btn-sm track-header-icon-button"} onClick={zoomIn} title={"Zoom in"}>
                    <i className="fa fa-search-plus"/>
                </button>
            </div>
        </div>
    )

}