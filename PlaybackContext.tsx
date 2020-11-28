import React, {createContext, FC, useEffect, useMemo, useRef, useState} from "react";
import useLatestCallback from "./src/ui/use/useLatestCallback";
export interface PlaybackStatusContextProps {
    status: "play"|"stop"|"pause",
    playFromStamp: number|null;
    endTime: number|null;
    pauseTime: number|null;
    repeat: boolean;
}
export const PlaybackStatusContext = createContext<PlaybackStatusContextProps|null>(null);

export interface PlaybackControlContextProps {
    getPlayTime: () => number|null
    play: (startTime?: number, repeat?: boolean, endTime?: number|null) => void
    pause: (time?: number) => void
    stop: () => void
}
export const PlaybackControlContext = createContext<PlaybackControlContextProps|null>(null);

export interface CreatePlaybackProps {
    duration: number;
}
export const CreatePlayback: FC<CreatePlaybackProps> = ({children, duration}) => {
    interface PlayData {
        playFromStamp: number|null,
        pauseTime: number|null,
        endTime: number|null,
        repeat: boolean,
        status: "play"|"stop"|"pause",
    }
    const [playData, setPlayData] = useState<PlayData>({
        playFromStamp: null,
        repeat: false,
        pauseTime: null,
        endTime: null,
        status: "stop",
    })
    const lastTimeoutRef = useRef<number|null>(null);

    const getPlayTime = useLatestCallback(() => {
        if (playData.status === "pause") return playData.pauseTime;
        if (playData.status === "stop") return null;
        if (playData.status === "play") return performance.now() - Number(playData.playFromStamp);
    });

    const stop = useLatestCallback(() => {
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        setPlayData({
            playFromStamp: null,
            repeat: false,
            pauseTime: null,
            endTime: null,
            status: "stop",
        });
    });

    const pause = useLatestCallback((pauseTime?: number) => {
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        setPlayData({
            playFromStamp: null,
            repeat: false,
            pauseTime: pauseTime == null ? (getPlayTime()||0) : pauseTime,
            endTime: null,
            status: "stop",
        });
    });

    const play = useLatestCallback((startTime: number = 0, repeat: boolean = false, endTime?: number|null) => {
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        if (endTime == null) endTime = duration;
        if (startTime >= duration) return pause(duration)
        const playFromStamp = performance.now() - startTime;
        const segmentDuration = endTime - startTime;
        setPlayData({
            playFromStamp: playFromStamp,
            repeat: false,
            pauseTime: null,
            endTime: endTime,
            status: "play",
        });
        lastTimeoutRef.current = +setTimeout(() => {
            if (!repeat) return pause(endTime);
            return play(startTime, repeat, endTime);
        },segmentDuration);
    });

    useEffect(stop, [duration]);

    const playbackControlValue = useMemo<PlaybackControlContextProps>(() => ({
        getPlayTime, pause, play, stop
    }), [getPlayTime, pause, play, stop]);

    const playbackStatusValue = useMemo<PlaybackStatusContextProps>(() => playData, [playData]);

    return (
        <PlaybackControlContext.Provider value={playbackControlValue}>
            <PlaybackStatusContext.Provider value={playbackStatusValue}>
                {children}
            </PlaybackStatusContext.Provider>
        </PlaybackControlContext.Provider>
    );

}