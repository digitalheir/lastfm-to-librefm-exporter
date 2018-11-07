export function parseFiniteInt(s: string, fallback: number) {
    const parseInt1 = parseInt(s);
    return isFinite(parseInt1) ? parseInt1 : fallback;
}