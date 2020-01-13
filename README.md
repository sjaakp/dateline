Dateline 2.0
============

**Dateline** is a widget for date-related data. You can create interactive timelines, 
which can be dragged by mouse, touch or keyboard, and displays events. 
The movements of two or more timelines ('bands') are synchronized. 
Clicking on or tapping an event displays more information or redirects you to another page.

A demo of **Dateline** is [here](https://sjaakpriester.nl/software/dateline).

See it in action at [Moordatlas.nl](https://moordatlas.nl/event/dateline) (Dutch).
At *Weltliteratur* is another [nice example](https://vossanto.weltliteratur.net/timeline/).

Here is **Dateline**'s  [GitHub page](https://github.com/sjaakp/dateline).

## Installing ##

Install **Dateline** with [npm](https://www.npmjs.com/):

	npm i @sjaakp/dateline

You can also manually install **Dateline** by [downloading the source in ZIP-format](https://github.com/sjaakp/dateline/archive/master.zip).

## Dependencies ##

Version 2.0 of **Dateline** has absolutely no dependencies. There is no need to load
jQuery or other libraries (though it won't hurt).

## Usage ##

- Link to `/dist/dateline.css` in the `<head>` part of the page.
- Create a `<div>` with an `id`. 
- Load `/dist/dateline.js` at the end of the `<body>` part.
- Call the `dateline()` method.

A minimum HTML page with a **Dateline** would look something like this:

	<html>
	<head>
        <link href="/dist/dateline.css" rel="stylesheet">
	</head>
	<body>

		<div id="dl"></div>

		<script src="/dist/dateline.js"></script>

		<script>
			dateline("dl", /* options */);
		</script>
	</body>
	</html>

## CDN ##

**Dateline** is available on the **unpkg** Content Delivery Network, so you
don't have to host the `dateline` files on your own server. In this case,
the minimum HTML page looks like this:

	<html>
	<head>
        <link href="//unpkg.com/@sjaakp/dateline/dist/dateline.css" rel="stylesheet">
	</head>
	<body>

		<div id="dl"></div>

		<script src="//unpkg.com/@sjaakp/dateline/dist/dateline.js"></script>

		<script>
			dateline("dl", /* options */);
		</script>
	</body>
	</html>


## Bands ##

At this point, Dateline displays one empty band, because there are no bands defined.
 This is done by setting the option `bands`, like so:

	dateline('dl', {
		bands: [
			{
            	size: '60%',
            	scale: Dateline.MONTH,
            	interval: 60
			},
			{
            	size: '40%',
            	scale: Dateline.YEAR,
            	interval: 80,
				layout: 'overview'
			}
		],
		/* more options... */
		});

`bands` is an array of objects, each representing a timeline, 
with the following properties:

#### interval ####

The length of a scale division in pixels.

#### scale ####

The scale division of the band. It can have one of the following values:

- `Dateline.MILLISECOND`
- `Dateline.SECOND`
- `Dateline.MINUTE`
- `Dateline.HOUR`
- `Dateline.DAY`
- `Dateline.WEEK`
- `Dateline.MONTH`
- `Dateline.YEAR`
- `Dateline.DECADE`
- `Dateline.CENTURY`
- `Dateline.MILLENNIUM`

(Yes, **Dateline**'s range is truly astonishing: from milliseconds to millennia.)

#### size ####

The height of the band as a CSS height-property. Pixels work, 
but percentages are probably easier. 
Take care that the band sizes add up to something sensible (like 100%).

#### layout ####

*Optional*. Can be one two values:

- `"normal"` (or `undefined`): events are displayed with icons and text, and are clickable. 
    This is the default value.
- `"overview"`: events are displayed in a compact ribbon, and are not clickable.
 
In most cases, you will want to have one normal band at the top, 
with several overview bands below it.

#### multiple ####

*Optional*. This value determines which scale divisions are displayed. 
If it is `2`, every other division is displayed. 
Default value is `1`, meaning that every division is displayed.

## Events ##

*Note that we're not talking about JavaScript events here!*

Events are objects which are placed on **Dateline**'s timelines. 
They are defined in Dateline's property `events`, like so:

	dateline('dl', {
		bands: [ /* several band definitions... */ ],
		events: [
			{id: "49", start: "2009-07-22", text: "Windows 7 released"},
			{id: "55", start: "1997-09-15", text: "Domain google.com registered"}),
			/* more events... */
		],
		/* more options... */
	});

Events have the following properties:

#### id ####

A unique identifier, probably (but not necessarily) a number.

#### start ####

The point in time the event takes place. 
This can be a JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date "MDN network") object 
or a string that is recognized by [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse "MDN network").

#### text ####

The text (or actually, the HTML code) displayed on the timeline.

#### class ####

*Optional*. The HTML-class(es) set to the event when it's displayed in normal layout.

### Duration events ###

Apart from the normal, *instant* events, **Dateline** also supports *duration* events. 
They have all the properties of normal events, plus the following:

#### stop ####

The point in time the event is over.

#### post_start ####

*Optional*. Indicates a degree of uncertainty in `start`.

#### pre_stop ####

*Optional*. Indicates a degree of uncertainty in `stop`.

Like `start`, these three properties can be a JavaScript `Date` object 
or a string that is recognized by `Date.parse()`.

In any case, `start` < `post_start` < `pre_stop` < `stop`.

## Cursor ##

**Dateline**'s timelines are anchored at one point in time, called the *cursor*. 
By means of the option `cursor` the starting value can be set. 
Like the event time options, `cursor` can be a JavaScript `Date` object 
or a string that is recognized by `Date.parse()`.

**Dateline** remembers the `cursor` value between visits tot the page, as long as they 
are in one browser session. If you don't like this behavior, 
set the `rememberCursor` option to `false`.

## Other options ##

**Dateline** has the following general options:

#### begin, end ####

*Optional*. The limits between where **Dateline** can be dragged. 
These options can be `null`, meaning no limit, or a JavaScript `Date` object 
or a string that is recognized by `Date.parse()`. Default: `null`.

#### size ####

*Optional*. The CSS height of **Dateline**. Default is `"320px"`.

#### url ####

*Optional*. The url **Dateline** uses when an event is clicked or tapped. 
The url is concatenated with the value of the `id` property of the clicked event.

If `false` (default), clicking or tapping an event has no effect.

#### redirect ####

*Optional*. `boolean`.

- `true`: **Dateline** redirects the browser to the location set by `url`.
- `false`: an Ajax call is made to `url`. **Dateline** displays the returned HTML 
in a pop up 'bubble' near the event.

Default is `false`.

## Property ##

#### cursor #####

**Dateline**'s property `cursor` can be read or set at any time. It is a 
JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date "MDN network") object.
It can be set by a `Data` object, or by an string that is recognized 
by [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse "MDN network").
 
## Method ##

#### find(id) ####

Tries to find the event with the given `id` property value and, if found, moves 
the timeline(s) to it. *Return:* a plain JavaScript `Object` with the event data,
`undefined` if not found.

## JavaScript event ##

#### datelinechange ####

This JavaScript event is issued whenever the `cursor` value is changed. 
The current value is sent in the `detail` property of the event data
as a JavaScript `Date` object.

One way to intercept the `datelinechange` event would be (using jQuery):

	document.addEventListener('datelinechange', e => {
	        $('#somewhere').text(e.detail.toString());
	    }
    );

## Iconizing events with Font Awesome ##

Normally, **Dateline**'s events are displayed as a big dot. They can also be displayed 
as an icon from [Font Awesome](https://fontawesome.com/). Just make sure that
 Fot Awesome is loaded and set the `class` property of the event to something 
 like `"fas fa-xxx"`.

For instance, this is the way to display an event with the 
[`'fa-anchor'` icon](https://fontawesome.com/icons/anchor?style=solid) in 
Font Awesome's `solid` style: 

	var _dl = dateline('dl', {
		bands: [ /* several band definitions... */ ],
		events: [
			{id: "42", start: "2009-07-22", class: "fas fa-anchor", text: "Anchor example"},
			/* more events... */
		],
		/* more options... */
		});

Icons are not displayed with duration events.

## Colorizing events ##

By setting the `class` property of an event to `"col-xxx"`, the big dot or the icon 
is colored. Icon classes and color classes can be combined. 
Available are all [CSS3 named colors](http://dev.w3.org/csswg/css-color-3/#svg-color "w3.org").
They can be found in the file `src/_colors.scss`.

So this displays the event with a tomato red icon:

	var _dl = dateline('dl', {
		bands: [ /* several band definitions... */ ],
		events: [
			{id: "42", start: ..., class: "fas fa-pizza-slice col-tomato", text: "Pizza invented"},
			/* more events... */
		],
		/* more options... */
		});

If you're using [Font Awesome Duotone](https://fontawesome.com/how-to-use/on-the-web/styling/duotone-icons "Font Awesome")
you can use a `"col2-xxx"` class to set the secondary color likewise.   

## Dark mode ##

Adding the class `d-dark` to initial `<div>` lets **Dateline** appear with light colored text on
dark background colors.

## Overflow ##

If there are really many events, **Dateline** may not be able to display them all.
Whenever this occurs, is notified in the browser's console window. 

## Available colors ##

These colors are available to form the `"col-xxx"` and `"col2-xxx"` classes.
Of course, some of them will be of limited use, because they will be almost
invisible against **Dateline**'s background.

- ![](https://via.placeholder.com/15/f0f8ff/000000?text=+) aliceblue
- ![](https://via.placeholder.com/15/faebd7/000000?text=+) antiquewhite
- ![](https://via.placeholder.com/15/00ffff/000000?text=+) aqua, cyan
- ![](https://via.placeholder.com/15/7fffd4/000000?text=+) aquamarine
- ![](https://via.placeholder.com/15/f0ffff/000000?text=+) azure
- ![](https://via.placeholder.com/15/f5f5dc/000000?text=+) beige
- ![](https://via.placeholder.com/15/ffe4c4/000000?text=+) bisque
- ![](https://via.placeholder.com/15/000000/000000?text=+) black
- ![](https://via.placeholder.com/15/ffebcd/000000?text=+) blanchedalmond
- ![](https://via.placeholder.com/15/0000ff/000000?text=+) blue
- ![](https://via.placeholder.com/15/8a2be2/000000?text=+) blueviolet
- ![](https://via.placeholder.com/15/a52a2a/000000?text=+) brown
- ![](https://via.placeholder.com/15/deb887/000000?text=+) burlywood
- ![](https://via.placeholder.com/15/5f9ea0/000000?text=+) cadetblue
- ![](https://via.placeholder.com/15/7fff00/000000?text=+) chartreuse
- ![](https://via.placeholder.com/15/d2691e/000000?text=+) chocolate
- ![](https://via.placeholder.com/15/ff7f50/000000?text=+) coral
- ![](https://via.placeholder.com/15/6495ed/000000?text=+) cornflowerblue
- ![](https://via.placeholder.com/15/fff8dc/000000?text=+) cornsilk
- ![](https://via.placeholder.com/15/dc143c/000000?text=+) crimson
- ![](https://via.placeholder.com/15/00008b/000000?text=+) darkblue
- ![](https://via.placeholder.com/15/008b8b/000000?text=+) darkcyan
- ![](https://via.placeholder.com/15/b8860b/000000?text=+) darkgoldenrod
- ![](https://via.placeholder.com/15/a9a9a9/000000?text=+) darkgray, darkgrey
- ![](https://via.placeholder.com/15/006400/000000?text=+) darkgreen
- ![](https://via.placeholder.com/15/bdb76b/000000?text=+) darkkhaki
- ![](https://via.placeholder.com/15/8b008b/000000?text=+) darkmagenta
- ![](https://via.placeholder.com/15/556b2f/000000?text=+) darkolivegreen
- ![](https://via.placeholder.com/15/ff8c00/000000?text=+) darkorange
- ![](https://via.placeholder.com/15/9932cc/000000?text=+) darkorchid
- ![](https://via.placeholder.com/15/8b0000/000000?text=+) darkred
- ![](https://via.placeholder.com/15/e9967a/000000?text=+) darksalmon
- ![](https://via.placeholder.com/15/8fbc8f/000000?text=+) darkseagreen
- ![](https://via.placeholder.com/15/483d8b/000000?text=+) darkslateblue
- ![](https://via.placeholder.com/15/2f4f4f/000000?text=+) darkslategray, darkslategrey
- ![](https://via.placeholder.com/15/00ced1/000000?text=+) darkturquoise
- ![](https://via.placeholder.com/15/9400d3/000000?text=+) darkviolet
- ![](https://via.placeholder.com/15/ff1493/000000?text=+) deeppink
- ![](https://via.placeholder.com/15/00bfff/000000?text=+) deepskyblue
- ![](https://via.placeholder.com/15/696969/000000?text=+) dimgray, dimgrey
- ![](https://via.placeholder.com/15/1e90ff/000000?text=+) dodgerblue
- ![](https://via.placeholder.com/15/b22222/000000?text=+) firebrick
- ![](https://via.placeholder.com/15/fffaf0/000000?text=+) floralwhite
- ![](https://via.placeholder.com/15/228b22/000000?text=+) forestgreen
- ![](https://via.placeholder.com/15/ff00ff/000000?text=+) fuchsia, magenta
- ![](https://via.placeholder.com/15/dcdcdc/000000?text=+) gainsboro
- ![](https://via.placeholder.com/15/f8f8ff/000000?text=+) ghostwhite
- ![](https://via.placeholder.com/15/ffd700/000000?text=+) gold
- ![](https://via.placeholder.com/15/daa520/000000?text=+) goldenrod
- ![](https://via.placeholder.com/15/808080/000000?text=+) gray, grey
- ![](https://via.placeholder.com/15/008000/000000?text=+) green
- ![](https://via.placeholder.com/15/adff2f/000000?text=+) greenyellow
- ![](https://via.placeholder.com/15/f0fff0/000000?text=+) honeydew
- ![](https://via.placeholder.com/15/ff69b4/000000?text=+) hotpink
- ![](https://via.placeholder.com/15/cd5c5c/000000?text=+) indianred
- ![](https://via.placeholder.com/15/4b0082/000000?text=+) indigo
- ![](https://via.placeholder.com/15/fffff0/000000?text=+) ivory
- ![](https://via.placeholder.com/15/f0e68c/000000?text=+) khaki
- ![](https://via.placeholder.com/15/e6e6fa/000000?text=+) lavender
- ![](https://via.placeholder.com/15/fff0f5/000000?text=+) lavenderblush
- ![](https://via.placeholder.com/15/7cfc00/000000?text=+) lawngreen
- ![](https://via.placeholder.com/15/fffacd/000000?text=+) lemonchiffon
- ![](https://via.placeholder.com/15/add8e6/000000?text=+) lightblue
- ![](https://via.placeholder.com/15/f08080/000000?text=+) lightcoral
- ![](https://via.placeholder.com/15/e0ffff/000000?text=+) lightcyan
- ![](https://via.placeholder.com/15/fafad2/000000?text=+) lightgoldenrodyellow
- ![](https://via.placeholder.com/15/d3d3d3/000000?text=+) lightgray, lightgrey
- ![](https://via.placeholder.com/15/90ee90/000000?text=+) lightgreen
- ![](https://via.placeholder.com/15/ffb6c1/000000?text=+) lightpink
- ![](https://via.placeholder.com/15/ffa07a/000000?text=+) lightsalmon
- ![](https://via.placeholder.com/15/20b2aa/000000?text=+) lightseagreen
- ![](https://via.placeholder.com/15/87cefa/000000?text=+) lightskyblue
- ![](https://via.placeholder.com/15/778899/000000?text=+) lightslategray, lightslategrey
- ![](https://via.placeholder.com/15/b0c4de/000000?text=+) lightsteelblue
- ![](https://via.placeholder.com/15/ffffe0/000000?text=+) lightyellow
- ![](https://via.placeholder.com/15/00ff00/000000?text=+) lime
- ![](https://via.placeholder.com/15/32cd32/000000?text=+) limegreen
- ![](https://via.placeholder.com/15/faf0e6/000000?text=+) linen
- ![](https://via.placeholder.com/15/800000/000000?text=+) maroon
- ![](https://via.placeholder.com/15/66cdaa/000000?text=+) mediumaquamarine
- ![](https://via.placeholder.com/15/0000cd/000000?text=+) mediumblue
- ![](https://via.placeholder.com/15/ba55d3/000000?text=+) mediumorchid
- ![](https://via.placeholder.com/15/9370db/000000?text=+) mediumpurple
- ![](https://via.placeholder.com/15/3cb371/000000?text=+) mediumseagreen
- ![](https://via.placeholder.com/15/7b68ee/000000?text=+) mediumslateblue
- ![](https://via.placeholder.com/15/00fa9a/000000?text=+) mediumspringgreen
- ![](https://via.placeholder.com/15/48d1cc/000000?text=+) mediumturquoise
- ![](https://via.placeholder.com/15/c71585/000000?text=+) mediumvioletred
- ![](https://via.placeholder.com/15/191970/000000?text=+) midnightblue
- ![](https://via.placeholder.com/15/f5fffa/000000?text=+) mintcream
- ![](https://via.placeholder.com/15/ffe4e1/000000?text=+) mistyrose
- ![](https://via.placeholder.com/15/ffe4b5/000000?text=+) moccasin
- ![](https://via.placeholder.com/15/ffdead/000000?text=+) navajowhite
- ![](https://via.placeholder.com/15/000080/000000?text=+) navy
- ![](https://via.placeholder.com/15/fdf5e6/000000?text=+) oldlace
- ![](https://via.placeholder.com/15/808000/000000?text=+) olive
- ![](https://via.placeholder.com/15/6b8e23/000000?text=+) olivedrab
- ![](https://via.placeholder.com/15/ffa500/000000?text=+) orange
- ![](https://via.placeholder.com/15/ff4500/000000?text=+) orangered
- ![](https://via.placeholder.com/15/da70d6/000000?text=+) orchid
- ![](https://via.placeholder.com/15/eee8aa/000000?text=+) palegoldenrod
- ![](https://via.placeholder.com/15/98fb98/000000?text=+) palegreen
- ![](https://via.placeholder.com/15/afeeee/000000?text=+) paleturquoise
- ![](https://via.placeholder.com/15/db7093/000000?text=+) palevioletred
- ![](https://via.placeholder.com/15/ffefd5/000000?text=+) papayawhip
- ![](https://via.placeholder.com/15/ffdab9/000000?text=+) peachpuff
- ![](https://via.placeholder.com/15/cd853f/000000?text=+) peru
- ![](https://via.placeholder.com/15/ffc0cb/000000?text=+) pink
- ![](https://via.placeholder.com/15/dda0dd/000000?text=+) plum
- ![](https://via.placeholder.com/15/b0e0e6/000000?text=+) powderblue
- ![](https://via.placeholder.com/15/800080/000000?text=+) purple
- ![](https://via.placeholder.com/15/ff0000/000000?text=+) red
- ![](https://via.placeholder.com/15/bc8f8f/000000?text=+) rosybrown
- ![](https://via.placeholder.com/15/4169e1/000000?text=+) royalblue
- ![](https://via.placeholder.com/15/8b4513/000000?text=+) saddlebrown
- ![](https://via.placeholder.com/15/fa8072/000000?text=+) salmon
- ![](https://via.placeholder.com/15/f4a460/000000?text=+) sandybrown
- ![](https://via.placeholder.com/15/2e8b57/000000?text=+) seagreen
- ![](https://via.placeholder.com/15/fff5ee/000000?text=+) seashell
- ![](https://via.placeholder.com/15/a0522d/000000?text=+) sienna
- ![](https://via.placeholder.com/15/c0c0c0/000000?text=+) silver
- ![](https://via.placeholder.com/15/87ceeb/000000?text=+) skyblue
- ![](https://via.placeholder.com/15/6a5acd/000000?text=+) slateblue
- ![](https://via.placeholder.com/15/708090/000000?text=+) slategray, slategrey
- ![](https://via.placeholder.com/15/fffafa/000000?text=+) snow
- ![](https://via.placeholder.com/15/00ff7f/000000?text=+) springgreen
- ![](https://via.placeholder.com/15/4682b4/000000?text=+) steelblue
- ![](https://via.placeholder.com/15/d2b48c/000000?text=+) tan
- ![](https://via.placeholder.com/15/008080/000000?text=+) teal
- ![](https://via.placeholder.com/15/d8bfd8/000000?text=+) thistle
- ![](https://via.placeholder.com/15/ff6347/000000?text=+) tomato
- ![](https://via.placeholder.com/15/40e0d0/000000?text=+) turquoise
- ![](https://via.placeholder.com/15/ee82ee/000000?text=+) violet
- ![](https://via.placeholder.com/15/f5deb3/000000?text=+) wheat
- ![](https://via.placeholder.com/15/ffffff/000000?text=+) white
- ![](https://via.placeholder.com/15/f5f5f5/000000?text=+) whitesmoke
- ![](https://via.placeholder.com/15/ffff00/000000?text=+) yellow
- ![](https://via.placeholder.com/15/9acd32/000000?text=+) yellowgreen
