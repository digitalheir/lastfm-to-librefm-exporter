// const badXmlPattern = /\xef\xbf\xbe/g;
const rgxBadPattern = /[\0-\x08\x0b-\x1f]|\xef\xbf\xbe/g;

export const sanitizeString = (str: string) => str.replace(rgxBadPattern, "");

export const parseRawScrobble = (obj:any) => null;
export const parseArtist = (obj:any) => null;
