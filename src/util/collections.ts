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