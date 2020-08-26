/*
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import {createDiv, setPixels} from "./utils";

export default function Events(content)
{
    this.content = content;
    this.band = content.band;
    this.widget = content.widget;

    this.renderEvent = content.band.layout === 'overview' ? this.renderOverviewEvent : this.renderNormalEvent;

    this.element = createDiv('d-events');
    this.overflows = [];
}

Events.prototype = {
    render: function()  {
        let i, ev, events = this.widget.events,
            range = this.content.range,

            // events are sorted with respect to property start, so create plain object accordingly
            iBegin = events.binInsertPosOf({ start: range.begin }),
            iEnd = events.binInsertPosOf({ start: range.end }),
            fc;

        while ((fc = this.element.firstChild)) {
            this.element.removeChild(fc);
        }

        this.nLines = Math.floor((this.element.clientHeight) / this.widget.lineHeight);
        this.lines = [];
        for (i = 0; i < this.nLines; i++)   { this.lines.push(0); }

        this.topMargin = (this.element.clientHeight - this.nLines * this.widget.lineHeight) / 2;

        for (i = 0; i < iBegin; i++)    {       // render Duration Events if they stop after rangeBox.begin
            ev = events[i];
            if (ev.stop && ev.stop > range.begin)   {
                this.renderEvent(ev);
            }
        }

        for (i = iBegin; i < iEnd; i++) {       // render all Events if start is within rangeBox
            this.renderEvent(events[i]);
        }

        this.overflows.forEach(v => {
            let found = this.widget.events.findIndex(t => t === v );
            if (found > -1) this.widget.events.splice(found, 1);
        });
    },

    renderNormalEvent: function(event)    {
        let band = this.band,
            index = band.index,
            range = this.content.range,
            pos = this.calcPos(event.start),
            locale = this.widget.settings.locale,
            elmt, label, ttl, cls, strt, stp;

        if (pos) {                          // skip if no position available

            if (event.elements[index])  {   // cached
                elmt = event.elements[index];
            }

            else    {
                elmt = document.createElement('div');
                ttl = event.start.toLocaleString(locale, this.band.helpers.loc);

                if (event.class) elmt.className = event.class;
                elmt.innerHTML = event.text;
                elmt.dataset.id = event.id;

                if (event.stop)   {         // duration event
                    ttl += ' ... ' + event.stop.toLocaleString(locale, this.band.helpers.loc);

                    elmt.classList.add('d-tape-event');
                    elmt.prepend(createDiv('d-tape'));
                }
                else    {                   // create new instant event
                    elmt.classList.add('d-event');
                }

                elmt.title = ttl;

                if (this.widget.settings.url || this.widget.settings.func)   {
                    ['touchstart', 'touchend', 'mousedown'].forEach( p => {
                        elmt.addEventListener(p, e => {
                            e.stopPropagation();    // prevent that Content handles event
                        });
                    });

                    elmt.addEventListener('click', e => {
                        this.widget.hilight(e.target);

			// redirect to new page
			if (this.widget.settings.url && this.widget.settings.redirect) {
                            window.location = this.widget.settings.url + e.target.dataset.id;
			} else {
			    // show info bubble
                            let rect = this.band.element.getBoundingClientRect();
                            let pos = {
                                top: e.clientY - e.offsetY - rect.y,
                                left: e.clientX - e.offsetX - rect.x
                            };

                            let bub = this.widget.bubble;

			    bub.show(pos).setInfo(this.widget.settings.loading);

			    if (this.widget.settings.url) {
				// fill it with data via AJAX
				let url = this.widget.settings.url + e.target.dataset.id,
				    request = new XMLHttpRequest();

				request.open('GET', url, true);

				request.onloadend = function() {
                                    if (this.status >= 200 && this.status < 400) {
					bub.setInfo(this.response);
                                    }
				};
				request.send();
			    } else {
				// fill it with data from function
				bub.setInfo(this.widget.settings.func(event));
			    }
                        }
                    });
                }

                event.elements[index] = elmt;   // cache
            }

            setPixels(elmt, 'left', pos.left);
            setPixels(elmt, 'top', pos.line * this.widget.lineHeight + this.topMargin);

            if (event.stop) {       // duration event
                strt = Math.max(event.start, range.begin);
                stp = Math.min(event.stop, range.end);

                setPixels(elmt.firstChild, 'width', Math.max(band.calcPixels(stp - strt), 1));

                if (event.post_start && event.post_start > strt)   {
                    setPixels(elmt.firstChild, 'borderLeftWidth', band.calcPixels(event.post_start - strt));
                }
                if (event.pre_stop && event.pre_stop < stp) {
                    setPixels(elmt.firstChild, 'borderRightWidth', band.calcPixels(stp - event.pre_stop));
                }
            }

            this.element.append(elmt);

            let sst = window.getComputedStyle(elmt, ':before');
            setPixels(elmt, 'marginLeft', parseInt(sst.getPropertyValue('width'), 10) / -2);

            this.lines[pos.line] = pos.left + elmt.clientWidth;    // update line
        }
        else    {
            console.warn('Dateline overflow', event);
            this.overflows.push(event);
        }
    },

    renderOverviewEvent: function(event)    {

        var index = this.band.index,
            elmt, strt, stp;

        if (event.elements[index])  {   // cached
            elmt = event.elements[index];
        }
        else    {
            elmt = createDiv(event.stop ? 'd-tape-pin' : 'd-pin');
            event.elements[index] = elmt;   // cache
        }

        if (event.stop) {       // duration event
            strt = Math.max(event.start, this.content.range.begin);
            stp = Math.min(event.stop, this.content.range.end);

            setPixels(elmt, 'left', this.content.calcLeft(strt));
            setPixels(elmt, 'width', Math.max(this.band.calcPixels(stp - strt), 1));
        }
        else    {               // instant event
            setPixels(elmt, 'left', this.content.calcLeft(event.start));
        }

        this.element.append(elmt);
    },

    calcPos: function(date) {   // check for free line; if not available, return false
        let x = this.content.calcLeft(date), i;

        for (i = 0; i < this.nLines; i++)   {
            if (x >= this.lines[i]) {
                break;
            }
        }
        return i >= this.nLines ? false : {
            left: x,    // left in pixel
            line: i
        };
    },
};
