// const badXmlPattern = /\xef\xbf\xbe/g;
const rgxBadPattern = /[\0-\x08\x0b-\x1f]|\xef\xbf\xbe/g;

export const sanitizeString = (str: string | undefined) => str && str.replace(rgxBadPattern, "");

interface Mbid {
    name?: string;
    mbid?: string;
}

interface Artist extends Mbid {
}

interface Album extends Mbid {
}

export interface Scrobble {
    artist?: Artist;
    name?: string;
    mbid?: string;
    album?: Album;
    uts?: number;
    duration?: string;
    trackNumber?: string;
}

export const parseRawScrobble = (track: any): Scrobble => ({
    artist: parseArtist(track.artist),
    name: sanitizeString(track.name || undefined),
    mbid: sanitizeString(track.mbid || undefined),
    duration: sanitizeString(track.duration || undefined),
    trackNumber: sanitizeString(track.trackNumber || undefined),
    album: parseAlbum(track.album),
    uts: (track.date && track.date.uts) || undefined,
});

const parseNameMbid = (obj: any | undefined) => obj ? ({
    name: sanitizeString(obj["#text"] || undefined),
    mbid: sanitizeString(obj.mbid || undefined),
}) : undefined;

export const parseArtist = (obj: any) => parseNameMbid(obj);
const parseAlbum = (obj: any) => parseNameMbid(obj);

