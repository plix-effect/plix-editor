export function generateColorByText(value: string, s=1, l=0.5, a=1){
    let v = 0;
    for (let i = 0; i < value.length; i++) {
        v = v + value.charCodeAt(i) + i;
    }
    return `hsla(${v%360},${s*100}%, ${l*100}%, ${a})`;
}