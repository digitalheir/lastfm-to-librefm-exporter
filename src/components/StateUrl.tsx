import * as React from "react";
import {StatelessComponent} from "react";
import {urlEncodeParams} from "../util/collections";

interface StateState {
    fromApiKey: string;
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

function createSaveUrl(s: StateState): string {
    const params: string[][] = [];
    pushIfAvailable(s.fromApiKey, params, "fromApiKey");
    pushIfAvailable(s.toApiKey, params, "toApiKey");
    pushIfAvailable(s.toToken, params, "token");
    pushIfAvailable(s.toSecret, params, "secret");
    pushIfAvailable(s.toSessionKey, params, "sk");
    pushIfAvailable(s.toUsername, params, "user_libre");
    pushIfAvailable(s.fromUser, params, "user_last");
    pushIfAvailable(s.startpage.toString(), params, "startpage");
    pushIfAvailable(s.totalPages.toString(), params, "totalPages");
    return `https://digitalheir.github.io/lastfm-to-librefm-exporter/?${urlEncodeParams(params, true)}`;
}

export const StateUrl: StatelessComponent<StateState> = (props) => {
    const url = createSaveUrl(props);
    return <div style={{width: "100%", overflow: "auto", fontSize: "small", wordBreak: "break-all"}}><a
        href={url}>{url}</a></div>;
};