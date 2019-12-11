# titanium-scrollable-views
A cross platform Alloy - Titanium scrollable widget with background color transition effect and animated paging controls.

![Alt Text](https://github.com/prashantsaini1/titanium-scrollable-views/blob/master/Dec-04-2016%2021-36-53.gif)

This widget provides you a customizable scrollable view container with background color transition effect (optional) and nice paging controls for iOS & Android.

## Installation

Add in your *config.json*, under `dependencies`:

```
"dependencies": {
    "in.prashant.scrollableViews" : "*"
}
```

## Usage Titanium Classic
```javascript
var widget = Alloy.createWidget('in.prashant.scrollableViews', {
	width: Ti.UI.FILL,
	top: 50,
	bottom: 50,
	pagingPosition : 'top',
	pagingColor : 'white',
	pagingEffect : true,
	backdropEffect : true,
	backdropColors : ['teal', 'silver', 'cyan', 'pink'],
	views : [Ti.UI.createView(), Ti.UI.createView(), Ti.UI.createView(), Ti.UI.createView()]
});
```

## Usage Alloy
*index.xml*
```xml
<Window>
  <Widget id="scrollWidget" src="in.prashant.scrollableViews">
    <View> <Button>All Good 0</Button> </View>
    <View> <Button>All Good 1</Button> </View>
    <View> <Button>All Good 2</Button> </View>
    <View> <Button>All Good 3</Button> </View>
  </Widget>
</Window>
```

*index.tss*
```tss
"#scrollWidget": {	
	width: Ti.UI.FILL,
	top: 50,
	bottom: 50,
	pagingPosition : 'top',
	pagingColor : 'white',
	pagingEffect : true,
	backdropEffect : true,
	backdropColors : ['teal', 'silver', 'cyan', 'pink']
}

"Button" : {
	color : 'white'
}
```

<b>Arguments</b>
* **backdropEffect**  : set the background transition effect (true/false) - defaults to false - do not set background colors of Ti.UI.View to take effect of __backdropEffect__ property
* **backdropColors**  : array of colors to use with backdropEffect - defaults to transparent
* **pagingEffect**    : shows the paging control (true/false) - defaults to true
* **pagerStyle**      : pager style - pass 1 for ring type pagers or pass 2 for solid colored pagers, if value is 2 then optionally pass **pagingBackColor** for unselected pagers
* **pagingPosition**  : position of paging control - pass string "top" or "bottom"
* **pagingPadding**   : padding between pagers in paging control - defaults to 7dp
* **pagingColor**     : color of paging control - defaults to white
* **pagingBackColor** : sets the color of unselected pagers if pagerStyle is 2, otherwise not effective
* **clip**            : iOS only - clip views to show them adjacently - defaults to false
* **clipPadding**     : padding of views when clip is true
* **index**           : index of the current page to set in widget

<b>Methods</b>
* **add**: Add view(s) at once with below arguments
  * *argument 1* : pass single view (Ti.UI.View) or an array of views to add.
  * *argument 2* :  color or an array of colors for **backdropEffect**. _(optional)_
  * *argument 3* : boolean to scroll to last view/page added. _(optional)_
* **remove**: Remove view by passing either View or index of the view - *iOS + Android* ( :stuck_out_tongue_winking_eye: but Ti SDK allows to remove the view by index on iOS only)
  * *argument 1* : Ti.UI.View object or index of the view to remove.

<b>Exposer Properties</b>
* **scrollableView**: instance of the Ti.UI.ScrollableView used in this widget.
  

## Contributions

If you enjoy this module, feel free to contribute with your PR or [donate](https://paypal.me/prashantsainii) :-)
