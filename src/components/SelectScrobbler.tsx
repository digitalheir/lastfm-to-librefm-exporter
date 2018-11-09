import * as React from "react";
import {StatelessComponent} from "react";
import {ChangeEventHandler} from "react";

const options = ["Last.fm", "Libre.fm"];

export const SelectScrobbler: StatelessComponent<{ selected: string, onChange: ChangeEventHandler<HTMLSelectElement> }> = ({onChange, selected}) =>
    <select onChange={onChange}>
        {
            options.map(name => <option key={name} selected={selected === name} value={name}>{name}</option>)
        }
    </select>;