import {EventEmitter} from "events";

export interface ITypedEventEmitter<T> {
    addListener<E extends keyof T>(event: E, listener: T[E]): this;
    eventNames(): (keyof T)[];
    getMaxListeners(): number;
    // listenerCount<E extends keyof T>(event: E): number;
    listeners<E extends keyof T>(event: E): Function[];
    off<E extends keyof T>(event: E, listener: T[E]): this;
    on<E extends keyof T>(event: E, listener: T[E]): this;
    once<E extends keyof T>(event: E, listener: T[E]): this;
    prependListener<E extends keyof T>(event: E, listener: T[E]): this;
    prependOnceListener<E extends keyof T>(event: E, listener: T[E]): this;
    removeAllListeners<E extends keyof T>(event: E): this;
    removeListener<E extends keyof T>(event: E, listener: T[E]): this;
    setMaxListeners(maxListeners: number): this;
}

declare class TypedEventEmitterImpl<T> implements ITypedEventEmitter<T>{
    protected emit<E extends keyof T>(event: E, ...args: [T[E]] extends [((...args: infer U) => any)] ? U : ([T[E]] extends [void] ? [] : [T[E]])): boolean;

    addListener<E extends keyof T>(event: E, listener: T[E]): this;
    eventNames(): (keyof T)[];
    getMaxListeners(): number;
    // listenerCount<E extends keyof T>(event: E): number;
    listeners<E extends keyof T>(event: E): Function[];
    off<E extends keyof T>(event: E, listener: T[E]): this;
    on<E extends keyof T>(event: E, listener: T[E]): this;
    once<E extends keyof T>(event: E, listener: T[E]): this;
    prependListener<E extends keyof T>(event: E, listener: T[E]): this;
    prependOnceListener<E extends keyof T>(event: E, listener: T[E]): this;
    removeAllListeners<E extends keyof T>(event: E): this;
    removeListener<E extends keyof T>(event: E, listener: T[E]): this;
    setMaxListeners(maxListeners: number): this;
    protected emit<E extends keyof T>(event: E, ...args: any)
}
export const TypedEventEmitter = EventEmitter as any as typeof TypedEventEmitterImpl;