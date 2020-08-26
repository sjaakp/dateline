/*
 * Dateline 2.0.3
 * (c) 2019-2020 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import './dateline.scss';
import SortedArray from './SortedArray';
import Bubble from './Bubble';
import Band from './Band';
import {createDate, createDiv} from './utils';
import anime from 'animejs/lib/anime.es.js';

export const MILLISECOND = 0;
export const SECOND = 1;
export const MINUTE = 2;
export const HOUR = 3;
export const DAY = 4;
export const WEEK = 5;
export const MONTH = 6;
export const YEAR = 7;
export const DECADE = 8;
export const CENTURY = 9;
export const MILLENNIUM = 10;

// @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
    var storage;
    try {
	storage = window[type];
	var x = '__storage_test__';
	storage.setItem(x, x);
	storage.removeItem(x);
	return true;
    }
    catch(e) {
	return e instanceof DOMException && (
	    e.code === 22 ||
	    e.code === 1014 ||
	    e.name === 'QuotaExceededError' ||
	    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
	    (storage && storage.length !== 0);
    }
}

const defaults = {
    size: '320px',
    bands: [
	{
	    size: '100%',
	    scale: MONTH,
	    interval: 60
	}
    ],

    cursor: new Date(),
    rememberCursor: true,
    begin: null,
    end: null,
    events: [],

    redirect: false,
    url: false,
    loading: 'Loading&hellip;',
    scrollFactor: 5,

    locale: 'default',
};

export function Widget(id, options)
{
    this.id = id;
    this.settings = Object.assign({}, defaults, options);
    ['begin', 'end', 'cursor'].forEach(p => {
	if (this.settings[p]) this['_' + p] = createDate(this.settings[p]);
    });

    if (this.settings.rememberCursor && storageAvailable('sessionStorage'))   {
	// get cursor out of session storage, if available
	let ses = parseInt(window.sessionStorage.getItem('dateline_' + this.id), 10);
	if (ses) this._cursor.setTime(ses);
    }

    let el = document.getElementById(id);
    el.classList.add('d-dateline');
    el.setAttribute('tabindex', '0');
    el.style.height = this.settings.size;

    let compStyle = window.getComputedStyle(el);
    this.lineHeight = parseInt(compStyle.getPropertyValue('line-height'), 10);

    this.inner = createDiv('d-inner');

    this.bubble = new Bubble(this).setInfo('Bubble');
    el.append(this.inner, this.bubble.element);

    this.element = el;
    this.focus = 0;

    this.prepareBands();
    this.prepareEvents();

    this.setWidth();

    this._hilight = null;
    this._intval = null;
    this._busy = false;

    Object.defineProperty(this, 'cursor', {
	get() { return new Date(this._cursor); },
	set(date) { this.animateTo(createDate(date).getTime()); },
	enumerable: true,
	configurable: true
    });

    // console.log(this);
}

Widget.prototype = {
    prepareBands: function()    {
	var bands = this.settings.bands;

	if (! bands.length)    {
	    this.inner.innerHTML = 'No bands defined.';
	}

	this.bands = bands.map(function(v, i, a) {
	    let r = new Band(this, v, i);
	    this.inner.append(r.element);
	    return r;
	}, this);

    },

    prepareEvents: function()   {
	this.events = new SortedArray((a, b) => a.start > b.start);
	this.settings.events.forEach(d => {
	    ['start', 'stop', 'post_start', 'pre_stop'].forEach(p => { if (d[p]) d[p] = createDate(d[p])});

	    d.elements = [];    // cache

	    this.events.insert(d);
	});
    },

    getWidth: function()    {
	return this.element.clientWidth;
    },

    setWidth: function()   {
	let w = this.element.clientWidth * this.settings.scrollFactor;
	this.bands.forEach(function(v) {
	    v.setWidth(w);
	});
	this.sync();
    },

    place: function(ms)  {
	let t;

	this.bubble.hide();

	if (this._begin && ms < (t = this._begin.getTime())) {
	    ms = t;
	}
	if (this._end && ms > (t = this._end.getTime())) {
	    ms = t;
	}
	this._cursor.setTime(ms);
	this.bands.forEach(v => { v.content.place(); });
	this.sync();
    },

    animateTo: function(ms, duration)    {
	if (! this._busy)   {
	    this._busy = true;
	    let a = { cursor: this.getMs() }, t;

	    if (this._begin && ms < (t = this._begin.getTime())) ms = t;
	    if (this._end && ms > (t = this._end.getTime())) ms = t;

	    anime({
		targets: a,
		cursor: ms,
		duration: duration || 800,
		easing: 'easeInOutCubic',
		update: anim => { this.place(a.cursor); },
		complete: anim => { this._busy = false; this.triggerChange(); }
	    });
	}
    },

    getMs: function()   {
	return this._cursor.getTime();
    },

    sync: function()   {
	let prev;
	this.bands.forEach(v => {
	    if (prev) { v.setRangeFrom(prev); }
	    prev = v;
	});
    },

    cycleFocus: function(step)  {
	var mod = this.bands.length,
	    i = this.focus;

	i+= mod + step;
	i%= mod;
	this.bands[i].setFocus();
    },

    hilight: function(elmt)    {
	this.clearHilight();
	this._hilight = elmt;
	elmt.classList.add('d-hilight');
	this._intval = window.setInterval(ref => {
	    ref._hilight.classList.toggle('d-hilight');
	}, 500, this);
    },

    clearHilight: function()   {
	if (this._intval)   {
	    window.clearInterval(this._intval);
	    this._intval = null;
	}
	if (this._hilight)  {
	    this._hilight.classList.remove('d-hilight');
	    this._hilight = null;
	}
    },

    triggerChange: function()   {
	this.element.dispatchEvent(new CustomEvent( 'datelinechange', {
	    bubbles: true,
	    detail: new Date(this._cursor)
	} ));
	if (storageAvailable('sessionStorage')) {
	    window.sessionStorage.setItem('dateline_' + this.id, this._cursor.getTime());  // cursor into session storage
	}
    },

    find: function(id) {
	// use == in stead of === to find string key in case id is integer
	let found = this.events.find(v => v.id == id);
	if (found)  {
	    this.animateTo(found.start.getTime());
	}
	return found;
    }
};
