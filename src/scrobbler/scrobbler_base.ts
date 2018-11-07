// import {md5hash} from "../md5";
//
// const SCROBBLER_OPTIONS = [
//     /**
//      * Scrobbler label.
//      * @type {String}
//      */
//     "label",
//     /**
//      * Storage namespace in which scrobbler options are stored.
//      * @type {String}
//      */
//     "storage",
//     /**
//      * URL used to execute API methods.
//      * @type {String}
//      */
//     "apiUrl",
//     /**
//      * URL used to authenticate user.
//      * @type {String}
//      */
//     "authUrl",
//     /**
//      * URL used to view service status.
//      * @type {String}
//      */
//     "statusUrl",
//     /**
//      * URL used to view user profile.
//      * @type {String}
//      */
//     "profileUrl",
//     /**
//      * Service API key.
//      * @type {String}
//      */
//     "apiKey",
//     /**
//      * Service API secret.
//      * @type {String}
//      */
//     "apiSecret"
// ];
//
// interface Opts {
//     label: string;
//     storage: string;
//     apiUrl: string;
//     apiKey: string;
//     apiSecret: string;
//     authUrl: string;
//     statusUrl?: string;
//     profileUrl: string;
// }
//
// class BaseScrobbler {
//     private opts: Opts;
//
//     constructor(opts: Opts) {
//         this.opts = opts;
//     }
//
//     // /**
//     //  * Fetch auth URL where user should grant permissions to our token.
//     //  *
//     //  * Stores the new obtained token into storage so it will be traded for
//     //  * a new session when needed. Because of this it is necessary this method
//     //  * is called only when user is really going to approve the token and
//     //  * not sooner. Otherwise use of the token would result in an unauthorized
//     //  * request.
//     //  *
//     //  * See http://www.last.fm/api/show/auth.getToken
//     //  *
//     //  * @return {Promise} Promise that will be resolved with the auth URL
//     //  */
//     // getAuthUrl() {
//     //     const params = {
//     //         method: "auth.gettoken",
//     //     };
//     //     return this.doRequest("GET", params, false).then(($doc) => {
//     //         return this.storage.get().then((data) => {
//     //             // set token and reset session so we will grab a new one
//     //             delete data.sessionID;
//     //             delete data.sessionName;
//     //             data.token = $doc.find("token").text();
//     //
//     //             const authUrl = `${this.authUrl}?api_key=${this.apiKey}&token=${data.token}`;
//     //             return this.storage.set(data).then(() => {
//     //                 this.debugLog(`Auth url: ${authUrl}`);
//     //                 return authUrl;
//     //             });
//     //         });
//     //     }).catch(() => {
//     //         this.debugLog("Error acquiring a token", "warn");
//     //
//     //         return this.storage.get().then((data) => {
//     //             delete data.token;
//     //             return this.storage.set(data).then(() => {
//     //                 throw new Error("Error acquiring a token");
//     //             });
//     //         });
//     //     });
//     // }
//     // /**
//     //  * Remove session info.
//     //  * @return {Promise} Promise that will be resolved when the task has complete
//     //  */
//     // signOut() {
//     //     return this.storage.get().then((data) => {
//     //         // data.token = null;
//     //         delete data.sessionID;
//     //         delete data.sessionName;
//     //
//     //         return this.storage.set(data);
//     //     });
//     // }
//
//     /**
//      * Get status page URL.
//      * @return {String} Status page URL
//      */
//     getStatusUrl() {
//         return this.opts.statusUrl;
//     }
//
//     /**
//      * Get URL to profile page.
//      * @return {Promise} Promise that will be resolved with URL
//      */
//     getProfileUrl() {
//         return this.getSession().then((session) => {
//             return `${this.opts.profileUrl}${session.sessionName}`;
//         });
//     }
//
//     /**
//      * Load session data from storage. Get new session data if previously
//      * saved session data is missing.
//      *
//      * If there is a stored token it is preferably traded for a new session
//      * which is then returned.
//      *
//      * @return {Promise} Promise that will be resolved with the session data
//      */
//     getSession() {
//         return this.opts.storage.get().then((data) => {
//             // if we have a token it means it is fresh and we
//             // want to trade it for a new session ID
//             const token = data.token || null;
//             if (token !== null) {
//                 return this.tradeTokenForSession(token).then((session) => {
//                     return this.opts.storage.set(session).then(() => {
//                         return session;
//                     });
//                 }).catch(() => {
//                     this.debugLog("Failed to trade token for session", "warn");
//
//                     // both session and token are now invalid
//                     return this.signOut().then(() => {
//                         throw new ServiceCallResult(ServiceCallResult.ERROR_AUTH);
//                     });
//                 });
//             } else if (!data.sessionID) {
//                 throw new ServiceCallResult(ServiceCallResult.ERROR_AUTH);
//             } else {
//                 return {
//                     sessionID: data.sessionID,
//                     sessionName: data.sessionName
//                 };
//             }
//         });
//     }
//
//     /**
//      * Make a call to API to trade token for session ID.
//      * Assume the token was authenticated by the user.
//      *
//      * @param {String} token Token provided by scrobbler service
//      * @return {Promise} Promise that will be resolved with the session ID
//      */
//     tradeTokenForSession(token) {
//         const params = {method: "auth.getsession", token};
//
//         return this.doRequest("GET", params, true).then(($doc) => {
//             const result = processResponse($doc);
//             if (!result.isOk()) {
//                 throw new ServiceCallResult(ServiceCallResult.ERROR_AUTH);
//             }
//
//             const sessionName = $doc.find("session > name").text();
//             const sessionID = $doc.find("session > key").text();
//
//             return {sessionID, sessionName};
//         });
//     }
//
//     /**
//      * Check if the scrobbler is waiting until user grant access to
//      * scrobbler service (means the token is in Chrome storage).
//      * @return {Promise} Promise that will be resolved with check value
//      */
//     isReadyForGrantAccess() {
//         return this.storage.get().then((data) => {
//             return data.token;
//         });
//     }
//
//     /**
//      * Compute string for signing request.
//      * See http://www.last.fm/api/authspec#8
//      * @param  {Object} params Parameters of API method
//      * @return {String} Signed parameters
//      */
//     generateSign(params) {
//         const keys = Object.keys(params).sort();
//         let o = "";
//
//         for (const key of keys) {
//             if (["format", "callback"].includes(key)) {
//                 continue;
//             }
//             o += key + params[key];
//         }
//         return md5hash(o + this.opts.apiSecret);
//     }
//
//     // /**
//     //  * Execute asynchronous request.
//     //  *
//     //  * API key will be added to params by default and all parameters will be
//     //  * encoded for use in query string internally.
//     //  *
//     //  * @param  {String} method Used method (GET or POST)
//     //  * @param  {Object} params Object of key => value url parameters
//     //  * @param  {Boolean} signed Should the request be signed?
//     //  * @return {Promise} Promise that will be resolved with parsed response
//     //  */
//     // doRequest(method, params, signed) {
//     //     params.api_key = this.opts.apiKey;
//     //
//     //     if (signed) {
//     //         params.api_sig = this.generateSign(params);
//     //     }
//     //
//     //     const queryStr = $.param(params);
//     //     const url = `${this.apiUrl}?${queryStr}`;
//     //
//     //     const promise = fetch(url, {method}).then((response) => {
//     //         return response.text().then((text) => {
//     //             const $doc = $($.parseXML(text));
//     //             const debugMsg = hideUserData($doc, text);
//     //
//     //             if (!response.ok) {
//     //                 this.debugLog(`${params.method} response:\n${debugMsg}`, "error");
//     //                 throw new ServiceCallResult(ServiceCallResult.ERROR_OTHER);
//     //             }
//     //
//     //             this.debugLog(`${params.method} response:\n${debugMsg}`);
//     //             return $doc;
//     //         });
//     //     }).catch(() => {
//     //         throw new ServiceCallResult(ServiceCallResult.ERROR_OTHER);
//     //     });
//     //
//     //     return Util.timeoutPromise(REQUEST_TIMEOUT, promise).catch(() => {
//     //         throw new ServiceCallResult(ServiceCallResult.ERROR_OTHER);
//     //     });
//     // }
//     //
//     // /**
//     //  * Asynchronously loads song info into given song object.
//     //  *
//     //  * @param  {Song} song Song instance
//     //  * @return {Promise} Promise that will be resolved with 'isValid' flag
//     //  */
//     // getSongInfo(song) {
//     //     return this.getSession().then(({sessionName}) => {
//     //         return {username: sessionName};
//     //     }).catch(() => {
//     //         return {};
//     //     }).then((params) => {
//     //         params.method = "track.getinfo";
//     //         params.artist = song.getArtist();
//     //         params.track = song.getTrack();
//     //
//     //         if (song.getAlbum()) {
//     //             params.album = song.getAlbum();
//     //         }
//     //
//     //         return this.doRequest("GET", params, false).then(($doc) => {
//     //             const result = processResponse($doc);
//     //             if (!result.isOk()) {
//     //                 throw new Error("Unable to load song info");
//     //             }
//     //
//     //             return this.parseSongInfo($doc);
//     //         }).then((data) => {
//     //             if (data) {
//     //                 this.fillSongInfo(data, song);
//     //             }
//     //
//     //             return data;
//     //         });
//     //     });
//     // }
//     //
//     // /**
//     //  * Parse service response and return parsed data.
//     //  * @param  {Object} $doc Response that parsed by jQuery
//     //  * @return {Promise} Promise that will be resolved with parsed data
//     //  */
//     // parseSongInfo($doc) {
//     //     if ($doc.find("lfm").attr("status") !== "ok") {
//     //         return null;
//     //     }
//     //
//     //     let userloved = undefined;
//     //     const userlovedStatus = $doc.find("userloved").text();
//     //     if (userlovedStatus) {
//     //         userloved = userlovedStatus === "1";
//     //     }
//     //
//     //     if (this.canCorrectSongInfo()) {
//     //         const artist = $doc.find("artist > name").text();
//     //         const track = $doc.find("track > name").text();
//     //         const album = $doc.find("album > title").text();
//     //         const duration = (parseInt($doc.find("track > duration").text()) / 1000) || null;
//     //
//     //         let artistThumbUrl = null;
//     //         const imageSizes = ["extralarge", "large", "medium"];
//     //         for (const imageSize of imageSizes) {
//     //             artistThumbUrl = $doc.find(`album > image[size="${imageSize}"]`).text();
//     //             if (artistThumbUrl) {
//     //                 break;
//     //             }
//     //         }
//     //
//     //         const artistUrl = $doc.find("artist > url").text();
//     //         const trackUrl = $doc.find("track > url").text();
//     //         const albumUrl = $doc.find("album > url").text();
//     //
//     //         return {
//     //             artist, track, album, duration, userloved,
//     //             artistThumbUrl, artistUrl, albumUrl, trackUrl
//     //         };
//     //     }
//     //
//     //     return {userloved};
//     // }
//     //
//     // /**
//     //  * Fill song info according to parsed data.
//     //  * This function is called if service is supported song info loading
//     //  * and if song data is valid.
//     //  *
//     //  * @param  {Object} data Parsed data
//     //  * @param  {Song} song Song instance
//     //  */
//     // fillSongInfo(data, song) {
//     //     // Set song as userloved if it's loved on all services.
//     //     if (data.userloved !== undefined) {
//     //         if (data.userloved) {
//     //             song.metadata.userloved = true;
//     //         } else if (song.metadata.userloved) {
//     //             song.metadata.userloved = false;
//     //         }
//     //     }
//     // }
//     //
//     // /**
//     //  * Check if service supports retrieving of song info.
//     //  * @return {Boolean} True if service supports that; false otherwise
//     //  */
//     // canLoadSongInfo() {
//     //     return false;
//     // }
//     //
//     // /**
//     //  * Check if service supports correction of song info.
//     //  * @return {Boolean} True if service supports that; false otherwise
//     //  */
//     // canCorrectSongInfo() {
//     //     return false;
//     // }
//     //
//     // /**
//     //  * Send current song as 'now playing' to API.
//     //  * @param  {Object} song Song instance
//     //  * @return {Promise} Promise that will be resolved with ServiceCallResult object
//     //  */
//     // sendNowPlaying(song) {
//     //     return this.getSession().then(({sessionID}) => {
//     //         const params = {
//     //             method: "track.updatenowplaying",
//     //             track: song.getTrack(),
//     //             artist: song.getArtist(),
//     //             api_key: this.apiKey,
//     //             sk: sessionID
//     //         };
//     //
//     //         if (song.getAlbum()) {
//     //             params.album = song.getAlbum();
//     //         }
//     //         if (song.getDuration()) {
//     //             params.duration = song.getDuration();
//     //         }
//     //
//     //         return this.doRequest("POST", params, true).then(processResponse);
//     //     });
//     // }
//
//     /**
//      * Send song to API to scrobble.
//      * @param  {Object} song Song instance
//      * @return {Promise} Promise that will be resolved with ServiceCallResult object
//      */
//     scrobble(song) {
//         return this.getSession().then(({sessionID}) => {
//             const params = {
//                 method: "track.scrobble",
//                 "timestamp[0]": song.metadata.startTimestamp,
//                 "track[0]": song.getTrack(),
//                 "artist[0]": song.getArtist(),
//                 sk: sessionID
//             };
//
//             if (song.getAlbum()) {
//                 params["album[0]"] = song.getAlbum();
//             }
//
//             return this.doRequest("POST", params, true).then(processResponse);
//         });
//     }
//
//     // /**
//     //  * Love or unlove given song.
//     //  * @param  {Object} song Song instance
//     //  * @param  {Boolean} isLoved Flag means song should be loved or not
//     //  * @return {Promise} Promise that will be resolved with ServiceCallResult object
//     //  */
//     // toggleLove(song, isLoved) {
//     //     return this.getSession().then(({sessionID}) => {
//     //         const params = {
//     //             method: isLoved ? "track.love" : "track.unlove",
//     //             track: song.getTrack(),
//     //             artist: song.getArtist(),
//     //             sk: sessionID
//     //         };
//     //
//     //         return this.doRequest("POST", params, true).then(processResponse);
//     //     });
//     // }
//     //
//     // /**
//     //  * Get the scrobbler label.
//     //  * @return {String} Scrobbler label
//     //  */
//     // getLabel() {
//     //     return this.label;
//     // }
//
//     /**
//      * Helper function to show debug output.
//      * @param  {String} text Debug message
//      * @param  {String} type Log type
//      */
//     debugLog(text, type = "log") {
//         const message = `${this.opts.label}: ${text}`;
//
//         switch (type) {
//             case "log":
//                 console.log(message);
//                 break;
//             case "warn":
//                 console.warn(message);
//                 break;
//             case "error":
//                 console.error(message);
//                 break;
//         }
//     }
// }
//
// export const LibreScrobbler = new BaseScrobbler({
//     label: "Libre.fm",
//     storage: "LibreFM",
//     apiUrl: "https://libre.fm/2.0/",
//     apiKey: "r8i1y91hz71tcx7vyrp9hk1alhqp1898",
//     apiSecret: "8187db5vg234yq6tm7o62q8mtl1niala",
//     authUrl: "https://www.libre.fm/api/auth/",
//     profileUrl: "https://libre.fm/user/",
// });
//
// const LastScrobbler = new BaseScrobbler({
//     label: "Last.fm",
//     storage: "LastFM",
//     apiUrl: "https://ws.audioscrobbler.com/2.0/",
//     apiKey: "d9bb1870d3269646f740544d9def2c95",
//     apiSecret: "2160733a567d4a1a69a73fad54c564b2",
//     authUrl: "https://www.last.fm/api/auth/",
//     statusUrl: "http://status.last.fm/",
//     profileUrl: "https://last.fm/user/",
// });