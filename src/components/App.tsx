import * as React from "react";
import {ApiParameter} from "./ApiParameter";
import {StatusLine} from "./StatusLine";
import {parseRawScrobble, Scrobble} from "../parse_track";
import {apiMethodDefault, createUrl} from "../lastfm";
import {makeGetRequest} from "../fetch-url";
import {convertToLibreScrobbles, libre2_0, libreApi} from "../librefm";
import {
    constructSignatureForParams,
    createScrobbleFormData
} from "../scrobbler/scrobbler_api";
import {splitArray} from "../util/collections";
// import {md5hash} from "../md5";

// import {SearchContainer} from "./Search";
// import {SearchResults} from "./SearchResults";

interface State {
    retrying: number;
    startpage: number;
    url: string | null;
    api_key: string;
    showJson: boolean;
    showTokenInstruction: boolean;
    showSessionInstruction: boolean;
    userLastFm: string;
    api_method: string;
    scrobbles: any[];
    totalPages: number;
    resultsPerPageLastFm: number;
    errorMessage: string | null;
    xhr: XMLHttpRequest | null;
    libreUsername: string;
    librePassword: string;
    libreToken: string;
    libreApiKey: string;
    libreSecret: string;
    libreSessionKey: string;
}

interface Props {
    api_key?: string;
    api_key_libre?: string;
    token?: string;
    secret?: string;
    sk?: string;
}

const default_key = "r9i1y91hz71tcx7vyrp9hk1alhqp1888";
const default_secret = "21dsgf56dfg13df5g46sd85769gt45fd";

const resultsPerPageLastFmDefault = 200;

export class App extends React.PureComponent<Props, State> {
    state = {
        showTokenInstruction: false,
        showSessionInstruction: false,
        libreUsername: "",
        librePassword: "",
        libreApiKey: this.props.api_key_libre || default_key,
        libreToken: this.props.token || "",
        libreSecret: this.props.secret || default_secret,
        libreSessionKey: this.props.sk || "",
        api_key: this.props.api_key || "e38cc7822bd7476fe4083e36ee69748e",
        api_method: apiMethodDefault,
        userLastFm: "",
        scrobbles: [],
        startpage: 1,
        totalPages: -1,
        resultsPerPageLastFm: resultsPerPageLastFmDefault,
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
        const component = this;
        makeGetRequest(url, function () {
            const res = JSON.parse(this.responseText);
            if (url === component.state.url) {
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
        }, function () {
            if (url === component.state.url) {
                onError1(true);
            }
        });
    }

    startExportJson(pushToLibre: boolean) {
        const currentRequest = this.state.xhr;
        if (currentRequest) currentRequest.abort();
        this.setState({
            errorMessage: null,
            url: null,
            xhr: null,
            scrobbles: []
        });
        this.startExportJsonPage(this.state.startpage, pushToLibre);
    }

    createScrobbleForm(frameName: string, tracks: Scrobble[]) {
        const form = document.createElement("form");
        //form.appendChild(input("",true));
        form.target = frameName;
        form.method = "post";
        form.action = libre2_0;

        const submit = document.createElement("input");
        submit.type = "submit";
        submit.value = `Retry scrobbling ${tracks.length} tracks to Libre.fm`;
        form.appendChild(submit);

        const formData = createScrobbleFormData(convertToLibreScrobbles(tracks), this.state.libreApiKey, this.state.libreSessionKey, this.state.libreSecret);
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

    pushToLibreFm(page: number, res: Scrobble[], cb: () => any) {
        const syncScrobs = document.getElementById("synchronize-scrobbles");
        if (syncScrobs) {
            const buckets = splitArray(res, 50);
            const container = document.createElement("div");
            syncScrobs.appendChild(container);
            buckets.forEach((bucket, i) => {
                const div = document.createElement("div");
                div.style.width = `${100 / buckets.length}%`;
                div.style.display = `inline-block`;
                const ifr = document.createElement("iframe");
                ifr.style.width = `100%`;
                ifr.style.display = "block";
                ifr.style.height = "96px";
                const frameName = `${page}-${i + 1}`;
                ifr.name = frameName;
                const {form, submit} = this.createScrobbleForm(frameName, bucket);
                form.style.width = `100%`;
                submit.style.width = `100%`;
                div.appendChild(ifr);
                div.appendChild(form);

                container.appendChild(div);
                submit.click();
            });
            setTimeout(cb, 2000);
        } else alert("No element found with id 'synchronize-scrobbles'");
    }

    startExportJsonPage(startpage: number, pushToLibre: boolean) {
        const url = createUrl(this.state.api_method, this.state.userLastFm, this.state.api_key, startpage, this.state.resultsPerPageLastFm);
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
                    if (pushToLibre) {
                        this.setState({
                            totalPages: totalPages1,
                            url: undefined,
                            retrying: -400,
                            scrobbles: res
                        });
                        this.pushToLibreFm(startpage, res as Scrobble[], () => {
                            if (startpage < totalPages1) {
                                // console.log(`${startpage} < ${totalPages1}`);
                                this.startExportJsonPage(startpage + 1, pushToLibre);
                            }
                        });
                    } else {
                        this.setState({
                            totalPages: totalPages1,
                            url: undefined,
                            retrying: -200,
                            scrobbles: this.state.scrobbles.concat(res)
                        });
                        if (startpage < totalPages1) {
                            // console.log(`${startpage} < ${totalPages1}`);
                            this.startExportJsonPage(startpage + 1, pushToLibre);
                        }
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
                        }}>
                        <a className={`${this.state.userLastFm ? "visible" : "hidden"} btn-side api-parameter-cell xsmall`}
                           href={`https://www.last.fm/user/${this.state.userLastFm}`}>Profile</a></ApiParameter>
                    <ApiParameter
                        currentValue={this.state.api_key}
                        defaultValue={this.props.api_key || ""}
                        title="API key"
                        htmlFor="api-key-lastfm"
                        onChange={e => {
                            this.setState({api_key: e.target.value});
                        }}>
                        <a className="btn-side api-parameter-cell xsmall" href="https://www.last.fm/api/account/create">Request API key</a>
                    </ApiParameter>
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
                    <ApiParameter
                        htmlFor="api-results-per-page-lastfm"
                        title="Results per page (max 200)"
                        defaultValue={resultsPerPageLastFmDefault.toString()}
                        currentValue={this.state.resultsPerPageLastFm}
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            const perPages: number = isFinite(parseInt1) ? parseInt1 : Infinity;
                            const perPage = Math.min(perPages, resultsPerPageLastFmDefault);
                            this.setState({resultsPerPageLastFm: isFinite(perPage) && perPage <= resultsPerPageLastFmDefault ? perPage : resultsPerPageLastFmDefault});
                        })}/>
                </div>
                <div className={
                    `all-set ${(this.state.userLastFm &&
                        this.state.api_key) ? `visible` : `hidden`}`}>✓ All Last.fm settings set
                </div>
            </section>


            <section>
                <h2>Libre.fm settings</h2>
                <div className="api-parameters">
                    <ApiParameter
                        htmlFor="api-key-libre"
                        title="API key"
                        defaultValue={this.props.api_key_libre || default_key}
                        currentValue={this.state.libreApiKey}
                        onChange={(e => {
                            const libreApiKey = e.target.value;
                            this.setState({libreApiKey});
                        })}/>

                    <ApiParameter
                        htmlFor="api-secret-libre"
                        title="Secret"
                        defaultValue={this.props.secret || default_secret}
                        currentValue={this.state.libreSecret}
                        onChange={(e => {
                            this.setState({libreSecret: e.target.value});
                        })}/>
                    <ApiParameter
                        htmlFor="api-token-libre"
                        title="Token"
                        defaultValue={this.props.token}
                        currentValue={this.state.libreToken}
                        onChange={(e => {
                            this.setState({libreToken: e.target.value});
                        })}>
                        <form action={libre2_0} className="api-parameter-cell" target="myFrame" method="post">
                            <input type="hidden" name="method" value="auth.getToken"/>
                            <input type="hidden" name="api_key" value={this.state.libreApiKey}/>
                            <input type="hidden" name="format" value="json"/>
                            <input type="hidden" name="api_sig" value={constructSignatureForParams([
                                ["api_key", this.state.libreApiKey],
                                ["method", "auth.getToken"]
                            ], this.state.libreSecret)}/>
                            <input value="Create token"
                                   className="btn-side btn-create-token"
                                   type="submit"
                                   onClick={() => {
                                       this.setState({
                                           showTokenInstruction: true
                                       });
                                   }}/>
                        </form>
                    </ApiParameter>

                    <div className="api-parameter">
                        <span
                            className={`instruction ${this.state.showTokenInstruction ? "visible" : "hidden"}`}>Copy the token into the above field. So if the response is <code>{"{"}"token": "xyz"}</code>, copy <em>xyz</em> without the quotes.</span>
                    </div>
                    <div className="api-parameter">
                        <iframe name="myFrame" id="myFrame"
                                className={`frame-output api-parameter-cell ${this.state.showTokenInstruction ? "visible" : "hidden"}`}/>
                    </div>
                    <div className="api-parameter">
                        <form action={libreApi + "auth/"}
                              className={`${this.state.libreToken ? "visible" : "hidden"}`}
                              target="_blank"
                              method="post">
                            <input type="hidden" name="api_key" value={this.state.libreApiKey}/>
                            <input type="hidden" name="token" value={this.state.libreToken}/>
                            <input value="Authorize this token to change your account"
                                   className="btn-authorize-token btn-big"
                                   type="submit"/>
                        </form>
                    </div>
                    <ApiParameter
                        htmlFor="api-username-libre"
                        title="Username"
                        defaultValue=""
                        currentValue={this.state.libreUsername}
                        onChange={(e => {
                            const libreUsername = e.target.value;
                            this.setState({libreUsername});
                        })}>
                        <a className={`${this.state.libreUsername ? "visible" : "hidden"} api-parameter-cell xsmall btn-side`}
                           href={`https://libre.fm/user/${this.state.libreUsername}`}>Profile</a>
                    </ApiParameter>
                    <ApiParameter
                        htmlFor="api-sk-libre"
                        title="Session key"
                        defaultValue={this.props.sk || ""}
                        currentValue={this.state.libreSessionKey}
                        onChange={(e => {
                            this.setState({libreSessionKey: e.target.value});
                        })}>
                        <form action={libre2_0}
                              className={`api-parameter-cell ${this.state.libreToken ? "visible" : "hidden"}`}
                              target="get-session-output"
                              method="post">
                            <input type="hidden" name="method" value="auth.getSession"/>
                            <input type="hidden" name="api_key" value={this.state.libreApiKey}/>
                            <input type="hidden" name="token" value={this.state.libreToken}/>
                            <input type="hidden" name="format" value="json"/>
                            <input type="hidden" name="api_sig" value={constructSignatureForParams([
                                ["api_key", this.state.libreApiKey],
                                ["method", "auth.getSession"],
                                ["token", this.state.libreToken],
                            ], this.state.libreSecret)}/>
                            <input value="Create session key"
                                   className="btn-create-session btn-side"
                                   type="submit"
                                   onClick={() => {
                                       this.setState({
                                           showSessionInstruction: true
                                       });
                                   }}/>
                        </form>
                        <div className="api-parameter">
                            <span className={`instruction ${this.state.showSessionInstruction ? "visible" : "hidden"}`}>Copy the username and session key into the above field. So if the response is {"{"}"key": "xyz"}, copy <em>xyz</em> without the quotes.</span>
                        </div>
                        <iframe name="get-session-output"
                                className={`frame-output ${this.state.showSessionInstruction ? "visible" : "hidden"}`}/>
                    </ApiParameter>
                    <div className={
                        `all-set ${(this.state.libreApiKey &&
                            this.state.libreUsername &&
                            this.state.libreSecret &&
                            this.state.libreSessionKey) ? `visible` : `hidden`}`}>✓ All Libre.fm settings set
                    </div>
                </div>
            </section>
            <StatusLine {...this.state} scrobbleNum={this.state.scrobbles.length}/>
            <section id="synchronize-scrobbles" className={"subtitled"}>
                <h2>Synchronize Last.fm scrobbles to Libre.fm</h2>
                <div className="xsmall subtitle"><p>Scroll down the status windows to see if the scrobbles were
                    succesful. Look
                    for something like: <code>"@attr":{"{"}"accepted":"x","ignored":"y"}}}</code></p>
                    <p>You do not need to worry about tracks being scrobbled more than once. Duplicates are ignored
                        automatically.</p></div>
                <div className="api-parameters">
                    <ApiParameter
                        currentValue={this.state.startpage}
                        defaultValue="1"
                        title="Start on Last.fm 'Recently Listened' page"
                        htmlFor="api-startpage-lastfm"
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            const startpage = isFinite(parseInt1) ? parseInt1 : Infinity;
                            this.setState({startpage});
                        })}
                    />
                    <ApiParameter
                        htmlFor="api-lastpage-lastfm"
                        title="End on page (optional)"
                        defaultValue=""
                        currentValue={this.state.totalPages}
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            this.setState({totalPages: isFinite(parseInt1) ? parseInt1 : Infinity});
                        })}/>
                </div>
                <button onClick={() => {
                    const {
                        userLastFm,
                        api_key,
                        libreApiKey,
                        libreUsername,
                        libreSecret,
                        libreSessionKey
                    } = this.state;
                    if (!userLastFm) {
                        alert("Fill in Last.fm usernames first");
                    }
                    else if (api_key && libreApiKey && libreUsername && libreSecret && libreSessionKey) {
                        this.startExportJson(true);
                    } else {
                        alert("Fill in usernames / API keys / session keys first");
                    }
                    // // const session = createSessionUrlLastFm(this.state.api_key, this.state.libreToken, );
                    // // alert(connectApplicationLastFm(this.state.api_key) + "\n\n" + session);
                }}>Synchronize Last.fm scrobbles to Libre.fm
                </button>
            </section>

            <section>
                <h2>Last.fm export only</h2>
                <button className="btn-export btn-big" onClick={() => this.startExportJson(false)}>Export Last.fm
                    scrobbles
                </button>
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

/*onClick={() => {
                                const urlToken = urlGetToken(libre2_0, this.state.libreApiKey, this.state.libreSecret);
                                const input = document.getElementById("api-token-libre");
                                if (!!input) {
                                    // const iFrame = document.createElement("iframe");
                                    // iFrame.src = urlToken;
                                    // iFrame.onload = function () {
                                    //     const myDoc = iFrame.contentDocument? iFrame.contentDocument: iFrame.contentWindow.document;
                                    //     alert((myDoc as any).innerHTML);
                                    // };
                                    // input.parentElement.appendChild(iFrame);
                                }
                                // // const sec = this.state.libreSecret;
                                // // const api_key = this.state.api_key;
                                // const component = this;
                                // makeGetRequest(urlToken, function () {
                                //     const res = JSON.parse(this.responseText);
                                //     if (res.hasOwnProperty("token")) {
                                //         // const url = createSessionUrl(libre2_0, api_key, res.token, sec);
                                //         // window.open(url, "_self");
                                //         // component.setState({
                                //         //     libreToken: res.token
                                //         // });
                                //
                                //         const input = document.getElementById("api-token-libre");
                                //         if (!!input) {
                                //             (input as HTMLInputElement).value = res.token;
                                //         }
                                //     } else {
                                //         // todo more friendly error message
                                //         alert(`Could not get token: ${res.error} - leave a bug report.`);
                                //     }
                                // }, function () {
                                //     alert("Could not get token - leave a bug report.");
                                // });
                            }
                            }*/