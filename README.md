kml-subtitles
===============
Simple module which parses subtitle files to a javascript object

### Installation:

NodeJS:

    npm install kml-subtitles

### Example

Let's say we have my.srt SubRip subtitles file:

    1
    00:00:02,000 --> 00:00:06,000
    Subtitle 1.1
    Subtitle 1.2

    2
    00:00:28,967 --> 00:01:30,958
    Subtitle 2.1
    Subtitle 2.2


1. Initialize and configure the parser

```js
var parser = require('kml-subtitles');

var parsedSubtitles = parser({
	path : "./", //--> folder path where the subtitle files exits
    ext : ['.srt', '.vtt'], //--> subtitles extensions
    dest : "./subtitles.js", //--> default destination for exporting the parsed data
    name : "subtitles", //--> default name of the object which contains the parsed data (used for exporting to file)
});

var data = parsedSubtitles.data();
```

data object will look like:

    {
	    my : [{
	        start: 2,
	        end: 6,
	        text: 'Subtitle 1.1<br>Subtitle 1.2'
	    },
	    {
	        start: 28.967,
	        end: 90.958,
	        text: 'Subtitle 2.1<br>Subtitle 2.2'
	    }]
	}


2. Export the parsed data to a js file


```js

parsedSubtitles.writeTo('export.js');
```

the export.js content will look like :

	var subtitles = {
	    my : [{
	        start: 2,
	        end: 6,
	        text: 'Subtitle 1.1<br>Subtitle 1.2'
	    },
	    {
	        start: 28.967,
	        end: 90.958,
	        text: 'Subtitle 2.1<br>Subtitle 2.2'
	    }]
	}