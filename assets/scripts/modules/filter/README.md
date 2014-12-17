# Filter


## API

#### Filter::init(options)

- `options`: currnetly only support `getValue`
  - `root`: Normally `.filter` elements
  - `getValue`: How do you want filter to return the selected value, as a default it will try get the `data-value`.

```javascript
  // Default getValue
  function(selected){ return selected.data('value'); }
```

#### Filter::on(eventName, handler)

- `eventName`:
  - `change`: When filter changed
  - `open`: When filter opens
  - `close`: When filter closes

- `handler`: handler that will be fired when event is emitted, it will receive `selectedValue` and `selectedElement` as parameters.

#### Filter::off(eventName, [handler])
It will remove handlers from `eventName`, if you supplied `handler` it will remove specific handler.
If no `eventName` is supplied it will remove all the handlers from `change`, `open`, `close`


#### Filter.eradicate()
It will remove all the handlers including the click event intenally used in this class.


## Usage

```javascript
var Filter = require('/module/filter/filter'),
    filterView = new Filter(),
    filterElement = $('.filter'),
    getValue = function(selected){ return selected.text(); }; // If you want to get the text of the selected item


filterView.init({ root: filterElement, getValue: getValue })
  .on('change', function(type, selectedElement){
    console.log(type +" is selected");
    console.log("And selected DOM Element is ", selectedElement);
  });

filterView.off('change'); // remove all the change handlers

// Optionally you can bind to `open` `close` event as well.

filterView.on('open', _doSomethingWhenFilterOpens);
filterView.on('close', _doSomethingWhenFilterCloses);

// Unbinds all the events
filterView.eradicate();
```

