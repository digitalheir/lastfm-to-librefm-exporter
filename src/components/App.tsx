import * as React from "react";
import {ApiParameter} from "./ApiParameter";
import {StatusLine} from "./StatusLine";
import {parseRawScrobble, Scrobble} from "../parse_track";
import {apiMethodDefault, createUrl} from "../lastfm";
import {makeGetRequest} from "../fetch-url";
import {
    apiAuthEndpointFor,
    apiEndpointFor,
    constructSignatureForParams,
    createScrobbleForm
} from "../scrobbler/scrobbler_api";
import {splitArray} from "../util/collections";
import {StateUrl} from "./StateUrl";
import {parseFiniteInt} from "../util/number";
import {div} from "../util/dom";
import {SubtitledSection} from "./SubtitledSection";
import {BtnSideUserProfileUrl} from "./BtnSideUserProfileUrl";
import {ShowOutput} from "./ShowOutput";
import {default_key, default_secret} from "../scrobbler/libreConstants";

interface State {
    retrying: number;
    startpage: number;
    url: string | null;
    fromApiKey: string;
    showJson: boolean;
    showTokenInstruction: boolean;
    showSessionInstruction: boolean;
    fromUser: string;
    api_method: string;
    scrobbles: any[];
    totalPages: number;
    resultsPerPageLastFm: number;
    errorMessage: string | null;
    xhr: XMLHttpRequest | null;
    toUsername: string;
    toToken: string;
    toApiKey: string;
    toSecret: string;
    toSessionKey: string;
    exportFrom: string;
    importTo: string;
}

interface Props {
    fromApiKey?: string;
    toApiKey?: string;
    token?: string;
    secret?: string;
    sk?: string;
    user_libre?: string;
    user_last?: string;
    startpage?: string;
    totalPages?: string;
}

const resultsPerPageLastFmDefault = 200;

export class App extends React.PureComponent<Props, State> {
    private readonly apiKeyDefault = this.props.fromApiKey || "e38cc7822bd7476fe4083e36ee69748e";
    private readonly startpageDefault = parseFiniteInt(this.props.startpage, 1);
    private readonly totalPagesDefault = parseFiniteInt(this.props.totalPages, -1);
    state = {
        showTokenInstruction: false,
        showSessionInstruction: false,
        toUsername: this.props.user_libre || "",
        toApiKey: this.props.toApiKey || default_key,
        toToken: this.props.token || "",
        toSecret: this.props.secret || default_secret,
        toSessionKey: this.props.sk || "",
        fromApiKey: this.apiKeyDefault,
        api_method: apiMethodDefault,
        fromUser: this.props.user_last || "",
        scrobbles: [],
        startpage: this.startpageDefault,
        totalPages: this.totalPagesDefault,
        resultsPerPageLastFm: resultsPerPageLastFmDefault,
        retrying: -1,
        url: null,
        errorMessage: null,
        xhr: null,
        showJson: false,
        exportFrom: "Last.fm",
        importTo: "Libre.fm",
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
        this.resetXhrState();
        this.startExportJsonPage(this.state.startpage, pushToLibre);
    }


    pushToLibreFm(page: number, res: Scrobble[], cb: () => any) {
        const syncScrobs = document.getElementById("synchronize-scrobbles-output");
        if (syncScrobs) {
            const buckets = splitArray(res, 50);
            const container = div("scrobble-page-holder");
            const containerContainer = document.createElement("div");
            const title = document.createElement("h3");
            title.innerHTML = `Page ${page}`;
            containerContainer.appendChild(title);
            containerContainer.appendChild(container);
            syncScrobs.appendChild(containerContainer);
            buckets.forEach((bucket, i) => {
                const holder = div("scrobble-output-holder");
                holder.style.width = `${90 / buckets.length}%`;
                const ifr = document.createElement("iframe");
                ifr.className = "output-librefm-scrobble";
                const frameName = `${page}-${i + 1}`;
                ifr.name = frameName;
                const {form, submit} = createScrobbleForm(frameName, this.state.importTo, this.state.toApiKey, this.state.toSessionKey, this.state.toSecret, bucket);
                form.className = "form-scrobble-libre";
                submit.className = "btn-scrobble-libre";
                holder.appendChild(ifr);
                holder.appendChild(form);

                container.appendChild(holder);
                submit.click();
            });
            const close = document.createElement("div");
            close.className = "btn-close";
            close.style.width = `10%`;
            close.style.display = "inline-block";
            close.addEventListener("click", () => {
                syncScrobs.removeChild(containerContainer);
            });
            container.appendChild(close);
            setTimeout(cb, 2500);
        } else alert("No element found with id 'synchronize-scrobbles-output'");
    }

    startExportJsonPage(startpage: number, pushToLibre: boolean) {
        const url = createUrl(this.state.api_method, this.state.fromUser, this.state.fromApiKey, startpage, this.state.resultsPerPageLastFm);
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
                        this.pushToLibreFm(startpage, res as Scrobble[], () => {
                            if (startpage < totalPages1) {
                                if (url === this.state.url) {
                                    this.setState({
                                        totalPages: totalPages1,
                                        url: undefined,
                                        retrying: -400,
                                        scrobbles: res
                                    });
                                    this.startExportJsonPage(startpage + 1, pushToLibre);
                                }
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
                <h2>{this.state.exportFrom} parameters</h2>
                <div className="api-parameters">
                    <ApiParameter
                        currentValue={this.state.fromUser}
                        defaultValue={this.props.user_last || ""}
                        title="Username"
                        htmlFor="username-lastfm"
                        onChange={e => {
                            this.setState({fromUser: e.target.value});
                        }}>
                        <BtnSideUserProfileUrl
                            username={this.state.fromUser}
                            scrobbler={this.state.exportFrom}/>
                    </ApiParameter>
                    <ApiParameter
                        currentValue={this.state.fromApiKey}
                        defaultValue={this.props.fromApiKey || ""}
                        title="API key"
                        htmlFor="api-key-lastfm"
                        onChange={e => {
                            this.setState({fromApiKey: e.target.value});
                        }}>
                        <a className="btn-side api-parameter-cell xsmall"
                           href={apiAuthEndpointFor(this.state.exportFrom) + "account/create"}>Request
                            API key</a>
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
                        defaultValue={this.startpageDefault.toString()}
                        title="startpage"
                        htmlFor="api-startpage-lastfm"
                        onChange={(e => {
                            this.setState({startpage: parseFiniteInt(e.target.value, Infinity)});
                        })}
                    />
                    <ApiParameter
                        htmlFor="api-lastpage-lastfm"
                        title="lastpage"
                        defaultValue={this.totalPagesDefault > 0 ? this.totalPagesDefault.toString() : ""}
                        currentValue={this.state.totalPages}
                        onChange={(e => {
                            this.setState({totalPages: parseFiniteInt(e.target.value, Infinity)});
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
                    `all-set ${(this.state.fromUser &&
                        this.state.fromApiKey) ? `visible` : `hidden`}`}>✓ All {this.state.exportFrom} parameters set
                </div>
            </section>


            <SubtitledSection title={`${this.state.importTo} parameters`}
                              id="librefm-settings">
                <div className="xsmall subtitle">You need create an access token and start a session to allow this
                    website to add scrobbled tracks to your account
                </div>
                <div className="api-parameters">
                    <ApiParameter
                        htmlFor="api-key-libre"
                        title="API key"
                        defaultValue={this.props.toApiKey || default_key}
                        currentValue={this.state.toApiKey}
                        onChange={(e => {
                            const toApiKey = e.target.value;
                            this.setState({toApiKey});
                        })}/>

                    <ApiParameter
                        htmlFor="api-secret-libre"
                        title="Secret"
                        defaultValue={this.props.secret || default_secret}
                        currentValue={this.state.toSecret}
                        onChange={(e => {
                            this.setState({toSecret: e.target.value});
                        })}/>
                    <ApiParameter
                        htmlFor="api-token-libre"
                        title="Token"
                        defaultValue={this.props.token}
                        currentValue={this.state.toToken}
                        onChange={(e => {
                            this.setState({toToken: e.target.value});
                        })}>
                        <form action={apiEndpointFor(this.state.importTo)} className="api-parameter-cell"
                              target="myFrame" method="post">
                            <input type="hidden" name="method" value="auth.getToken"/>
                            <input type="hidden" name="api_key" value={this.state.toApiKey}/>
                            <input type="hidden" name="format" value="json"/>
                            <input type="hidden" name="api_sig" value={constructSignatureForParams([
                                ["fromApiKey", this.state.toApiKey],
                                ["method", "auth.getToken"]
                            ], this.state.toSecret)}/>
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
                        <form action={apiAuthEndpointFor(this.state.importTo) + "auth/"}
                              className={`${this.state.toToken ? "visible" : "hidden"}`}
                              target="_blank"
                              method="post">
                            <input type="hidden" name="api_key" value={this.state.toApiKey}/>
                            <input type="hidden" name="token" value={this.state.toToken}/>
                            <input value="Authorize this token to change your account"
                                   className="btn-authorize-token btn-big"
                                   type="submit"/>
                        </form>
                    </div>
                    <div className="api-parameter">
                        <span
                            className={`instruction ${this.state.showTokenInstruction ? "visible" : "hidden"}`}>Copy the token into the above field. So if the response is <code>{"{"}"token": "xyz"}</code>, copy <em>xyz</em> without the quotes.</span>
                    </div>
                    <div className="api-parameter">
                        <iframe name="myFrame" id="myFrame"
                                className={`frame-output api-parameter-cell ${this.state.showTokenInstruction ? "visible" : "hidden"}`}/>
                    </div>
                    <h3>Session</h3>
                    <ApiParameter
                        htmlFor="api-username-libre"
                        title="Username"
                        defaultValue={this.props.user_libre || ""}
                        currentValue={this.state.toUsername}
                        onChange={(e => {
                            const toUsername = e.target.value;
                            this.setState({toUsername});
                        })}>
                        <BtnSideUserProfileUrl
                            username={this.state.toUsername}
                            scrobbler={this.state.importTo}/>
                    </ApiParameter>
                    <ApiParameter
                        htmlFor="api-sk-libre"
                        title="Session key"
                        defaultValue={this.props.sk || ""}
                        currentValue={this.state.toSessionKey}
                        onChange={(e => {
                            this.setState({toSessionKey: e.target.value});
                        })}>
                        <form action={apiEndpointFor(this.state.importTo)}
                              className={`api-parameter-cell ${this.state.toToken ? "visible" : "hidden"}`}
                              target="get-session-output"
                              method="post">
                            <input type="hidden" name="method" value="auth.getSession"/>
                            <input type="hidden" name="api_key" value={this.state.toApiKey}/>
                            <input type="hidden" name="token" value={this.state.toToken}/>
                            <input type="hidden" name="format" value="json"/>
                            <input type="hidden" name="api_sig" value={constructSignatureForParams([
                                ["api_key", this.state.toApiKey],
                                ["method", "auth.getSession"],
                                ["token", this.state.toToken],
                            ], this.state.toSecret)}/>
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
                            <span className={`instruction ${this.state.showSessionInstruction ? "visible" : "hidden"}`}>Copy the username and session key into the above fields. So if the response is {"{"}"key": "xyz"}, copy <em>xyz</em> without the quotes.</span>
                        </div>
                        <iframe name="get-session-output"
                                className={`frame-output ${this.state.showSessionInstruction ? "visible" : "hidden"}`}/>
                    </ApiParameter>
                    <div className={
                        `all-set ${(this.state.toApiKey &&
                            this.state.toUsername &&
                            this.state.toSecret &&
                            this.state.toSessionKey) ? `visible` : `hidden`}`}>✓ All {this.state.importTo} parameters
                        set
                    </div>
                </div>
            </SubtitledSection>
            <StatusLine {...this.state} scrobbleNum={this.state.scrobbles.length}/>

            <SubtitledSection id="url-state" title="URL with current state">
                <div className="xsmall subtitle">You can save this URL to to continue with in the future with the same
                    parameters
                </div>
                <StateUrl {...this.state}/>
            </SubtitledSection>

            <SubtitledSection id="synchronize-scrobbles"
                              title={`Synchronize ${this.state.exportFrom} scrobbles to ${this.state.importTo}`}>
                <div className="xsmall subtitle"><p>Scroll down the status windows to see if the scrobbles were
                    succesful. Look for something like: <code>"@attr":{"{"}"accepted":"x","ignored":"y"}}}</code></p>
                    <p>You do not need to worry about tracks being scrobbled more than once. Duplicates are ignored
                        automatically.</p></div>
                <div className="api-parameters">
                    <ApiParameter
                        classNameWhenSet=""
                        currentValue={this.state.startpage}
                        defaultValue={this.startpageDefault.toString()}
                        title={`Start on ${this.state.exportFrom} 'Recently Listened' page`}
                        htmlFor="api-startpage-lastfm"
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            const startpage = isFinite(parseInt1) ? parseInt1 : Infinity;
                            this.setState({startpage});
                        })}
                    />
                    <ApiParameter
                        htmlFor="api-lastpage-lastfm"
                        classNameWhenSet=""
                        title="End on page (optional)"
                        defaultValue={this.totalPagesDefault > 0 ? this.totalPagesDefault.toString() : ""}
                        currentValue={this.state.totalPages}
                        onChange={(e => {
                            const parseInt1 = parseInt(e.target.value);
                            this.setState({totalPages: isFinite(parseInt1) ? parseInt1 : Infinity});
                        })}/>
                </div>
                <button onClick={() => {
                    const {fromUser, fromApiKey, toApiKey, toUsername, toSecret, toSessionKey} = this.state;
                    if (!fromUser) {
                        alert(`Fill in ${this.state.exportFrom} usernames first`);
                    }
                    else if (fromApiKey && toApiKey && toUsername && toSecret && toSessionKey) {
                        this.startExportJson(true);
                    } else {
                        alert("Fill in usernames / API keys / session keys first");
                    }
                    // // const session = createSessionUrlLastFm(this.state.fromApiKey, this.state.toToken, );
                    // // alert(connectApplicationLastFm(this.state.fromApiKey) + "\n\n" + session);
                }}>Synchronize {this.state.exportFrom} scrobbles to {this.state.importTo}</button>
                <button onClick={() => {
                    const currentRequest = this.state.xhr;
                    if (currentRequest) currentRequest.abort();
                    this.resetXhrState();
                }}>Stop
                </button>
                <div id="synchronize-scrobbles-output"/>
            </SubtitledSection>

            <section>
                <h2>{this.state.exportFrom} export only</h2>
                <button className="btn-export btn-big"
                        onClick={() => this.startExportJson(false)}>Export {this.state.exportFrom} scrobbles
                </button>
                <ShowOutput scrobbles={this.state.scrobbles} showJson={this.state.showJson} onChange={(e) => {
                    this.setState({
                        showJson: e.target.checked
                    });
                }}/>
            </section>
        </div>;
    }

    private resetXhrState() {
        this.setState({
            errorMessage: null,
            url: null,
            xhr: null,
            scrobbles: []
        });
    }
}