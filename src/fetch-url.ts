export const createRequest = (url: string, onLoad?: () => any, onError?: () => any) => {
    const req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open("GET", url, true);
    if (onError) {
        req.onerror = onError;
    }
    if (onLoad) {
        req.onload = onLoad;
    }
    return req;
};