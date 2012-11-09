anvil.buildr
============
anvil.buildr aims to remove the complexities of dealing with concating and minifying script tags. The idea behind the plugin is to take an html file such as...

```html
<!DOCTYPE html>
<html>
<head>
	<script data-build="vendor" src="js/vendor/jquery.js"></script>
	<script data-build="vendor" src="js/vendor/modernizr.js"></script>
	<script data-build="vendor" src="js/vendor/underscore.js"></script>
	
	<script data-build="app" src="js/app.js"></script>
	<script data-build="app" src="js/views/home.js"></script>
	<script data-build="app" src="js/routers/index.js"></script>
</head>
<body>
</body>
</html>
```

It will read all the script tags, pull all of the references out grouped by the `data-build` attribute. Then it will concat all of the files specified in the `data-build`, and run any kind of minification plugins on them. Next, it will output a js file with a default location of `js/vendor.build.js` or `js/app.build.js`. And finally, the index.html will be modified to look like...

```html
<!DOCTYPE html>
<html>
<head>
	<script src="js/vendor.build.js"></script>
	<script src="js/app.build.js"></script>
</head>
<body>
</body>
</html>
```

###COMING SOON
Some features in the works are the ability to customize the build.json file as such...

```js
{
	"anvil.buildr": {
		"vendor": {
			"minify": true,
			"output": "js/build/vendor.js"
		},
		"app": {
			"minify": false,
			"output": "js/build/app.js"
		}
	}
}
