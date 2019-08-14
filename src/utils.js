/*!
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

export function createDate(date)   {
    return date instanceof Date ? date : new Date(date);
}

export function createDiv(...classNames)
{
    let r = document.createElement('div');
    r.classList.add(...classNames);
    return r;
}

export function showElement(...elements)
{
    elements.forEach(e => {e.classList.remove('d-hidden');});
}

export function hideElement(...elements)
{
    elements.forEach(e => {e.classList.add('d-hidden');});
}

export function setPixels(element, prop, pxl)
{
    element.style[prop] = pxl + 'px';
}
