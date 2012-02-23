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
var igneous = require('igneous');

igneous.set( 'aws_key', 'TEST' );
igneous.set( 'aws_secret', 'TEST' );
igneous.set( 's3_bucket', 'TEST' );

igneous.createFlows({
	'stylesheets.css': {
		type: 'css',
		paths: [
			'styles/layout.css',
			'styles/red.css'
		],
		compress: true
	},
	'scripts.js': {
		type: 'js',
		paths: [
			'scripts'
		],
		compress: true
	}
});
```

When igneous.createFlows runs, it concatenates the files in each flow and sends them off to S3, returning their new URL with a timestamp parameter. This URL can be accessed in the following ways:

```javascript
igneous['stylesheets.css'];
igneous.flows['stylesheets.css'].url;
```

From there it's a simple task to pass these URLs into markup or a template object.