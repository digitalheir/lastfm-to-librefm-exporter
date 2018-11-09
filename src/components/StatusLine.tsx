import * as React from "react";

const ErrorMessage: React.StatelessComponent<{ errorMessage: string | undefined, retrying?: number }> = ({errorMessage, retrying}) =>
    errorMessage ? retrying ? <div className="status-line">{errorMessage}<br/>Retrying in {retrying} seconds</div>
        : <div className="status-line">{errorMessage}</div>
        : <div className="status-line">Retrying in {retrying} seconds</div>;

export const StatusLine: React.StatelessComponent<{
    errorMessage: string | undefined,
    url: string | undefined,
    scrobbleNum: number,
    startpage: number,
    totalPages: number,
    retrying: number
}> = ({errorMessage, url, retrying, startpage, totalPages, scrobbleNum}) => {
    const children = [];
    const showUrl = (!errorMessage || retrying >= 0);
    if (retrying === -200)
        children.push(<div key="done" className="status-line-page">Done! Received {scrobbleNum} tracks.</div>);
    else if (showUrl && (startpage > 1 || totalPages > 0))
        children.push(<div key="progress" className="status-line-page">{startpage} / {totalPages} ({scrobbleNum} scrobbles so
            far)</div>);
    if (showUrl && url)
        children.push(<div key="url" className="status-line-url"><a href={url}>{url}</a></div>);
    children.push(retrying > 0 ? <ErrorMessage key="retrying" errorMessage={errorMessage} retrying={retrying}/>
        : errorMessage ? <ErrorMessage key="retrying" errorMessage={errorMessage}/>
            : url ? <div key="retrying" className="status-line">Fetching ...</div>
                : <div key="retrying" className="status-line"/>);
    return <pre className="status">{children}</pre>;
};
