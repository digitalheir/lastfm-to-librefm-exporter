// import * as React from "react";
// import {render} from "react-dom";
// import {App} from "./components/App";
import {parseUrlParams} from "./browser";
import {createSessionUrl} from "./scrobbler/scrobbler_api";
import {libre2_0} from "./librefm";
import {makeGetRequest} from "./fetch-url";

const mountPoint = document.getElementById("mount-point");
const l = window ? window.location : null;
const params = parseUrlParams(l ? l.search : null);

function alertParamName(...paramName: string[]): boolean {
    let hasAll = true;
    paramName.forEach((k) => {
        if (!params[k]) {
            alert("Expected parameter " + k);
            hasAll = false;
        }
    });
    return hasAll;
}

const a = (href: string, content: string) => {
    const it = document.createElement("a");
    it.href = href;
    it.innerText = content;
    return it;
};

const div = (content: string) => {
    const it = document.createElement("div");
    it.innerText = content;
    return it;
};

const errorNode = (message: string) => {
    const it = document.createElement("div");
    it.innerText = message;
    return it;
};

if (alertParamName("lastfm_user", "lastfm_api_key", "librefm_api_key", "librefm_user", "librefm_secret", "token")) {
    if (mountPoint) {
        // render(<App {...params}/>, mountPoint);
        const url = createSessionUrl(libre2_0, params.librefm_api_key as string, params.token as string, params.librefm_secret as string);
        const crSess = document.createElement("div");
        crSess.innerHTML = `Creating session (<a href="${url}">${url}</a>)`;
        mountPoint.appendChild(crSess);

        makeGetRequest(url, function () {
            const json = JSON.parse(this.responseText);
            if (json && json.key) {
                mountPoint.appendChild(errorNode("Could not create session: " + json.error));
            } else
                mountPoint.appendChild(div("Created session with session key " + json.key));
        }, () => {
            mountPoint.appendChild(errorNode("Could not create session"));
        });

        // <lfm status="ok">
        //     <session>
        //         <name>ocky7</name>
        //         <key>0af19b3f97a91fb8c1c903de1d4f7e08</key>
        //         <subscriber>0</subscriber>
        //     </session>
        // </lfm>
        //mountPoint.appendChild(a(url, url));
    }
}
