/*!
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import Content from './Content';
import {createDiv, hideElement, setPixels, showElement} from "./utils";
import anime from 'animejs/lib/anime.es.js'; // https://animejs.com/

const hlprs = [
    {   // 0, MILLISECOND
        ms: 1,
        big: 10,
        loc: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
        floor: function(date, multiple)  {
            let v = date.getMilliseconds();
            date.setMilliseconds(v - v % multiple);
        },
        incr: function(date, multiple)  {
            date.setMilliseconds(date.getMilliseconds() + multiple);
        },
    },
    {   // 1, SECOND
        ms: 1000,
        big: 10,
        loc: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
        floor: function(date, multiple)  {
            let v = date.getSeconds();
            date.setSeconds(v - v % multiple, 0);
        },
        incr: function(date, multiple)  {
            date.setSeconds(date.getSeconds() + multiple, 0);
        },
    },
    {   // 2, MINUTE, 60 secs
        ms: 60000,
        big: 10,
        loc: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
        floor: function(date, multiple)  {
            let v = date.getMinutes();
            date.setMiMinutes(v - v % multiple, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setMinutes(date.getMinutes() + multiple, 0, 0);
        },
    },
    {   // 3, HOUR, 3600 secs
        ms: 3600000,
        big: 10,
        loc: { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        floor: function(date, multiple)  {
            let v = date.getHours();
            date.setHours(v - v % multiple, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setHours(date.getHours() + multiple, 0, 0, 0);
        },
    },
    {   // 4, DAY, 24 hours = 86,400 secs
        ms: 86400000,
        big: 7,
        loc: { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit' },
        floor: function(date, multiple)  {
            const ms = 86400000;
            let v = date.getTime() / ms;   // days since 01-01-1970
            date.setTime((v - v % multiple) * ms);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setDate(date.getDate() + multiple);
        },
    },
    {   // 5, WEEK, 7 days = 604,800 secs
        ms: 604800000,
        big: 10,
        loc: { year: 'numeric', month: 'long', day: 'numeric' },
        floor: function(date, multiple)  {
            const ms = 604800000;
            let v = date.getTime();
            v -= 345600000;            // 4 days; set to sunday (01-01-1970 is thursday
            v /= ms;                   // weeks since 01-01-1970
            date.setTime((v - v % multiple) * ms);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setDate(date.getDate() + 7 * multiple);
        },
    },
    {   // 6, MONTH, 1/12 year = 2,629,743.75 secs
        ms: 2629743750,
        big: 12,
        loc: { year: 'numeric', month: 'long', day: 'numeric' },
        floor: function(date, multiple)  {
            let v = date.getMonth();
            date.setMonth(v - v % multiple, 1);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setMonth(date.getMonth() + multiple, 1);
        },
    },
    {   // 7, YEAR, 365.2421875 days = 31,556,925 secs
        ms: 31556925000,
        big: 10,
        loc: { year: 'numeric', month: 'long', day: 'numeric' },
        floor: function(date, multiple)  {
            let v = date.getFullYear();
            date.setFullYear(v - v % multiple, 0, 1);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setFullYear(date.getFullYear() + multiple, 0, 1);
        },
    },
    {   // 8, DECADE, 10 years
        ms: 315569250000,
        big: 10,
        loc: { year: 'numeric', month: 'long', day: 'numeric' },
        floor: function(date, multiple)  {
            let v = date.getFullYear();
            date.setFullYear(v - v % (10 * multiple), 0, 1);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setFullYear(date.getFullYear() + 10 * multiple, 0, 1);
        },
    },
    {   // 9, CENTURY, 100 years
        ms: 3155692500000,
        big: 10,
        loc: { year: 'numeric', month: 'numeric' },
        floor: function(date, multiple)  {
            let v = date.getFullYear();
            date.setFullYear(v - v % (100 * multiple), 0, 1);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setFullYear(date.getFullYear() + 100 * multiple, 0, 1);
        },
    },
    {   // 10, MILLENNIUM, 1000 years
        ms: 31556925000000,
        big: 10,
        loc: { year: 'numeric', month: 'numeric' },
        floor: function(date, multiple)  {
            let v = date.getFullYear();
            date.setFullYear(v - v % (1000 * multiple), 0, 1);
            date.setHours(0, 0, 0, 0);
        },
        incr: function(date, multiple)  {
            date.setFullYear(date.getFullYear() + 1000 * multiple, 0, 1);
        },
    },
];

let scope, clientX, clientY,
    touchId, posX, velo, timeStamp,
    animation = 0;

const inertia = 500,     // if higher, kinetic effect is stronger
    slow = 0.1,          // if higher, higher velocity is needed for kinetic effect
    duration = 1500,     // duration of kinetic effect in ms
    nervous = 0.6;       // if higher, dependence of final velocity is higher

function getTouch(evt)
{
    for (let i = 0; i < evt.changedTouches.length; i++)    {
        if (evt.changedTouches[i].identifier === touchId) return evt.changedTouches[i];
    }
    return null;
}

function onTouchMove(evt)
{
    evt.preventDefault();
    let t = getTouch(evt);
    if (t) {
        let x = t.clientX;

        scope.move(x - posX);

        velo *= 1 - nervous;
        velo += nervous * ((x - posX) / (evt.timeStamp - timeStamp));
        posX = x;
        timeStamp = evt.timeStamp;
    }
}

function onTouchCancel(evt)
{
    evt.preventDefault();
    touchId = undefined;
}

function onTouchEnd(evt)
{
    evt.preventDefault();
    let t = getTouch(evt);

    touchId = undefined;
    if (! t) return;

    if (Math.abs(velo) > slow)  {
        posX = 0;

        animation = anime({
            targets: { x: 0 },
            x: velo * inertia,
            duration: duration,
            easing: 'easeOutExpo',
            update: anim => { let x = anim.animations[0].currentValue; scope.move(x - posX); posX = x; },
            complete: anim => { animation = 0; scope.endDrag(); }
        });
    }
    else    {
        if (Math.abs(t.clientX - clientX) < 4 && Math.abs(t.clientY - clientY) < 4) {
            // we hardly moved, this is a click event
            scope.click(t.clientX);
        }
        else scope.endDrag();
    }
}

function onTouchStart(evt)
{
    evt.preventDefault();

    if (touchId === undefined)   {   // skip if touch is ongoing (this must be a second or third finger)
        if (animation) {
            animation.pause();
            animation = 0;
        }

        touchId = evt.changedTouches[0].identifier;
        posX = clientX = evt.changedTouches[0].clientX;
        clientY = evt.changedTouches[0].clientY;
        timeStamp = evt.timeStamp;
        velo = 0;
    }
}

function onMouseMove(evt)
{
    evt.preventDefault();
    scope.move(evt.movementX);
}

function onMouseUp(evt)
{
    if (Math.abs(evt.clientX - clientX) < 4 && Math.abs(evt.clientY - clientY) < 4) {
        // we hardly moved, this is a click event
        scope.click(evt.clientX);
    }
    else scope.endDrag();
    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'mouseup', onMouseUp, false );
}

function onMouseDown(evt)
{
    clientX = evt.clientX;
    clientY = evt.clientY;

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
}

export default function Band(widget, bandInfo, index)
{
    this.widget = widget;
    this.index = index;
    Object.assign(this, { multiple: 1}, bandInfo);

    this.helpers = hlprs[this.scale];

    this.before = createDiv('d-range', 'd-before');
    this.after = createDiv('d-range', 'd-after');

    this.leftIndicator = createDiv('d-indicator', 'd-left', 'd-hidden');
    this.leftIndicator.addEventListener('mousedown', e => {
        this.stepLeft(e.shiftKey);
        e.preventDefault();
    });
    this.rightIndicator = createDiv('d-indicator', 'd-right', 'd-hidden');
    this.rightIndicator.addEventListener('mousedown', e => {
        this.stepRight(e.shiftKey);
        e.preventDefault();
    });

    this.content = new Content(this);

    let el = createDiv('d-band', 'd-band-' + index, 'd-scale-' + this.scale);
    el.setAttribute('tabindex', '0');
    el.style.height = this.size;
    el.append(this.before, this.after, this.content.element, this.leftIndicator, this.rightIndicator);

    el.addEventListener('touchstart', evt => { this.focus(); onTouchStart(evt); }, false);
    el.addEventListener('touchmove', onTouchMove, false);
    el.addEventListener('touchend', onTouchEnd, false);
    el.addEventListener('touchcancel', onTouchCancel, false);
    el.addEventListener('mousedown', onMouseDown, false);

    el.addEventListener('focus', e => {
        showElement(this.leftIndicator, this.rightIndicator);
        this.widget.focus = this.index;
        this.focus();
    });
    el.addEventListener('blur', e => {
        hideElement(this.leftIndicator, this.rightIndicator);
    });
    el.addEventListener('keydown', e => {
        let w = this.widget, prev = true;

        switch (e.key) {
            case 'Tab':
                let events = w.events,
                    i, target;

                if (e.shiftKey) {
                    i = events.binInsertPosOf({ start: w.getMs() - 1 });
                    target = i > 0 ? events[i - 1].start : w._begin;
                }
                else    {
                    i = events.binInsertPosOf({ start: w.getMs() + 1 });
                    target = i < events.length ? events[i].start : w._end;
                }
                if (target) this.animateTo(target.getTime());  // target may be undefined
                break;
            case 'PageUp':
                this.stepRight(true);
                break;
            case 'PageDown':
                this.stepLeft(true);
                break;
            case 'End':
                if (w._end)   {
                    this.animateTo(w._end.getTime());
                }
                break;
            case 'Home':
                if (w._begin)   {
                    this.animateTo(w._begin.getTime());
                }
                break;
            case 'ArrowLeft':
                this.stepLeft(e.shiftKey);
                break;
            case 'ArrowUp':
                w.cycleFocus(-1);
                break;
            case 'ArrowRight':
                this.stepRight(e.shiftKey);
                break;
            case 'ArrowDown': // down arrow
                w.cycleFocus(1);
                break;
            default:
                prev = false;
                break;
        }
        if (prev)    {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    this.element = el;
}

Band.prototype = {

    setWidth: function(w)   {
        this.content.setWidth(w);
    },

    place: function()   {
        this.content.place();
    },

    setFocus: function()   {
        this.element.focus();
    },

    setRange: function(range)   {
        let cursor = this.widget._cursor;
        if (range)  {
            setPixels(this.before, 'width', this.calcPixels(cursor - range.begin));
            setPixels(this.after, 'width', this.calcPixels(range.end - cursor));
        }
        else    {
            this.before.style.width = null;
            this.after.style.width = null;
        }
    },

    setRangeFrom: function(band)    {
        this.setRange(band.content.visible);
    },

    calcPixels: function(millisecs) {
        let p = millisecs * this.interval / this.helpers.ms;
        return +(Math.round(p + "e+3")  + "e-3");
    },

    calcMs: function(pixels)    {
        return pixels * this.helpers.ms / this.interval;
    },

    stepLeft: function(big)   {
        let w = this.widget;
        this.animateTo(w.getMs() - (big ? this.helpers.big : 1) * this.helpers.ms);
    },

    stepRight: function(big)   {
        let w = this.widget;
        this.animateTo(w.getMs() + (big ? this.helpers.big : 1) * this.helpers.ms);
    },

    floorDate: function(date)    {
        this.helpers.floor(date, this.multiple);
    },

    ceilDate: function(date)    {
        this.helpers.floor(date, this.multiple);
        this.helpers.incr(date, this.multiple);
    },

    incrDate: function(date)    {
        this.helpers.incr(date, this.multiple);
    },

    animateTo: function(ms) {
        let dist = this.calcPixels(Math.abs(this.widget.getMs() - ms));
        this.widget.animateTo(ms, 100 * Math.log(dist));
    },

    focus: function()   {
        scope = this;
    },

    move(dx)   {
        this.widget.place(this.widget.getMs() - this.calcMs(dx));
    },

    endDrag: function()  {
        this.widget.triggerChange();
    },

    click: function(x)   {
        let rect = this.element.getBoundingClientRect();
        this.animateTo(this.content.visible.begin.getTime() + this.calcMs(x - rect.x));
    }
};
