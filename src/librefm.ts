export interface LibreScrobbleTrack {
    timestamp: number;
    track: string;
    artist: string;
    album?: string;
    mbid?: string;
    duration?: string;
    trackNumber?: string;
}

function createToken(pwd: string): string {
    return "?";
    // md5hash(md5hash(pwd) + Date.now.toString()).hexdigest();
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

// export const createUrl = (api_method: string,
//                           userLastFm: string,
//                           api_key: string,
//                           startpage: number,
//                           limit: number = 2) =>
//     `${baseurl}method=${api_method}&user=${userLastFm}&api_key=${api_key}&limit=${limit}&page=${startpage}&format=json`;