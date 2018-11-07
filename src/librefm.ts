import {connectApplication, createScrobbleFormData} from "./scrobbler/scrobbler_api";
import {Scrobble} from "./parse_track";

export const libreApi = "https://libre.fm/api/";
export const libre2_0 = "https://libre.fm/2.0/";

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
//                           userLastFm: string,
//                           api_key: string,
//                           startpage: number,
//                           limit: number = 2) =>
//     `${baseurl}method=${api_method}&user=${userLastFm}&api_key=${api_key}&limit=${limit}&page=${startpage}&format=json`;

export function createScrobbleForm(frameName: string,
                                   apiKey: string,
                                   sk: string,
                                   secret: string,
                                   tracks: Scrobble[]) {
    const form = document.createElement("form");
    //form.appendChild(input("",true));
    form.target = frameName;
    form.method = "post";
    form.action = libre2_0;

    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = `Retry scrobbling ${tracks.length} tracks to Libre.fm`;
    form.appendChild(submit);

    const formData = createScrobbleFormData(convertToLibreScrobbles(tracks), apiKey, sk, secret);
    formData.forEach((v, k) => {
        const inp = document.createElement("input");
        inp.type = "hidden";
        // inp.type = "text";
        inp.value = v.toString();
        inp.name = k;
        form.appendChild(inp);
    });
    const inp = document.createElement("input");
    inp.type = "hidden";
    inp.value = "json";
    inp.name = "format";
    form.appendChild(inp);
    return {form, submit};
}