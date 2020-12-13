import {PlixGradientData} from "@plix-effect/core/dist/parser/parseGradient";
import {useMemo} from "react";
import {toRgba} from "@plix-effect/core/color";
import parseColor from "@plix-effect/core/dist/parser/parseColor";


export const gradientToHtmlString = (gradientData: PlixGradientData): string => {
    if (!gradientData || gradientData.length == 0) {
        return `rgba(${0},${0},${0},${0})`
    }
    if (gradientData.length == 1) {
        const v = gradientData[0];
        const {r,g,b,a} = toRgba(parseColor(v[1], null))
        return `rgba(${r},${g},${b},${a})`
    }
    const clrs = gradientData.map((v) => {
        const {r,g,b,a} = toRgba(parseColor(v[1], null));
        const percent = v[0]*100;
        return `rgba(${r},${g},${b},${a}) ${percent}%`
    }).join(", ");
    return `linear-gradient(90deg , ${clrs})`
}