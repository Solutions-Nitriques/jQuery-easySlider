# jQuery easySlider #

Version: 1.8

## Easily add a slider (carousel) to your web page ##

* 	Easy Slider 1.8 - jQuery plugin
*	Originally written by Alen Grakalic	
*	http://cssglobe.com/post/5780/easy-slider-17-numeric-navigation-jquery-slider
*	Adapted by Solutions Nitriques

## Exemple ##

### Markup example for $("#slider").easySlider(); ###
	
 	<div id="slider">
		<ul>
			<li><img src="images/01.jpg" alt="" /></li>
			<li><img src="images/02.jpg" alt="" /></li>
			<li><img src="images/03.jpg" alt="" /></li>
			<li><img src="images/04.jpg" alt="" /></li>
			<li><img src="images/05.jpg" alt="" /></li>
		</ul>
	</div>
	
### Default settings ###

	prevId: 'prevBtn',
	prevText: 'Previous',
	nextId: 'nextBtn',
	nextText: 'Next',
	controlsShow: true,
	controlsBefore: '',
	controlsAfter: '',
	controlsFade: true,
	firstId: 'firstBtn',
	firstText: 'First',
	firstShow: false,
	lastId: 'lastBtn',
	lastText: 'Last',
	lastShow: false,
	vertical: false,
	speed: 800,
	auto: false,
	pause: 2000,
	continuous: false,
	numeric: false,
	numericId: 'controls',
	offsetWidth: 0, // added a offset,
	offsetHeight: 0,
	start: 0, // start page
	items: 1, // number of items visible
	itemsMargin: 0, // margin between elements
	beforeChange: null, // listener
	afterChange: null, // listener
	afterInit: null, // listener
	nextPrevShow: true,
	queue: false,
	easing: 'linear'


*Voila !*

http://www.nitriques.com/open-source/