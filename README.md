![Igneous](https://s3.amazonaws.com/igneous-site/igneous.png "Igneous") 0.1.6

Simple asset compilation middleware for Connect and Express.

Igneous helps keep asset management easy by merging groups of assets down to single files. These files can be pre/post-processed in a variety of ways, including minification, coffeescript, SASS/LESS, and client-side javascript template compilation. Igneous can also watch files and directories (including subdirectories) for changes and automatically regenerate bundles on the fly.

**Note: This module are still in flux.** If you plan on using this right now it might be wise to include the exact version number, as some parts of the API might change.

## Installation

To install Igneous, just use npm:

```
npm install igneous
```

## Usage

Igneous is Connect middleware, meaning it must be used via [Connect](https://github.com/senchalabs/connect) or something that extends it, like [Express](http://expressjs.com/).

Igneous uses a simple configuration method to define groups of assets—called "flows"—along with some pre/post-processing options:

```javascript
var igneous = require('igneous');

var igneous_middleware = igneous({
	root: __dirname +'/assets/',
	minify: true,
	flows: [
		{
			route: 'scripts/application.js',
			type: 'js',
			paths: [
				'toolbar.js',
				'home.js',
				'app.coffee'
			]
		}
	]
})
```

After the middleware is configured, it just needs to be used:

```javascript
var express = require('express');
express.use( igneous_middleware );
```

Client-side javascript templates can also be compiled by Igneous. Right now it's limited to just Mustache, Handlebars and jQuery templates, but as time goes on more template packages will be added. An example of a Handlebars configuration:

```javascript
igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		route: 'templates.js',
		type: 'jst',
		base: '/templates/',
		paths: [
			'test1.jst',
			'test2.jst',
			'_partial.jst'
		],
		jst_lang: 'handlebars',
		jst_namespace: 'templates'
	]
})
```

These templates will be made available on the `jst_namespace`, with each template being associated with the string used for its path. For example, to access the template 'test1.jst' from above:

```javascript
templates['test1']({ test: 'My radical template data' });
```

For more usage details, take a look at the [examples](https://github.com/Fauntleroy/Igneous/tree/master/examples) directory!

## Parameters

Igneous can be configured to run in a variety of ways. Some options, such as `root`, are set globally, while other options, such as `route` are set per flow. Other options, like `minify`, may be set globally and overriden on a *per-flow* basis.

### Global Parameters

- **root** - *(string)* - The root directory to check for assets.
- **minify** *(boolean)* - Minify the assets after compilation. Defaults to `false`.
- **watch** *(boolean)* - Watch the flow paths for changes. Defaults to `true`.
- **encoding** *(string)* - The file encoding to be used for each flow. Defaults to `UTF-8`
- **flows** *(array)* - An array of flow configuration objects.

### Flow Parameters

- **route** *(regex/string)* - The route to use for this generated file.
- **type** *(string - "js", "css", "jst")* - The type of files included in this flow.
- **extensions** *(array - ['js','coffee','cs'])* - An array of strings that represent file extensions to look for. Extensions appropriate for the type are automatically added ( ex: `['css', 'less', 'sass', 'scss']` for a type of `css` )
- **minify** *(boolean)* - Minify the assets after compilation. Overrides the global `minify` parameter.
- **watch** *(boolean)* - Watch the flow paths for changes. Overrides the global `watch` parameter.
- **encoding** *(string)* - The file encoding to be used for this flow. Overrides the global `encoding` parameter.
- **jst_lang** *(string - "mustache", "handlebars", "jquery-tmpl")* - The language to use if this is a javascript template flow.
- **jst_namespace** *(string)* - The variable name to make the compiled templates available on. Defaults to `JST`
- **paths** *(array)* - An array of strings representing the paths to include in this flow. These paths can be files or folders. If a folder is specified, Igneous will walk through the folder and include every file found within, including subfolders.

## Tests

You can run Igenous' tests with the command `npm test`. These tests require [Mocha](https://github.com/visionmedia/mocha) to run.

## Future Plans

In no specific order:

- Automatic Amazon S3 deployment
- Custom pre/post-processors
- Custom store strategies
- Additional test coverage
- Additional JST options

## License

MIT License.

----------

Copyright © 2012 Timothy Kempf

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.