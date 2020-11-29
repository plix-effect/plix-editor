import MP3Tag from "mp3tag.js";
import {inflate, deflate} from "pako";

const OWNER_ID = "plix-effect";

export function readMp3Json(buffer: ArrayBuffer): object|null {
    const mp3tag = new MP3Tag(buffer, false);
    mp3tag.read();
    const priv: undefined|{ownerId:string, data: number[]}[] = mp3tag.tags.v2.PRIV;
    if (!priv) return null;
    const plixTag = priv.find(tag => tag.ownerId === OWNER_ID);
    if (!plixTag) return null;
    try {
        const text = inflate(plixTag.data, { to: 'string' });
        return JSON.parse(text);
    } catch {}
    return null;
}

export function setMp3Json(buffer: ArrayBuffer, json: object): ArrayBuffer {
    const mp3tag = new MP3Tag(buffer, false);
    mp3tag.read();
    mp3tag.tags.v2.PRIV = [{
        ownerId: `${OWNER_ID}\0`, // mp3tag bug. ownerId must be null-terminated
        data: deflate(JSON.stringify(json)),
    }];
    mp3tag.save();
    return mp3tag.buffer;
}