/*
* 	Easy Slider 1.8.2 - jQuery plugin
*	Originally written by Alen Grakalic	
*	http://cssglobe.com/post/4004/easy-slider-15-the-easiest-jquery-plugin-for-sliding
*
*	Copyright (c) 2009 Alen Grakalic (http://cssglobe.com)
*	Copyright (c) 2011 Solutions Nitriques (http://www.nitriques.com/open-source/)
*	Dual licensed under the MIT (MIT-LICENSE.txt)
*	and GPL (GPL-LICENSE.txt) licenses.
*
*	Built for jQuery library
*	http://jquery.com
*
*   Modified by Solutions Nitriques from
*   http://cssglobe.com/post/5780/easy-slider-17-numeric-navigation-jquery-slider
*   - added the autoSizeContainer property
*   - added the possibility to specify a function as the items number
*   - added a return value for the beforeChange callback that can cancel the event
*   - added a speedConstant option
*   - added an offset
*   - added a start option
*   - added a margin between items
*   - added beforeChange and afterChange listener options
*   - added li as the only valid node
*   - added a safeDivide function, to prevent divide by 0
*   - added a queue parameter
*   - added a afterInit and beforeInit listener
*   - added a nextPrevShow properties
*   - added support for numeric and next-prev at the same time
*   - added support for easing equations
*   - added a condition before starting the timeout : more than 1 elem
*   - added public commands for start and stop functions
*   - refactoring how the timer works
*   - added an array for storing data related to each instance
*/

/*
*	markup example for $("#slider").easySlider();
*	
* 	<div id="slider">
*		<ul>
*			<li><img src="images/01.jpg" alt="" /></li>
*			<li><img src="images/02.jpg" alt="" /></li>
*			<li><img src="images/03.jpg" alt="" /></li>
*			<li><img src="images/04.jpg" alt="" /></li>
*			<li><img src="images/05.jpg" alt="" /></li>
*		</ul>
*	</div>
*
*/

(function ($) {

	// unique id generator
	var __id = new Date().getTime(), 
		// key
		__ES_KEY = 'easySlider',
		// instances
		inst = [];
	
	// make defaults public
    $.easySlider = {
    	defaults: {
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
	     speedConstant: false, // if true, will always scroll for the same duration
	     						// no matters how many slides go by
	     auto: false,
	     pause: 2000,
	     continuous: false,
	     numeric: false,
	     numericId: 'controls',
	     offsetWidth: 0, // added a offset
	     offsetHeight: 0,
	     autoSizeContainer: true,
	     start: 0, // start page
	     items: 1, // number of items visible
	     itemsMargin: 0, // margin between elements
	     beforeChange: null, // listener
	     afterChange: null, // listener
	     afterInit: null, // listener
	     nextPrevShow: true,
	     queue: false,
	     easing: $.easing.def // use the default easing
	 	}
    };
	
	
	// plugin function
    $.fn.easySlider = function (options) {
        
        if (typeof options == 'string') {
        	
        } else {
        	// copy and merge options into default 
        	options = $.extend({}, $.easySlider.defaults, options);
        }

        function safeDivide(n, d) {
            if (n && d) {
                return n / d;
            }
            return 0;
        };
		
		function isNaN(v) {
			if ($.isFunction($.isNaN)) {
				return $.isNaN(v);
			} else if ($.isFunction($.isNumeric)) {
				return $.isNumeric(v);
			}
			return window.isNaN(v);
		};
        
        function getWidth(obj, margin) {
        	return $(">ul>li", obj).width() + 2 * margin;
        };
        
        function getNumberOfItems(options) {
        	if ($.isFunction(options.items)) {
        		return options.items();
        	}
        	return options.items;
        };
        
        function getLastSlideIndex(totalCount, options) {
        	return options.continuous ? totalCount - 1 : totalCount - getNumberOfItems(options);
        };
     
        if (!this.length) {
        	return this;
        }
        
        return this.each(function () {
            var obj = $(this),
                s = $(">ul>li", obj).length, // nb of items
                w = getWidth(obj, options.itemsMargin), // total width with margins
                wo = options.offsetWidth, // quick ref to offset
                ho = options.offsetHeight,
                h = obj.height(), // total height
                i = getNumberOfItems(options) < 1 ? 1 : getNumberOfItems(options), // assure a positive number of items (0 is not positive)
                clickable = false,
                //ts = options.continuous ? s-1 : s - i, // last slide index position
                t = 0, // curent position
                id = obj.data(__ES_KEY);
            
            // plugin already registered so it must be a command
            if (id) {
            	
            	// save command
            	var cmd = options;
            	
            	// overrides options
    			options = inst[id].options;
    			
    			// overrides current position
    			t = inst[id].t;
    			s = inst[id].s;
    			//ts = inst[id].ts;
    			
    			// overrides width
    			w = getWidth(obj, options.itemsMargin);
            	
            	switch (cmd) {
		    		case 'start':
		    			_start();
		    			break;
		    		case 'stop' :
		    			_stop();
		    			break;
					case 'next' :
						animate('next',false);
						break;
					case 'prev' :
						animate('prev',false);
						break;
		    		default:
		    			
		    			if (!isNaN(cmd)) {
		    				// set current scope if different 
							var newScope = parseInt(cmd, 10);
							if(t!= newScope) {
								t = newScope;
								animate(t, false);
							}
			    			break;
		    			}
		    			
		    			if (console) {
		    				console.log(__ES_KEY + ': command unknow');
		    			}
		    			break;
		    	}
            	
            	return;
            }
            
            id = (__id++).toString();
            
            // save reference
            obj.data(__ES_KEY, id);
            
            // register inst slot
            inst[id] = {
        		timer: __id,
        		options: options,
        		t:t,
        		s:s
        		//ts:ts
            };

            if (options.autoSizeContainer) {
	            if (options.vertical) {
	                obj.width(w + wo);
	            } else {
	                obj.width((w * i) + wo);
	            }
	            if (options.vertical) {
	                obj.height((h * i) + ho); 
	            } else {
	                obj.height(h + ho);
	            }
            }
            // assure no overflow
            obj.css("overflow", "hidden");
            
            // assure width and margins
            $(">ul", obj).width(options.vertical ? w + wo : (s * w) + wo)
            			.height(options.vertical ? (s * h) + ho : h + ho);
            $(">ul", obj).css('margin-left', safeDivide(wo, 2)); // center it
            
            // assure width + height of elements
            $(">ul>li", obj).width(w).height(h);

            if (options.continuous) {
                $(">ul", obj).prepend($(">ul>li:last-child", obj).clone().css("margin-left", "-" + w + "px"));
                
                // @todo should add comment here
                for (c=0; c < i; c+=1) {
					var selector = ">ul>li:nth-child(" + (c+2) + ")";
					$(">ul", obj).append($(selector, obj).clone());
				}
                $(">ul", obj).css('width', (s + i) * w);
            };

            if (!options.vertical) {
            	$(">ul>li", obj).css('float', 'left');
            }

            if (options.controlsShow) {
                var html = options.controlsBefore;

                if (options.numeric) {
                    html += '<ol id="' + options.numericId + '"></ol>';
                }
                if (options.nextPrevShow) {
                    if (options.firstShow) html += '<span id="' + options.firstId + '"><a href=\"javascript:void(0);\">' + options.firstText + '</a></span>';
                    html += ' <span id="' + options.prevId + '"><a href=\"javascript:void(0);\">' + options.prevText + '</a></span>';
                    html += ' <span id="' + options.nextId + '"><a href=\"javascript:void(0);\">' + options.nextText + '</a></span>';
                    if (options.lastShow) html += ' <span id="' + options.lastId + '"><a href=\"javascript:void(0);\">' + options.lastText + '</a></span>';
                };

                html += options.controlsAfter;
                $(obj).after(html);

                if (options.numeric) {
                    for (var i = 0; i < s; i++) {
                        $(document.createElement("li"))
						    .attr('id', options.numericId + (i + 1))
						    .html('<a rel=' + i + ' href=\"javascript:void(0);\">' + (i + 1) + '</a>')
						    .appendTo($("#" + options.numericId))
						    .click(function () {
						        animate(parseInt($('a', this).attr('rel')), true);
						    });
                    };
                }
                if (options.nextPrevShow) {
                    $("#" + options.nextId).click(function () {
                        animate("next", true);
                    });
                    $("#" + options.prevId).click(function () {
                        animate("prev", true);
                    });
                }
                if (options.lastShow) {
                    $("#" + options.firstId).click(function () {
                        animate("first", true);
                    });
                }
                if (options.firstShow) {
                    $("#" + options.lastId).click(function () {
                        animate("last", true);
                    });
                };
            };

            function setCurrent(i) {
                i = parseInt(i) + 1;
                $("#" + options.numericId).removeClass("current");
                $("#" + options.numericId + i).addClass("current");
            };

            function adjust() {
            	// maybe not the same context
            	t = inst[id] ? inst[id].t : t;
                s = inst[id] ? inst[id].s : s;
                ts = getLastSlideIndex(s, options); //inst[id] ? inst[id].ts : ts;
            	
                if (t > ts) t = 0;
                if (t < 0) t = ts;
                
                // save new position
                inst[id].t = t;
                
                if (!options.vertical) {
                    $(">ul", obj).css("margin-left", (t * w * -1) + safeDivide(wo, 2));
                } else {
                    $(">ul", obj).css("margin-left", (t * h * -1));
                }
                
                if (!options.continuous && options.controlsFade) {
                    if (t == ts) {
                        $("#" + options.nextId).hide();
                        $("#" + options.lastId).hide();
                    } else {
                        $("#" + options.nextId).show();
                        $("#" + options.lastId).show();
                    };
                    if (t == 0) {
                        $("#" + options.prevId).hide();
                        $("#" + options.firstId).hide();
                    } else {
                        $("#" + options.prevId).show();
                        $("#" + options.firstId).show();
                    };
                };
                
                if (options.numeric) {
                	setCurrent(t);
                }

                clickable = true;
            };

            function animate(dir, clicked) {
                if (clickable || !clicked) {
                    //prevent double click
                    clickable = false;
                    
                    // get current pos -- do not assume we are in the same context
                    t = inst[id] ? inst[id].t : t;
                    s = inst[id] ? inst[id].s : s;
                    options = inst[id] ? inst[id].options : options;
                    ts = getLastSlideIndex(s, options); //inst[id] ? inst[id].ts : ts;

                    // save old position
                    var ot = t;
                    
                    // where are we going ?
                    switch (dir) {
                        case "next":
                            t = (ot >= ts) ? (options.continuous ? t + 1 : ts) : t + 1;
                            break;
                        case "prev":
                            t = (t <= 0) ? (options.continuous ? t - 1 : 0) : t - 1;
                            break;
                        case "first":
                            t = 0;
                            break;
                        case "last":
                            t = ts;
                            break;
                        default:
                            t = dir;
                            break;
                    };
					
					var continueAction = true;
                    // raise before change listner
                    if ($.isFunction(options.beforeChange)) {
                        continueAction = options.beforeChange(t, ot, s, obj);
                    }
					if(continueAction) {
						// save new position
						inst[id].t = t;
						
						// added for disabling select event before abimation
						$(">li", "#" + options.numericId).removeClass("current");

						// animation
						var diff = Math.abs(ot - t),
							speed = options.speedConstant ? options.speed : diff * options.speed,
							animProps = null;
							
						if (!options.vertical) {
							p = (t * w * -1);
							animProps = { marginLeft: p + safeDivide(wo, 2) };
						} else {
							p = (t * h * -1);
							animProps = { marginTop: p };
						}
						
						$(">ul", obj).stop( true, true ) // stopping here takes care of letting the requestAnimationFrame do it's job
							.animate(
								animProps,
								{ queue: options.queue, duration: speed, complete: adjust, easing: options.easing }
							);

						if (clicked) { 
							// stop on click
							_stop();
							
						} else if (options.auto && dir == "next" && inst[id].timer) {
							// if we are in auto mode, direction is next
							// and the timeout if still alive (have not been stopped)
							
							// start a new timer with a delay 
							_start(diff * options.speed);
						};

						// raise after change listner
						if ($.isFunction(options.afterChange)) {
							options.afterChange(t, ot, s, obj);
						}
					}

                };  // if clickable

            }; // end animate

            
            function _start(delay) {
            	if (isNaN(delay)) {
            		delay = 0;
            	}
            	
            	_stop();
            	
            	if (options.auto && s > 1) {
            		inst[id].timer = setTimeout(function () {
                    	animate("next", false);
                    }, options.pause + delay);
                };
            };
            
            function _stop() {
            	clearTimeout(inst[id].timer);
            	inst[id].timer = null;
            };

            // Global code
            // init
            if (options.numeric) {
            	setCurrent(t);
            }

            if (!options.continuous && options.controlsFade) {
                $("#" + options.prevId).hide();
                $("#" + options.firstId).hide();
            };

            // raise after init listner
            if ($.isFunction(options.afterInit)) {
                options.afterInit(s, obj);
            }

            if (options.start) { // if we have a start index, go to it
                animate(options.start, false);
                // animate call setCurent after the animation has completed
                
                // start timer if we have to
                _start();
                
            } else {
                // raise before change listner
                if ($.isFunction(options.beforeChange)) {
                    options.beforeChange(0, 0, s, obj);
                }
                
                // start timer if we have to
                _start();
                
                // raise after change listner
                if ($.isFunction(options.afterChange)) {
                    options.afterChange(0, 0, s, obj);
                }
            }

            // enanble click after init
            clickable = true;

        }); // end this.each

    }; // end plugin
  
})(jQuery);