/*!
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

import {createDiv, setPixels} from "./utils";

function yearText(date, mod)   {
    var v = date.getFullYear(),
        p = ! (v % mod);
    return {
        plus: p,
        text: v
    };
}

const MT = [
    function(date)  {       // MILLISECOND
        var v = date.getMilliseconds();
        return {
            plus: !v,
            text: v
        };
    },
    function(date)  {       // SECOND
        var v = date.getSeconds();
        return {
            plus: !v,
            text: v
        };
    },
    function(date)  {       // MINUTE
        var v = date.getMinutes();
        return {
            plus: !v,
            text: v || date.getHours()
        };
    },
    function(date)  {       // HOUR
        var v = date.getHours();
        return {
            plus: !v,
            text: v || date.getDate()
        };
    },
    function(date, locale)  {       // DAY
        var v = date.getDate();
        return {
            plus: v === 1,
            text: v === 1 ? date.toLocaleDateString(locale, {
                month: 'short'
            }) : v
        };
    },
    function(date, locale)  {       // WEEK
        return {
            plus: false,
            text: date.toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric'
            })
        };
    },
    function(date, locale)  {       // MONTH
        var v = date.getMonth();
        return v ? {
            plus: false,
            text: date.toLocaleDateString(locale, {
                month: 'short'
            })
        } : yearText(date, 1);
    },
    function(date)  {       // YEAR
        return yearText(date, 10);
    },
    function(date)  {       // DECADE
        return yearText(date, 100);
    },
    function(date)  {       // CENTURY
        return yearText(date, 1000);
    },
    function(date)  {       // MILLENNIUM
        return yearText(date, 10000);
    }
];

export default function Markers(content)
{
    this.content = content;
    this.band = content.band;
    this.widget = content.widget;
    this.markerText = MT[content.band.scale];

    this.element = createDiv('d-markers');
}

Markers.prototype = {

    render: function()
    {
        let beginDate = this.content.range.begin,
            endDate = this.content.range.end,
            nextDate = new Date(beginDate),
            mt, fc, el;

        while ((fc = this.element.firstChild)) {
            this.element.removeChild(fc);
        }

        this.band.ceilDate(nextDate);

        while (nextDate < endDate)  {
            mt = this.markerText(nextDate, this.widget.settings.locale);

            el = createDiv('d-marker');
            if (mt.plus) el.classList.add('d-plus');
            setPixels(el, 'left', this.band.calcPixels(nextDate - beginDate));
            el.innerText = mt.text;

            this.element.append(el);
            this.band.incrDate(nextDate);
        }
    }
};
