const paramsRegex = /([^&=]+)=?([^&]*)/g;
const decode = (s: string) => decodeURIComponent(s.replace(/\s+/g, ""));

export function parseUrlParams(params: string | null): any {
    if (params) {
        const urlParams: any = {};
        const query = params.substring(1);

        let match;
        while (match = paramsRegex.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    } else return {};
}

export const getCurrentHostName = (window: any): string => {
    if (!window) return "";
    const location = window.location;
    if (!location) return "";
    return location.hostname || "";
};