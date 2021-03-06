import {Scrobble} from "./scrobbler/parse_track";

// export const connectApplicationLibreFm = (apiKey: string) => connectApplication(libreApi, apiKey);

export interface LibreScrobbleTrack {
    timestamp: number;
    track: string;
    artist: string;
    album?: string;
    mbid?: string;
    duration?: string;
    trackNumber?: string;
}

const createLibreScrobble = (
    timestamp: number,
    track: string,
    artist: string,
    album?: string,
    mbid?: string,
    duration?: string,
    trackNumber?: string): LibreScrobbleTrack => ({
    timestamp,
    track,
    artist,
    album,
    mbid,
    duration,
    trackNumber,
});

export const convertToLibreScrobbles = (arr: Scrobble[]): LibreScrobbleTrack[] => arr.map((s) =>
    createLibreScrobble(s.uts, s.name, (s.artist && s.artist.name) || "", s.album && s.album.name, s.mbid, s.duration, s.trackNumber));

// export const createUrl = (api_method: string,
//                           fromUser: string,
//                           api_key: string,
//                           startpage: number,
//                           limit: number = 2) =>
//     `${baseurl}method=${api_method}&user=${fromUser}&api_key=${api_key}&limit=${limit}&page=${startpage}&format=json`;