import {useCallback, useEffect} from "react";
import useLatestCallback from "./useLatestCallback";

export const useClickOutside = (ref, callback, subscribed) => {
    const latestCallback = useLatestCallback(callback);
    const handleClickOutside = useCallback((event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            latestCallback(event.current);
        }
    }, [ref, latestCallback])

    useEffect(() => {
        if (subscribed) document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [subscribed]);
}