Igneous
================================

Easily concatenate and minify assets, then send them to Amazon S3. 

Installation
-------------------------

To install Igneous, just use npm:

```
npm install igneous
```

Usage
-------------------------

To use Igneous, you first require the module and set your AWS configuration. After that you supply a list of file flows you want to concatenate and send off to S3, using the final filename of each flow as the key:

```javascript
var igneous = require('../lib/igneous.js');

igneous.config({
	compress: true
	host: {
		provider: 's3',
		aws_key: '',
		aws_secret: '',
		bucket: ''
	}
});

igneous.createFlows([
	{
		name: 'stylesheets.css',
		type: 'css',
		base_path: __dirname +'/assets/styles/',
		paths: [
			'/'
		]
	},
	{
		name: 'scripts.js',
		type: 'js',
		base_path: __dirname +'/assets/scripts/',
		paths: [
			'/'
		]
	},
	{
		name: 'templates.js',
		type: 'jst',
		base_path: __dirname +'/assets/templates/',
		paths: [
			'test1.jst',
			'test2.jst',
			'_partial.jst'
		],
		jst_lang: 'handlebars',
		jst_namespace: 'templates'
	}
]);
```

When igneous.createFlows runs, it concatenates the files in each flow and sends them off to S3, returning their new URL with a timestamp parameter. You can generate the appropriate HTML tags like so:

```javascript
// one method
igneous.flows['stylesheets.css'].tag();

// another sweet method
igneous.tag('stylesheets.css');
```

The URL can also be directly accessed:

```javascript
igneous.flows['stylesheets.css'].url;
```

From there it's a simple task to pass these tags/URLs into markup or a template object.