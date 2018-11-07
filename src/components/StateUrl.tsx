import * as React from "react";
import {StatelessComponent} from "react";
import {urlEncodeParams} from "../util/collections";

interface StateState {
    api_key: string;
    showJson: boolean;
    userLastFm: string;
    libreUsername: string;
    libreToken: string;
    libreApiKey: string;
    libreSecret: string;
    libreSessionKey: string;
    startpage: number;
    totalPages: number;
}

function pushIfAvailable(v: string, params: string[][], k: string) {
    if (v) params.push([k, v]);
}

function createSaveUrl(s: StateState): string {
    const params: string[][] = [];
    pushIfAvailable(s.api_key, params, "api_key");
    pushIfAvailable(s.libreApiKey, params, "api_key_libre");
    pushIfAvailable(s.libreToken, params, "token");
    pushIfAvailable(s.libreSecret, params, "secret");
    pushIfAvailable(s.libreSessionKey, params, "sk");
    pushIfAvailable(s.libreUsername, params, "user_libre");
    pushIfAvailable(s.userLastFm, params, "user_last");
    pushIfAvailable(s.startpage.toString(), params, "startpage");
    pushIfAvailable(s.totalPages.toString(), params, "totalPages");
    return `https://digitalheir.github.io/lastfm-to-librefm-exporter/?${urlEncodeParams(params, true)}`;
}

export const StateUrl: StatelessComponent<StateState> = (props) => {
    const url = createSaveUrl(props);
    return <div style={{width: "100%", overflow: "auto", fontSize: "small", wordBreak: "break-all"}}><a
        href={url}>{url}</a></div>;
};