export function isObjectEqualOrContains (target: any, value: any): boolean {
    if (target === value) return true;
    if (!target) return false;
    if (typeof target !== "object") return false;
    const keys = Object.keys(target);
    for (let key of keys) {
        if (isObjectEqualOrContains(target[key], value)) return true;
    }
    return false;
}