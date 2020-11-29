import React, {
    FC,
    memo, useCallback, useEffect, useRef,
} from "react";
import "../TimelineBlinkTrack.scss";
import {usePlaybackControl, usePlaybackData, usePlaybackStatus} from "../../PlaybackContext";

export interface TimelineBlinkTrackProps {
    cycle: number
    offset: number;
}
export const TimelineBlinkPreview: FC<TimelineBlinkTrackProps> = memo(({cycle, offset}) => {

    const imgRef = useRef<HTMLImageElement>();

    const blink = useCallback(() => {
        const img = imgRef.current;
        if (!img) return;
        img.classList.remove("_animate", "_animate-active");
        img.style.transition = "none";
        img.classList.add("_animate");
        img.scrollTop; // get scrollTop to render animation class
        img.style.transition = "";
        img.classList.add("_animate-active");
    }, []);

    const status = usePlaybackStatus();
    const {playFromStamp} = usePlaybackData();
    const {getPlayTime} = usePlaybackControl();

    useEffect(() => {
        if (!cycle) return
        if (status !== "play") return;
        let lastTimeout = null;
        function handleNextBlink(){
            const time = getPlayTime();
            let timeout = 0;
            if (time < offset) {
                timeout = (offset - time);
            } else {
                const afterOffset = time-offset;
                timeout = cycle - (afterOffset % cycle);
                if (timeout < 10) timeout += cycle;
            }
            lastTimeout = setTimeout(() => {
                blink();
                handleNextBlink();
            }, timeout)
        }
        handleNextBlink();
        return () => {
            if (lastTimeout !== null) clearTimeout(lastTimeout);
        }

    }, [status, playFromStamp, cycle, offset]);

    return (
        <div className="timeline-blink-container">
            <img ref={imgRef} className="timeline-blink-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=" />
        </div>
    );
})