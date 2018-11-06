import * as React from "react";
import {StatelessComponent} from "react";

function classNameInput(value: any) {
    return value ? "label-input-set" : "label-input-empty";
}

interface ApiParameterProps {
    defaultValue: string;
    type?: string;
    currentValue: any;
    title: string;
    htmlFor: string;
    onChange: (e: any) => any;
}

export const ApiParameter: StatelessComponent<ApiParameterProps> = ({
                                                                        defaultValue,
                                                                        currentValue,
                                                                        type,
                                                                        title,
                                                                        htmlFor,
                                                                        onChange,
                                                                    }) =>
    <div className="api-parameter">
        <label className={"api-parameter-label " + classNameInput(currentValue)}
               htmlFor={htmlFor}>{title}</label>
        <input className="api-parameter-input"
               defaultValue={defaultValue}
               type={type || "text"}
               name={htmlFor}
               onChange={onChange}/>
    </div>;
