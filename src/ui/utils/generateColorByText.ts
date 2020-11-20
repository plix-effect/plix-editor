export function generateColorByText(value: string){
    let v = 0;
    for (let i = 0; i < value.length; i++) {
        v = v + value.charCodeAt(i) + i;
    }
    return `hsla(${v%360},100%, 30%)`;
}