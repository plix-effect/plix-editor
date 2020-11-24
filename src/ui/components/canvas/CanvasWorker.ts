import parseRender from "@plix-effect/core";
import {hslaToRgba} from "@plix-effect/core/color";
import {Effect} from "@plix-effect/core/types";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixJsonData} from "@plix-effect/core/types/parser";

onmessage = (event) => {
    const {width, height, render, track, duration, count} = event.data as CanvasWorkerInputMessage;

    const parseData = parseRender(render, track.effects, track.filters, effectConstructorMap, filterConstructorMap );
    const effectKeys = Object.keys(parseData.effectsMap).sort();
    const filterKeys = Object.keys(parseData.filtersMap).sort();

    self.postMessage([effectKeys, filterKeys], null);

    const effect: Effect = parseData.effect;
    const colorMap = new Uint8ClampedArray(width*height*4);
    for (let h=0; h<height; h++){
        const line = effect(h/height*duration, duration);
        for (let w=0; w<width; w++){
            const mod = line(w/width*count, count);
            const color = mod([0,0,0,0]);
            const {r,g,b,a} = hslaToRgba(color);
            const index = ((h*width) + w) * 4;
            colorMap[index] = r;
            colorMap[index+1] = g;
            colorMap[index+2] = b;
            colorMap[index+3] = (a*255)|0;
        }
    }
    self.postMessage(colorMap, null);
}

export interface CanvasWorkerInputMessage {
    width: number,
    height: number,
    render: PlixEffectJsonData,
    track: PlixJsonData,
    duration: number,
    count: number,
}

export type CanvasWorkerOutputMessage = [string[], string[]] | Uint8ClampedArray