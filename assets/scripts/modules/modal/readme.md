Usage is pretty simple.
Add `.modal` class to `a` element, and it will parse the url to make a request to fetch the content: (`ajax`, `inline`, `image`, `iframe`); *Currently also supporting legacy `.mfp-` classes as well*

Test this at http://local-www.ubisoft.com.dc.akqa.com/assets/scripts/modules/modal/

Only `init` is exposed, and shouldn't be created more than one instance.

---------------------


### Example

```html
<a href="http://www.youtube.com/watch?v=something" class='modal'>Modal To video</a>
```
This will trigger modal when clicked, with the following format.

```html
  <div class="modal-overlay modal-type-iframe">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-iframe-scaler">
          <button title="Close (Esc)" type="button" class="close">&times;</button>
          <iframe src="//player.vimeo.com/video/123123?autoplay=0" style="visibility: visible;"></iframe>
        </div>
      </div>
    </div>
  </div>
```

Where `modal-type-iframe` is the format of `modal-type-{ iframe | inline | ajax | image }`

