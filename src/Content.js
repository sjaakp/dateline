/*!
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import Markers from './Markers';
import Events from './Events';
import {createDiv, setPixels} from "./utils";

export default function Content(band)
{
    this.band = band;
    this.widget = band.widget;
    this.center = new Date(this.widget._cursor);

    this.range = {
        begin: new Date(),
        end: new Date()
    };
    this.safe = {
        begin: new Date(),
        end: new Date()
    };
    this.visible = {
        begin: new Date(),
        end: new Date()
    };

    let el = createDiv('d-content');

    this.markers = new Markers(this);
    this.events = new Events(this);

    el.append(this.markers.element, this.events.element);

    this.element = el;
}

Content.prototype = {

    render: function()  {
        let w = this.widget,
            beginDate = this.range.begin,
            endDate = this.range.end;

        this.markers.render();
        this.events.render();

        let limits = this.element.querySelectorAll('.d-limit');
        limits.forEach(v => { v.remove(); });

        if (w._begin && w._begin > beginDate && w._begin < endDate) {
            let el = createDiv('d-limit', 'd-begin');
            setPixels(el, 'right', this.calcRight(w._begin));
            this.element.append(el);
        }

        if (w._end && w._end > beginDate && w._end < endDate) {
            let el = createDiv('d-limit', 'd-end');
            setPixels(el, 'left', this.calcLeft(w._end));
            this.element.append(el);
        }
    },

    setWidth: function(w)    {
        this.width = w;
        this.calcRange();
        setPixels(this.element, 'width', w);
        this.place();
        this.render();
    },

    calcLeft: function(date)    {
        return this.band.calcPixels(date - this.range.begin);
    },

    calcRight: function(date)    {
        return this.band.calcPixels(this.range.end - date);
    },

    calcRange: function()   {
        let c = this.center.getTime(),  // center date in millisecs
            tau = this.band.calcMs(this.width) / 2, // half range in pixels
            tauSafe = 2 * tau / 3;

        this.range.begin.setTime(c - tau);
        this.range.end.setTime(c + tau);
        this.safe.begin.setTime(c - tauSafe);
        this.safe.end.setTime(c + tauSafe);
    },

    place: function()   {
        let cursor = this.widget._cursor,
            ww = this.widget.getWidth(),
            c, tau;
        if (cursor < this.safe.begin || cursor > this.safe.end) {
            this.center.setTime(cursor.getTime());
            this.calcRange();
            this.render();
        }
        setPixels(this.element, 'left', this.band.calcPixels(this.center - cursor)
            - (this.width - ww) / 2);

        c = cursor.getTime();
        tau = this.band.calcMs(ww) / 2; // half range in msec
        this.visible.begin.setTime(c - tau);
        this.visible.end.setTime(c + tau);
    },
};
