# mediagroup.js

Adds declarative support for `mediagroup` attributes on HTML5 Media Elements (video/audio)

Create a Picture-In-Picture where the inner video is synced with the outer video

```html
<video class="controller" controls mediagroup="pip">
	<source src="assets/popcorntest.mp4"></source>
	<source src="assets/popcorntest.ogv"></source>
	<source src="assets/popcorntest.webm"></source>
</video>
<video mediagroup="pip">
	<source src="assets/popcorntest.mp4"></source>
	<source src="assets/popcorntest.ogv"></source>
	<source src="assets/popcorntest.webm"></source>
</video>
```

Jakefile

	jake

		(lone command will run all)

		minify  - UglifyJS on all application code
		hint    - JSHint on all application code
		clean   - delete generated files