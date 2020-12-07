import {useEffect, useState} from "react";

const dispatchStorageEvent = (storage, key: string, newValue: any, oldValue: any) => {
    const e = document.createEvent( 'StorageEvent' ) as any;
    e.initStorageEvent('storage', true, false, key, oldValue, newValue, location.href, storage);
    window.dispatchEvent(e);
};

const useStorage = <T>(storage: (typeof localStorage | typeof sessionStorage), key: string, defaultValue?: T) => {
    const [value, setValue] = useState(
        getStorageValue<T>(storage,key,defaultValue)
    );

    useEffect(() => {
        const item = getStorageValue(storage, key, defaultValue);
        setValue(JSON.parse(item as any));

        const onStorageUpdate = (event) => {
            if (event.key !== key) return;
            // const item = getStorageValue(storage, key, defaultValue);
            // setValue(item);
            setValue(JSON.parse(event.newValue));
        };
        window.addEventListener("storage", onStorageUpdate);
        return () => {window.removeEventListener("storage", onStorageUpdate)}
    },[key]);

    const set = (val) => {
        const oldValue = value;
        if (typeof val === "function") val = val(oldValue);
        const stringifiedValue = JSON.stringify(val);
        storage.setItem(key, stringifiedValue);
        dispatchStorageEvent(storage, key, val, oldValue);
    };

    const remove = () => {
        const oldValue = value;
        storage.removeItem(key);
        dispatchStorageEvent(storage, key, undefined, oldValue);
    };

    return [value, set, remove] as const
};

export const getStorageValue = <T>(storage:  (typeof localStorage), key: string, defaultValue: T): T => {
    const item = storage.getItem(key);
    if (item === null) return defaultValue;
    try {
        return JSON.parse(item);
    } catch (e) {
        return item as any;
    }
};

export const useLocalStorage = <T>(key: string, defaultValue?: T) => {
    return useStorage<T>(localStorage, key, defaultValue)
};

export const useSessionStorage = <T>(key: string, defaultValue?: T) => {
    return useStorage<T>(sessionStorage, key, defaultValue)
};