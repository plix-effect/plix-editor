import React, {DragEvent, FC, useCallback, useContext, useEffect, useRef} from "react";
import {usePlaybackControl, usePlaybackData, usePlaybackStatus} from "../../PlaybackContext";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";

export const TrackPlayPosition: FC = () => {
    const ref = useRef<HTMLDivElement>();
    const status = usePlaybackStatus();
    const {pauseTime} = usePlaybackData();
    const {getPlayTime, pause} = usePlaybackControl();
    const {zoom, timelineEl} = useContext(ScaleDisplayContext);

    const onDragStart = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setDragImage(new Image(), 0, 0)
    }, [])
    const onDrag = useCallback((event: DragEvent<HTMLDivElement>) => {
        if (event.pageX === 0) return;
        const timelineBcr = timelineEl.getBoundingClientRect();
        const pos = event.pageX - timelineBcr.left + timelineEl.scrollLeft;
        const time = pos / zoom;
        pause(time);
    }, [status, zoom, timelineEl]);

    useEffect(() => {
        function updateTimePos(){
            const time = getPlayTime();
            ref.current.style.display = (time === null) ? "none" : "";
            if (time !== null) ref.current.style.left = `${time*zoom}px`
        }

        if (status !== "play") return updateTimePos();

        let updateTrigger = true;
        function raf(){
            updateTimePos();
            if (updateTrigger) window.requestAnimationFrame(raf);
        }
        raf();
        return () => updateTrigger = false;

    }, [status, zoom, pauseTime])

    return (
        <div className="track-timeline-time-col" draggable onDrag={onDrag} onDragStart={onDragStart} ref={ref}/>
    )
}