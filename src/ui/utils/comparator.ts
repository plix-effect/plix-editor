export function abComparator(a: string, b: string){
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    if (la > lb) return 1;
    if (la < lb) return -1;
    if (a > b) return 1;
    if (a < b) return 1;
    return 0;
}