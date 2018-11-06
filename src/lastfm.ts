const baseurl = "https://ws.audioscrobbler.com/2.0/?";

export const apiMethodDefault = "user.getrecenttracks";

export const createUrl = (api_method: string, userLastFm: string, api_key: string, startpage: number) =>
    `${baseurl}method=${api_method}&user=${userLastFm}&api_key=${api_key}&limit=200&page=${startpage}&format=json`;