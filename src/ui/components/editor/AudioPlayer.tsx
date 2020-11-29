import React, {FC, useContext, useEffect, useRef} from "react";
import {usePlaybackControl, usePlaybackData, usePlaybackStatus} from "./PlaybackContext";
import {AudioFileContext} from "./AudioFileContext";

export const AudioPlayer: FC = () => {
    const lastUrlRef = useRef<string>("");
    const file = useContext(AudioFileContext);
    const audioRef = useRef<HTMLAudioElement>();
    const {getPlayTime, stop} = usePlaybackControl();
    const {playFromStamp} = usePlaybackData();
    const status = usePlaybackStatus();

    useEffect(() => {

        if (lastUrlRef.current) {
            URL.revokeObjectURL(lastUrlRef.current);
        }
        if (file) {
            const url = URL.createObjectURL(file);
            lastUrlRef.current = url;
            audioRef.current.src = url;
            // preload audio
            audioRef.current.play().then(() => {
                stop();
                audioRef.current.pause();
            });
        } else {
            audioRef.current.src = "";
            stop();
        }

    }, [file]);

    useEffect(() => {
        void playFromStamp;
        if (status !== "play") {
            audioRef.current.pause();
        } else {
            const time = getPlayTime();
            audioRef.current.currentTime = time/1000;
            if (audioRef.current.currentSrc) audioRef.current.play();
        }
    }, [status, playFromStamp])

    return (
        <audio ref={audioRef} preload="auto" />
    )

}