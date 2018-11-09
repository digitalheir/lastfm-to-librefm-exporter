import {StatelessComponent} from "react";
import * as React from "react";

interface SubtitledSectionProps {
    // subtitle?: string;
    title: string;
    id: string;
}

export const SubtitledSection: StatelessComponent<SubtitledSectionProps> = ({children, id, title}) => {
    return title ? <section className="subtitled" id={id}>
        <h2 key="title">{title}</h2>
        {children}
    </section> : <section className="subtitled" id={id}>
        {children}
    </section>;
};
/*<div key="content">*/
// </div>