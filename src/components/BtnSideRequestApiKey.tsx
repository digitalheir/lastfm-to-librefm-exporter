import {StatelessComponent} from "react";
import * as React from "react";
import {apiAuthEndpointFor} from "../scrobbler/scrobbler_api";

export const BtnSideRequestApiKey: StatelessComponent<{
    scrobbler: string,
}> = ({scrobbler}) => <a className="btn-side api-parameter-cell xsmall"
                         href={apiAuthEndpointFor(scrobbler) + "account/create"}>Request API key</a>;