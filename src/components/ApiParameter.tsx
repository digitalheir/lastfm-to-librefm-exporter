import * as React from "react";
import {PureComponent} from "react";

function classNameInput(value: any, preferred?: string) {
    return value ? preferred ? preferred : "label-input-set" : "label-input-empty";
}

interface ApiParameterProps {
    defaultValue: string;
    type?: string;
    currentValue: any;
    title: string;
    htmlFor: string;
    classNameWhenSet?: string;
    onChange: (e: any) => any;
}

interface ApiParameterState {
}

export class ApiParameter extends PureComponent<ApiParameterProps, ApiParameterState> {
    // noinspection TypeScriptFieldCanBeMadeReadonly
    private input: any;

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: any) {
        this.props.onChange(event);
    }

    render() {
        const {
            children,
            defaultValue,
            currentValue,
            type,
            title,
            htmlFor,
            classNameWhenSet
        } = this.props;
        return <div className="api-parameter">
            <label
                className={"api-parameter-cell api-parameter-label " + classNameInput(currentValue, classNameWhenSet)}
                htmlFor={htmlFor}>{title}</label>
            <input className="api-parameter-cell api-parameter-input"
                   defaultValue={defaultValue}
                   type={type || "text"}
                   name={htmlFor}
                   id={htmlFor}
                   ref={i => this.input = i}
                   onChange={this.handleSubmit}/>
            {children}
        </div>;
    }
}