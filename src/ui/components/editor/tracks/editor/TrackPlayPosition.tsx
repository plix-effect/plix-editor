import React, {FC, useContext, useEffect, useRef} from "react";
import {usePlaybackControl, usePlaybackStatus} from "../../../../../../PlaybackContext";
import {ScaleDisplayContext} from "../../ScaleDisplayContext";

export const TrackPlayPosition: FC = () => {
    const ref = useRef<HTMLDivElement>();
    const status = usePlaybackStatus();
    const {getPlayTime} = usePlaybackControl();
    const {zoom} = useContext(ScaleDisplayContext);


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

    }, [status, zoom])

    return (
        <div className="track-timeline-time-col" ref={ref}/>
    )
}