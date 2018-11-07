import * as React from "react";
import {StatelessComponent} from "react";

function classNameInput(value: any) {
    return value ? "label-input-set" : "label-input-empty";
}

interface ApiParameterProps {
    defaultValue: string;
    type?: string;
    id?: string;
    currentValue: any;
    title: string;
    htmlFor: string;
    onChange: (e: any) => any;
}

export const ApiParameter: StatelessComponent<ApiParameterProps> = ({
                                                                        id,
                                                                        children,
                                                                        defaultValue,
                                                                        currentValue,
                                                                        type,
                                                                        title,
                                                                        htmlFor,
                                                                        onChange,
                                                                    }) =>
    <div className="api-parameter">
        <label className={"api-parameter-cell api-parameter-label " + classNameInput(currentValue)}
               htmlFor={htmlFor}>{title}</label>
        <input className="mdc-text-field api-parameter-cell api-parameter-input"
               id={id ? id : ""}
               defaultValue={defaultValue}
               type={type || "text"}
               name={htmlFor}
               onChange={onChange}/>
        {children}
    </div>;
