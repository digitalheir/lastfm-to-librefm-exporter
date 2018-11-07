export function div(className: string) {
    const el = document.createElement("div");
    if(className) el.className = className;
    return el;
}