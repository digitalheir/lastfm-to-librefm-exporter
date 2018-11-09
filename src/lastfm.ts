import {connectApplication, createSessionUrl} from "./scrobbler/scrobbler_api";
import {last2_0} from "./scrobbler/lastConstants";

const lastFmBase = "https://www.last.fm/api/";
const baseurl = last2_0 + "?";

export const apiMethodDefault = "user.getrecenttracks";

export const createUrl = (api_method: string,
                          fromUser: string,
                          api_key: string,
                          startpage: number,
                          limit: number = 2) =>
    `${baseurl}method=${api_method}&user=${fromUser}&api_key=${api_key}&limit=${limit}&page=${startpage}&format=json`;

export const createSessionUrlLastFm = (apiKey: string, token: string, secret: string) => createSessionUrl(last2_0, apiKey, token, secret);
export const connectApplicationLastFm = (apiKey: string) => connectApplication(lastFmBase, apiKey);