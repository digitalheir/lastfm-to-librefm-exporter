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
        children.push(<div className="status-line-page">Done! ({scrobbleNum} scrobbles)</div>);
    else if (showUrl && (startpage > 1 || totalPages > 0))
        children.push(<div className="status-line-page">{startpage} / {totalPages} ({scrobbleNum} scrobbles so
            far)</div>);
    if (showUrl && url)
        children.push(<div className="status-line-url"><a href={url}>{url}</a></div>);
    children.push(retrying > 0 ? <ErrorMessage errorMessage={errorMessage} retrying={retrying}/>
        : errorMessage ? <ErrorMessage errorMessage={errorMessage}/>
            : url ? <div className="status-line">Fetching</div>
                : retrying === -200 ? <div className="status-line">Received {scrobbleNum} tracks</div>
                    : <div className="status-line"/>);
    return <div className="status">{children}</div>;
};