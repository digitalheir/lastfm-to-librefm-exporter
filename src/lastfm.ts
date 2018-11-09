import {connectApplication, createSessionUrl} from "./scrobbler/scrobbler_api";
import {last2_0} from "./scrobbler/lastConstants";

const lastFmBase = "https://www.last.fm/api/";

export const apiMethodDefault = "user.getrecenttracks";


export const createSessionUrlLastFm = (apiKey: string, token: string, secret: string) => createSessionUrl(last2_0, apiKey, token, secret);
export const connectApplicationLastFm = (apiKey: string) => connectApplication(lastFmBase, apiKey);