import {PlixColor} from "@plix-effect/core/color";

export type FieldElementPosition = [number, number];

type AbstractFieldElement<T = string, P = any, G = any> = {
    type: T,
    props: P,
    geometry: G
}


export type FieldElementPixelProperties = {
    color?: PlixColor,
    shape: "circle"|"square",
    size: number
}
export type FieldElementPixelGeometry = FieldElementPosition
export type FieldElementPixel = AbstractFieldElement<"pixel", FieldElementPixelProperties, FieldElementPixelGeometry>

export type FieldElementLineProperties = {
    color?: PlixColor,
    width: number
}
export type FieldElementLineGeometry = FieldElementPosition[]
export type FieldElementLine = AbstractFieldElement<"line", FieldElementLineProperties, FieldElementLineGeometry>


export type FieldElement =
    | FieldElementPixel
    | FieldElementLine
;