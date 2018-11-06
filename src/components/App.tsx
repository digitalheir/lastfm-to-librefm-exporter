import * as React from "react";
import {ApiParameter} from "./ApiParameter";
import {StatusLine} from "./StatusLine";
import {parseRawScrobble} from "../parse_track";
import {apiMethodDefault, createUrl} from "../lastfm";
import {createRequest} from "../fetch-url";

// import {SearchContainer} from "./Search";
// import {SearchResults} from "./SearchResults";


interface State {
    retrying: number;
    startpage: number;
    url: string | null;
    api_key: string;
    showJson: boolean;
    userLastFm: string;
    api_method: string;
    scrobbles: string[];
    totalPages: number;
    errorMessage: string | null;
    xhr: XMLHttpRequest | null;
    libreUsername: string;
    librePassword: string;
}

interface Props {
}

// const settings = (username: string,
//                   startpage: number,
//                   api_key: string,
//                   tracktype: string) => {
//     // "libre.fm":
// // baseurl = 'http://alpha.libre.fm/2.0/?'
// // urlvars = dict(method='user.get%s' % tracktype,
// //     api_key=('lastexport.py-%s' % __version__).ljust(32, '-'),
// //     user=username,
// //     page=startpage,
// //     limit=200)
//
// // elif server == "last.fm":
//     return {
//         method: `user.get${tracktype}`,
//         api_key,
//         user: username,
//         page: startpage,
//         limit: 50,
//     };
// // else:
// // if server[:7] != 'http://':
// // server = 'http://%s' % server
// // baseurl = server + '/2.0/?'
// // urlvars = {method: `user.get${tracktype}`,
// //     api_key=('lastexport.py-%s' % __version__).ljust(32, '-'),
// //     user=username,
// //     page=startpage,
// //     limit=200)
// };

export class App extends React.PureComponent<Props, State> {
    state = {
        libreUsername: "",
        librePassword: "",
        api_key: "e38cc7822bd7476fe4083e36ee69748e",
        api_method: apiMethodDefault,
        userLastFm: "",
        scrobbles: [],
        startpage: 1,
        totalPages: -1,
        retrying: -1,
        url: null,
        errorMessage: null,
        xhr: null,
        showJson: false,
    };

    fetchUrl(url: string, cb: (p: number, res: any, err: any) => any, timeout: number = -1) {
        if (timeout > 0) {
            setTimeout(() => {
                if (this.state.url === url)
                    this.actuallyFetch(url, cb, timeout);
            }, timeout * 1000);
        } else {
            this.actuallyFetch(url, cb);
        }
    }

    private onErrorFetch(cb: (totalPages: number, res: any, err: any) => any,
                         url: string,
                         retry: boolean,
                         errorMessage?: string,
                         timeout: number = -1) {
        const waitTime = retry ? timeout > 0 ? timeout * 2 : 5 : -1;
        this.setState({
            retrying: waitTime, errorMessage
        });
        if (retry) {
            this.fetchUrl(url, cb, waitTime);
        }
    }

    actuallyFetch(url: string, cb: (totalPages: number, res: any, err: any) => any, timeout: number = -1) {
        this.setState({
            retrying: -1,
            url,
        });
        const onError1 = (retry: boolean, err?: string) => this.onErrorFetch(cb, url, retry, err, timeout);
        const req = createRequest(url, () => {
            const res = JSON.parse(req.responseText);
            if (url === this.state.url) {
                // console.log(url);
                // console.log(this.state.url);
                if (res.hasOwnProperty("error")) {
                    onError1(res.message !== "User not found", res.message as string);
                } else {
                    const recenttracks = res.recenttracks;
                    if (recenttracks) {
                        const tracks = recenttracks.track;
                        if (tracks && tracks.length) {
                            cb(recenttracks["@attr"].totalPages as number, tracks.map(parseRawScrobble), null);
                        } else onError1(false, "No tracks found");
                    } else onError1(false, "No tracks found");
                }
            }
        }, () => {
            if (url === this.state.url) {
                onError1(true);
            }
        });
        req.send(null);
    }

    startExportJson() {
        const currentRequest = this.state.xhr;
        if (currentRequest) currentRequest.abort();
        this.setState({
            errorMessage: null,
            url: null,
            xhr: null,
            scrobbles: []
        });
        this.startExportJsonPage(this.state.startpage);
    }

    startExportJsonPage(startpage: number) {
        const url = createUrl(this.state.api_method, this.state.userLastFm, this.state.api_key, startpage);
        const currentRequest = this.state.xhr;
        if (currentRequest) currentRequest.abort();
        this.setState({
            startpage,
            url,
            xhr: null,
        });
        // noinspection JSUnusedLocalSymbols
        this.fetchUrl(url, (totalPages, res, err) => {
            if (res) {
                if (url === this.state.url) {
                    const totalPages1 = isFinite(this.state.totalPages) && this.state.totalPages > 0 ? this.state.totalPages : totalPages;
                    this.setState({
                        totalPages: totalPages1,
                        url: undefined,
                        retrying: -200,
                        scrobbles: this.state.scrobbles.concat(res)
                    });
                    if (startpage < totalPages1) {
                        // console.log(`${startpage} < ${totalPages1}`);
                        this.startExportJsonPage(startpage + 1);
                    }
                }
            }
        });
    }

    render() {
        return <div id="app-root">
            <section>
                <h2>Last.fm parameters</h2>
                <div className="api-parameters">
                    <ApiParameter
                        currentValue={this.state.userLastFm}
                        defaultValue=""
                        title="Username"
                        htmlFor="username-lastfm"
                        onChange={e => {
                            this.setState({userLastFm: e.target.value});
                        }}/>
                    <ApiParameter
                        currentValue={this.state.api_key}
                        defaultValue=""
                        title="API key"
                        htmlFor="api-key-lastfm"
                        onChange={e => {
                            this.setState({api_key: e.target.value});
                        }}/>
                    <ApiParameter
                        currentValue={this.state.api_method}
                        defaultValue={apiMethodDefault}
                        title="API method"
                        htmlFor="api-method-lastfm"
                        onChange={e => {
                            this.setState({api_method: e.target.value});
                        }}/>
                    <ApiParameter
                        currentValue={this.state.startpage}
                        defaultValue="1"
                        title="startpage"
                        htmlFor="api-startpage-lastfm"
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            const startpage = isFinite(parseInt1) ? parseInt1 : Infinity;
                            this.setState({startpage});
                        })}
                    />
                    <ApiParameter
                        htmlFor="api-lastpage-lastfm"
                        title="lastpage"
                        defaultValue=""
                        currentValue={this.state.totalPages}
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            this.setState({totalPages: isFinite(parseInt1) ? parseInt1 : Infinity});
                        })}/>
                </div>
            </section>


            <section>
                <h2>Libre.fm settings</h2>
                <div className="api-parameters">
                    <ApiParameter
                        htmlFor="api-username-libre"
                        title="Username"
                        defaultValue=""
                        currentValue={this.state.libreUsername}
                        onChange={(e => {
                            const libreUsername = e.target.value;
                            this.setState({libreUsername});
                        })}/>
                    <ApiParameter
                        htmlFor="api-password-libre"
                        type="password"
                        title="Password"
                        defaultValue=""
                        currentValue={this.state.librePassword}
                        onChange={(e => {
                            const librePassword = e.target.value;
                            this.setState({librePassword});
                        })}/>
                </div>
            </section>

            <StatusLine {...this.state} scrobbleNum={this.state.scrobbles.length}/>

            <section>
                <h2>Synchronize Last.fm scrobbles to Libre.fm</h2>
                <button onClick={() => {
                    alert("TODO: iomplement");
                }}>Synchronize Last.fm scrobbles to Libre.fm
                </button>
            </section>

            <section>
                <h2>Last.fm export only</h2>
                <button className="btn-export" onClick={() => this.startExportJson()}>Export Last.fm scrobbles</button>
                <div>
                    <input type="checkbox" name="show-output" defaultChecked={this.state.showJson} onChange={(e) => {
                        this.setState({
                            showJson: e.target.checked
                        });
                    }}/><label htmlFor="show-output">Show output</label>
                    {
                        this.state.showJson
                            ? <textarea className="output-json" value={JSON.stringify(this.state.scrobbles)}/>
                            : ""
                    }
                </div>
            </section>
        </div>;
    }
}