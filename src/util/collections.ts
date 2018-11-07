export function splitArray<T>(arr: T[], bucketSize: number): T[][] {
    const buckets = [];
    let bucket = [];
    buckets.push(bucket);
    arr.forEach((el) => {
        if (bucket.length >= bucketSize) {
            bucket = [];
            buckets.push(bucket);
        }
        bucket.push(el);
    });
    return buckets;
}

export const urlEncodeParams = (params: string[][], encode: boolean = false) => params.map(p => `${p[0]}=${encode ? encodeURIComponent(p[1]) : p[1]}`).join("&");