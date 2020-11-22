export function isArraysEqual(arrA?: any[], arrB?: any[]): boolean {
    if (arrA === arrB) return true;
    if (!arrA || !arrB) return false;
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i++) {
        if (!Object.is(arrA[i], arrB[i])) return false
    }
    return true;
}