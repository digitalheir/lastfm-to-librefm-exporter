import {connectApplication, createSessionUrl} from "./scrobbler_api";

const baseUrl = "https://ws.audioscrobbler.com/2.0/";
const lastFmBase = "https://www.last.fm/api/";
const baseurl = baseUrl+"?";

export const apiMethodDefault = "user.getrecenttracks";

export const createUrl = (api_method: string,
                          userLastFm: string,
                          api_key: string,
                          startpage: number,
                          limit: number = 2) =>
    `${baseurl}method=${api_method}&user=${userLastFm}&api_key=${api_key}&limit=${limit}&page=${startpage}&format=json`;

export const createSessionUrlLastFm = (apiKey: string, token: string) => createSessionUrl(baseUrl, apiKey, token);
export const connectApplicationLastFm = (apiKey: string) => connectApplication(lastFmBase, apiKey);