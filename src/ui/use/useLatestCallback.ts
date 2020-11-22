import { useRef, useCallback } from "react";

export default function useLatestCallback<T extends (...args: any[]) => any>(handler: T): T {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;
	const callback = useCallback(function(this: ThisType<T>, ...args: Parameters<T>) {
		return handlerRef.current.call(this, ...args);
	}, []);
	return callback as T;
}
