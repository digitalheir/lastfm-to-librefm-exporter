import * as React from "react";

// import {SearchContainer} from "./Search";
// import {SearchResults} from "./SearchResults";

const parseNameMbid = (obj: any | undefined) => obj ? ({
    name: obj["#text"] || undefined,
    mbid: obj.mbid || undefined,
}) : undefined;

const parseArtist = (obj) => parseNameMbid(obj);
const parseAlbum = (obj) => parseNameMbid(obj);

interface State {
    retrying: number;
    startpage: number;
    url: string | undefined;
    api_key: string;
    showJson: boolean;
    userLastFm: string;
    api_method: string;
    scrobbles: string[];
    totalPages: number;
    errorMessage: string | undefined;
    xhr: XMLHttpRequest | undefined;
}

interface Props {
}

const baseurl = 'https://ws.audioscrobbler.com/2.0/?';
const settings = (username: string,
                  startpage: number,
                  api_key: string,
                  tracktype: string) => {
    // "libre.fm":
// baseurl = 'http://alpha.libre.fm/2.0/?'
// urlvars = dict(method='user.get%s' % tracktype,
//     api_key=('lastexport.py-%s' % __version__).ljust(32, '-'),
//     user=username,
//     page=startpage,
//     limit=200)

// elif server == "last.fm":
    return {
        method: `user.get${tracktype}`,
        api_key,
        user: username,
        page: startpage,
        limit: 50,
    }
// else:
// if server[:7] != 'http://':
// server = 'http://%s' % server
// baseurl = server + '/2.0/?'
// urlvars = {method: `user.get${tracktype}`,
//     api_key=('lastexport.py-%s' % __version__).ljust(32, '-'),
//     user=username,
//     page=startpage,
//     limit=200)
};

const ErrorMessage: React.StatelessComponent<{ errorMessage: string | undefined, retrying: number }> = ({errorMessage, retrying}) =>
    errorMessage ? <div className="status-line">{errorMessage}<br/>Retrying in {retrying} seconds</div>
        : <div className="status-line">Retrying in {retrying} seconds</div>;

const StatusLine: React.StatelessComponent<{
    errorMessage: string | undefined,
    url: string | undefined,
    scrobbleNum: number,
    retrying: number
}> = ({errorMessage, url, retrying, scrobbleNum}) =>
    retrying > 0 ? <ErrorMessage errorMessage={errorMessage} retrying={retrying}/>
        : url ? <div className="status-line">Fetching <a href={url}>{url}</a></div>
        : retrying === -200 ? <div className="status-line">Received {scrobbleNum} tracks</div>
            : <div className="status-line"/>;

export class App extends React.PureComponent<Props, State> {
    state = {
        api_key: "e38cc7822bd7476fe4083e36ee69748e",
        api_method: "user.getrecenttracks",
        userLastFm: "",
        scrobbles: [],
        startpage: 1,
        totalPages: -1,
        retrying: -1,
        url: undefined,
        errorMessage: undefined,
        xhr: undefined,
        showJson: false,
    };

    fetchUrl(url: string, cb: (p: number, res: any, err: any) => any, timeout: number = -1) {
        if (timeout > 0) {
            setTimeout(() => {
                if (this.state.url === url)
                    this.actuallyFetch(url, cb, timeout)
            }, timeout * 1000)
        } else {
            this.actuallyFetch(url, cb);
        }
    }

    actuallyFetch(url: string, cb: (totalPages: number, res: any, err: any) => any, timeout: number = -1) {
        this.setState({
            retrying: -1,
            url,
        });
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open('GET', url, true);
        const onError1 = (retry: boolean, errorMessage?: string) => {
            const waitTime = retry ? timeout > 0 ? timeout * 2 : 5 : -1;
            this.setState({
                retrying: waitTime,
                errorMessage
            });
            if (retry) {
                this.fetchUrl(url, cb, waitTime)
            }
        };
        req.onload = () => {
            const res = JSON.parse(req.responseText);
            if (url === this.state.url) {
                // console.log(url);
                // console.log(this.state.url);
                if (res.hasOwnProperty("error")) {
                    onError1(true, res.message as string);
                } else {
                    const recenttracks = res.recenttracks;
                    if (recenttracks) {
                        const tracks = recenttracks.track;
                        if (tracks && tracks.length) {
                            cb(recenttracks["@attr"].totalPages as number / 20,
                                tracks.map(track => ({
                                    artist: parseArtist(track.artist),
                                    name: track.name || undefined,
                                    mbid: track.mbid || undefined,
                                    album: parseAlbum(track.album),
                                    uts: (track.date && track.date.uts) || undefined,
                                })), null);
                        } else onError1(false, "No tracks found");
                    } else onError1(false, "No tracks found");
                }
            }
        };
        req.onerror = () => {
            if (url === this.state.url) {
                onError1(true);
            }
        };
        req.send(null);
    }

    startExportJson() {
        this.setState({
            scrobbles: []
        });
        this.startExportJsonPage(this.state.startpage);
    }

    startExportJsonPage(startpage: number) {
        const url = `${baseurl}method=${this.state.api_method}&user=${this.state.userLastFm}&api_key=${this.state.api_key}&limit=200&page=${startpage}&format=json`;
        const currentRequest = this.state.xhr;
        if (currentRequest) currentRequest.abort();
        this.setState({
            startpage,
            url,
            xhr: undefined,
        });
        this.fetchUrl(url, (totalPages, res, err) => {
            if (res) {
                if (url === this.state.url) {
                    this.setState({
                        totalPages: totalPages,
                        url: undefined,
                        retrying: -200,
                        scrobbles: this.state.scrobbles.concat(res)
                    });
                    if (startpage < totalPages) {
                        this.startExportJsonPage(startpage + 1);
                    }
                }
            }
        });
    }

    render() {
        return <div id="app-root">
            <div>
                <label htmlFor="username-lastfm">Username</label>
                <input type="text" defaultValue={this.state.userLastFm} name="username-lastfm" onChange={(e => {
                    this.setState({userLastFm: e.target.value});
                })}/>
            </div>
            <div>
                <label htmlFor="api-key-lastfm">API key</label>
                <input defaultValue={this.state.api_key} type="text" name="api-key-lastfm" onChange={(e => {
                    this.setState({api_key: e.target.value});
                })}/>
            </div>
            <div>
                <label htmlFor="api-method-lastfm">API method</label>
                <input defaultValue={this.state.api_method} type="text" name="api-method-lastfm" onChange={(e => {
                    this.setState({api_method: e.target.value});
                })}/>
            </div>

            <div>
                {this.state.startpage > 1 || this.state.totalPages > 0
                    ? `${this.state.startpage} / ${this.state.totalPages} (${this.state.scrobbles.length} scrobbles)`
                    : ""
                }
            </div>
            <StatusLine {...this.state} scrobbleNum={this.state.scrobbles.length}/>
            <button onClick={() => {
                this.startExportJson();
            }}>Export Last.fm scrobbles
            </button>
            <div>
                <input type="checkbox" defaultChecked={this.state.showJson} onChange={(e) => {
                    this.setState({
                        showJson: e.target.checked
                    })
                }}/> Show output
                {
                    this.state.showJson
                        ? <textarea className="output-json" value={JSON.stringify(this.state.scrobbles)}/>
                        : ""
                }
            </div>
        </div>
    }
}