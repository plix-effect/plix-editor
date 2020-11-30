import React, {createContext, FC, useContext, useEffect, useMemo, useRef, useState} from "react";
import useLatestCallback from "../../use/useLatestCallback";


interface PlaybackDataContextProps {
    playFromStamp: number|null;
    repeatStart: number|null;
    repeatEnd: number|null;
    rate: number|null;
    pauseTime: number|null;
    repeat: boolean;
}
const PlaybackDataContext = createContext<PlaybackDataContextProps|null>(null);
export type PlaybackStatus = "play"|"stop"|"pause";
const PlaybackStatusContext = createContext<PlaybackStatus>("stop");

interface PlaybackControlContextProps {
    getPlayTime: () => number|null
    play: (time?: number, rate?: number, repeat?: boolean, repeatStart?: number, repeatEnd?: number) => void
    pause: (time?: number) => void
    stop: () => void
}
const PlaybackControlContext = createContext<PlaybackControlContextProps|null>(null);

export interface CreatePlaybackProps {
    duration: number;
}
export const CreatePlayback: FC<CreatePlaybackProps> = ({children, duration}) => {
    interface PlayData {
        status: PlaybackStatus,
        playFromStamp: number|null,
        pauseTime: number|null,
        rate: number|null,
        repeat: boolean,
        repeatStart: number|null,
        repeatEnd: number|null,
    }
    const [playData, setPlayData] = useState<PlayData>({
        status: "stop",
        playFromStamp: null,
        pauseTime: null,
        rate: 1,
        repeat: false,
        repeatStart: null,
        repeatEnd: null,
    })
    const lastTimeoutRef = useRef<number|null>(null);

    const getPlayTime = useLatestCallback(() => {
        if (playData.status === "pause") return playData.pauseTime;
        if (playData.status === "stop") return null;
        if (playData.status === "play") {
            return (performance.now() - Number(playData.playFromStamp)) * playData.rate;
        }
    });

    const stop = useLatestCallback(() => {
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        setPlayData(playData => ({
            ...playData,
            status: "stop",
            pauseTime: null,
        }));
    });

    const pause = useLatestCallback((pauseTime?: number) => {
        let time = pauseTime == null ? (getPlayTime()||0) : pauseTime;
        if (time < 0) time = 0;
        if (time > duration) time = duration;
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        setPlayData(playData => ({
            ...playData,
            status: "pause",
            playFromStamp: null,
            pauseTime: time,
        }));
    });

    const play = useLatestCallback((from?: number, rate:number = null, repeat: boolean|undefined = null, repeatStart: number = 0, repeatEnd?: number|null) => {
        if (lastTimeoutRef.current !== null) clearTimeout(lastTimeoutRef.current);
        if (repeatEnd <= repeatStart) return pause(Math.min(repeatEnd, duration));
        if (repeatEnd == null) repeatEnd = duration;
        if (from == null) from = getPlayTime();
        if (from >= duration) return pause(duration);
        if (from >= repeatEnd) from = repeatStart;
        const playFromStamp = performance.now() - (from / rate);
        const segmentRepeat = (repeat == null) ? (playData.repeat) : repeat;
        const segmentRate = (rate == null) ? (playData.rate??1) : rate||1;
        const segmentDuration = (repeatEnd - from) / segmentRate;
        setPlayData({
            playFromStamp: playFromStamp,
            repeat: segmentRepeat,
            rate: segmentRate,
            pauseTime: null,
            repeatEnd: repeatEnd,
            repeatStart: repeatStart,
            status: "play",
        });
        lastTimeoutRef.current = +setTimeout(() => {
            if (!segmentRepeat) return pause(repeatStart);
            return play(repeatStart, rate, repeat, repeatStart, repeatEnd);
        },segmentDuration);
    });

    useEffect(stop, [duration]);

    const playbackControlValue = useMemo<PlaybackControlContextProps>(() => ({
        getPlayTime, pause, play, stop
    }), [getPlayTime, pause, play, stop]);

    const playbackStatusValue = useMemo<PlaybackDataContextProps>(() => ({
        playFromStamp: playData.playFromStamp,
        repeatStart: playData.repeatStart,
        rate: playData.rate,
        repeatEnd: playData.repeatEnd,
        pauseTime: playData.pauseTime,
        repeat: playData.repeat,
    }), [playData.playFromStamp, playData.repeatEnd, playData.repeatStart, playData.pauseTime, playData.repeat, playData.rate]);

    return (
        <PlaybackControlContext.Provider value={playbackControlValue}>
            <PlaybackDataContext.Provider value={playbackStatusValue}>
                <PlaybackStatusContext.Provider value={playData.status}>
                    {children}
                </PlaybackStatusContext.Provider>
            </PlaybackDataContext.Provider>
        </PlaybackControlContext.Provider>
    );
}

export function usePlaybackStatus(): PlaybackStatus{
    return useContext(PlaybackStatusContext);
}

export function usePlaybackData(): PlaybackDataContextProps{
    return useContext(PlaybackDataContext);
}

export function usePlaybackControl(): PlaybackControlContextProps{
    return useContext(PlaybackControlContext);
}