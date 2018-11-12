import * as React from "react";
import {ChangeEventHandler, StatelessComponent} from "react";

export const ShowOutput: StatelessComponent<{ showJson: boolean, onChange: ChangeEventHandler<HTMLInputElement>, scrobbles: any }> =
    ({showJson, onChange, scrobbles}) => <div>
        <div className="show-output-wrapper">
            <input type="checkbox"
                   id="show-output"
                   name="show-output"
                   defaultChecked={showJson}
                   onChange={onChange}/><label htmlFor="show-output">Show output</label></div>
        <textarea className={`output-json output-tall ${showJson ? "visible" : "hidden"}`}
                  value={showJson ? JSON.stringify(scrobbles) : ""}
                  readOnly={true}
        />
    </div>;