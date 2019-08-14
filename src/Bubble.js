/*
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import {createDiv, showElement, hideElement, setPixels} from "./utils";

export default function Bubble(widget)
{
    this.widget = widget;

    this.info = createDiv('d-info');
    let el = createDiv('d-bubble', 'd-hidden');
    let close = createDiv('d-close');
    close.innerHTML = '&times;';
    close.addEventListener('click', e => {
        this.hide();
    });
    el.append(close, this.info);

    this.element = el;
}

Bubble.prototype = {
    show: function(pos)    {
        showElement(this.element);
        setPixels(this.element, 'left', pos.left);
        setPixels(this.element, 'top', pos.top);
        return this;
    },

    hide: function()    {
        hideElement(this.element);
        this.widget.clearHilight();
        return this;
    },

    setInfo: function(h)   {
        this.info.innerHTML = h;
        return this;
    }
};
