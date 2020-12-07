import React, {FC, useContext, useEffect, useRef} from "react";
import {usePlaybackControl, usePlaybackData, usePlaybackStatus} from "./PlaybackContext";
import {AudioFileContext} from "./AudioFileContext";

export const AudioPlayer: FC = () => {
    const lastUrlRef = useRef<string>("");
    const {audioFile} = useContext(AudioFileContext);
    const audioRef = useRef<HTMLAudioElement>();
    const {getPlayTime, stop} = usePlaybackControl();
    const {playFromStamp, rate} = usePlaybackData();
    const status = usePlaybackStatus();

    useEffect(() => {

        if (lastUrlRef.current) {
            URL.revokeObjectURL(lastUrlRef.current);
        }
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            lastUrlRef.current = url;
            audioRef.current.src = url;
            audioRef.current.load();

            // preload audio
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                stop();
            });
        } else {
            lastUrlRef.current = "";
            audioRef.current.src = "";
            stop();
        }

    }, [audioFile]);

    useEffect(() => {
        void playFromStamp;
        if (status !== "play") {
            audioRef.current.pause();
        } else {
            const time = getPlayTime();
            audioRef.current.currentTime = time/1000;
            audioRef.current.playbackRate = rate;
            if (lastUrlRef.current) audioRef.current.play().then(() => {
                let time = getPlayTime();
                if (time !== null) audioRef.current.currentTime = time/1000;
            });
        }
    }, [status, playFromStamp, rate])

    return (
        <audio ref={audioRef} preload="auto" />
    )

}