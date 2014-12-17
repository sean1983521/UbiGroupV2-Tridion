# Spinner

Simple spinner class module.

Check out the demo at http://local-www.ubisoft.com.dc.akqa.com/assets/scripts/modules/spinner/

## API

#### `init()`

Initialize `Spinner` class, and returns `canvas` element.


#### `start()`

Starts animation


#### `stop()`

Stop animation

#### `dotColor(color or [colors])`

Change the color of dot, if you pass three colors, it will be assined to each dots


#### `getCanvas()`

Returns `canvas` elements


## Usage

```javascript
var spinner = new Spinner(),
    spinnerElement = spinner.init(); // `.init` returns the canvas.

spinner.dotColor('#cccccc'); // Change dot to `#cccccc`
spinner.dotColor(['#ccc', '#bbb', '#ccc']); // Change dot to `#aaa`, `#bbb`, `#ccc`

container.appendChild(spinnerElement);

// Start spinner
spinner.start();

// When page loaded.
setTimeout(function(){
  spinner.stop();
}, 100);
```


### Note

The `tween.js` is being build from `component.js` module. by running

```
  $ component build --standalone Tween
  $ mv build/build.js /path/to/this-repo/workspace/scripts/modules/spinner/tween.js
```

Refer to the usage on [github](http://github.com/component/tween)
