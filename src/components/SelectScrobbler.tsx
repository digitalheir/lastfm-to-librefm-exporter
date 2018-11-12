import * as React from "react";
import {StatelessComponent} from "react";
import {ChangeEventHandler} from "react";

const options = ["Last.fm", "Libre.fm", "Scrobble.fm"];

export const SelectScrobbler: StatelessComponent<{ selected: string, onChange: ChangeEventHandler<HTMLSelectElement> }> = ({onChange, selected}) =>
    <select defaultValue={selected} onChange={onChange}>
        {
            options.map(name => <option key={name} value={name}>{name}</option>)
        }
    </select>;