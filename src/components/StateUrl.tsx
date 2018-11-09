import * as React from "react";
import {StatelessComponent} from "react";
import {urlEncodeParams} from "../util/collections";

interface StateState {
    fromApiKey: string;
    importTo: string;
    exportFrom: string;
    showJson: boolean;
    fromUser: string;
    toUsername: string;
    toToken: string;
    toApiKey: string;
    toSecret: string;
    toSessionKey: string;
    startpage: number;
    totalPages: number;
}

function pushIfAvailable(v: string, params: string[][], k: string) {
    if (v) params.push([k, v]);
}

function pushIfAvailable2(s: any, params: string[][], k: string) {
    const v = s[k];
    if (v) params.push([k, v.toString()]);
}

function createSaveUrl(s: StateState): string {
    const params: string[][] = [];
    pushIfAvailable2(s, params, "fromApiKey");
    pushIfAvailable2(s, params, "toApiKey");
    pushIfAvailable(s.toToken, params, "token");
    pushIfAvailable(s.toSecret, params, "secret");
    pushIfAvailable(s.toSessionKey, params, "sk");
    pushIfAvailable2(s, params, "toUsername");
    pushIfAvailable2(s, params, "fromUser");
    pushIfAvailable2(s, params, "importTo");
    pushIfAvailable2(s, params, "exportFrom");
    pushIfAvailable2(s, params, "startpage");
    pushIfAvailable2(s, params, "totalPages");
    return `https://digitalheir.github.io/lastfm-to-librefm-exporter/?${urlEncodeParams(params, true)}`;
}

export const StateUrl: StatelessComponent<StateState> = (props) => {
    const url = createSaveUrl(props);
    return <div style={{width: "100%", overflow: "auto", fontSize: "small", wordBreak: "break-all"}}><a
        href={url}>{url}</a></div>;
};