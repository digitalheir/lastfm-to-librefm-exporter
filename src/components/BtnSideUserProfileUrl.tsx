import {StatelessComponent} from "react";
import * as React from "react";
import {getUserProfileUrl} from "../scrobbler/scrobbler_api";

export const BtnSideUserProfileUrl: StatelessComponent<{
    scrobbler: string,
    username: string,
}> = ({scrobbler, username}) => <a className={`${username ? "visible" : "hidden"} btn-side api-parameter-cell xsmall`}
                                   href={getUserProfileUrl(scrobbler, username)}>Profile</a>;