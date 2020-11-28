import parseRender from "@plix-effect/core";
import {hslaToRgba} from "@plix-effect/core/color";
import {Effect} from "@plix-effect/core/types";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixJsonData} from "@plix-effect/core/types/parser";

declare const self: Worker;

let canvas: OffscreenCanvas;
let canvasCtx: OffscreenCanvasRenderingContext2D;

onmessage = (event) => {
    const msg = event.data as CanvasWorkerInputMessage;
    if (msg.type === "init") {
        canvas = msg.canvas;
        canvasCtx = canvas.getContext("2d");
    } else if (msg.type === "effect") {
        const {width, height, render, track, duration, count} = msg;

        canvas.width = width;
        canvas.height = height;

        const parseData = parseRender(render, track.effects, track.filters, effectConstructorMap, filterConstructorMap );
        const effectKeys = Object.keys(parseData.effectsMap).sort();
        const filterKeys = Object.keys(parseData.filtersMap).sort();

        self.postMessage([effectKeys, filterKeys], []);

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
        const imageData = canvasCtx.createImageData(width, height);
        imageData.data.set(colorMap);
        canvasCtx.putImageData(imageData, 0, 0);
    }
}

export type CanvasWorkerInputMessage =
    | CanvasWorkerInputMessageInit
    | CanvasWorkerInputMessageEffect

export interface CanvasWorkerInputMessageInit {
    type: "init"
    canvas: OffscreenCanvas
}

export interface CanvasWorkerInputMessageEffect {
    type: "effect"
    width: number,
    height: number,
    render: PlixEffectJsonData,
    track: PlixJsonData,
    duration: number,
    count: number,
}

export type CanvasWorkerOutputMessage = [string[], string[]]