import parseRender from "@plix-effect/core";
import {hslaToRgba} from "@plix-effect/core/color";
import {Effect} from "@plix-effect/core/types";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";

onmessage = (e) => {
    const [width, height, render, track] = e.data;

    const parseData = parseRender(render, track.effects, track.filters, effectConstructorMap, filterConstructorMap );
    const effect: Effect = parseData.effect;
    const colorMap = new Uint8ClampedArray(width*height*4);
    for (let h=0; h<height; h++){
        const line = effect(h, height);
        for (let w=0; w<width; w++){
            const mod = line(w, width);
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