export const keyMap = new WeakMap<any[], string[]>();
const generateKeyId = (i => () => String(`u_${i++}`))(0)
export function getArrayKey(array: any[], index: number): string {
    const keyArray = settleKeys(array);
    return keyArray[index];
}
export function getArrayKeyIndex(array: any[], key: string): number|null {
    const keyArray = settleKeys(array);
    const index = keyArray.indexOf(key);
    if (index >= 0) return index;
    return null;
}

function settleKeys(array: any[]): string[]{
    let keyArray = keyMap.get(array);
    if (!keyArray) {
        keyArray = array.map(() => generateKeyId());
        array["_settled"] = keyArray;
        keyMap.set(array, keyArray);
    } else {
        if (keyArray.length === array.length) return keyArray;
        for (let i = 0; i < array.length; i++) {
            keyArray[i] = keyArray[i] || generateKeyId();
        }
        keyArray.length = array.length
    }
    return keyArray;
}