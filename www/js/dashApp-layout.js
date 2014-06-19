
/**
 * application namespace/functionality singleton
 * @type object
 */
var dashApp = {
	
	MOMENT_TIMESTAMP_FORMAT : 'YYYY-MM-DD HH:mm:ss',
	
	/**
	 * 
	 * @type type
	 */
	storage : {
		init : function(){
			this.vars = {};
		},
		isset : function(varName){
			return typeof this.vars[varName] !== 'undefined';
		},
		get : function(varName){
			return this.vars[varName];
		},
		set : function(varName, varValue){
			this.vars[varName] = varValue;
		},
		unset : function(varName){
			delete this.vars[varName];
		}
	},
	/**
	 * sidebar namespace
	 * @type object
	 */
	sidebar: {
		SIDEBAR_HIDDEN: 0,
		SIDEBAR_SHOWING: 1,
		SIDEBAR_SHOWN: 2,
		MAX_WIDTH: 300,
		_sidebarStatus: null,
		_previousDistance: 0,
		/**
		 * sets/gets the sidebar status
		 * @param {integer} new_val if this parameter is not set just get the value
		 * @returns {integer}
		 */
		status: function(new_val) {
			if (typeof new_val !== "undefined") {
				this._sidebarStatus = new_val;
			}
			return this._sidebarStatus;
		},
		/**
		 * increase the width of the sidebar
		 * @param {type} distance
		 * @returns {undefined}
		 */
		increaseWidth: function(distance) {
			this.$leftMenu.stop(true, false);
			if (this._sidebarStatus === this.SIDEBAR_SHOWN) {
				return;
			}
			var new_width = this.$leftMenu.width() + (distance - this._previousDistance);
			this._previousDistance = distance;
			if (new_width < this.MAX_WIDTH) {
				this.$leftMenu.width(new_width);
				this.$leftMenuBtn.css({left : new_width});
				this._sidebarStatus = this.SIDEBAR_SHOWING;
			} else {
				this.$leftMenu.width(this.MAX_WIDTH);
				this.$leftMenuBtn.css({left : this.MAX_WIDTH});
				this._sidebarStatus = this.SIDEBAR_SHOWN;
				this._previousDistance = 0;
				this.menuBtnOn();
				this.menuBtnToggleOn();
			}
		},
		/**
		 * increase the width of the sidebar
		 * @param {type} distance
		 * @returns {undefined}
		 */
		decreaseWidth: function(distance) {
			this.$leftMenu.stop(true, false);
			if (this._sidebarStatus === this.SIDEBAR_HIDDEN) {
				return;
			}
			var new_width = this.$leftMenu.width() - (distance - this._previousDistance);
			this._previousDistance = distance;
			if (new_width > 0) {
				this.$leftMenu.width(new_width);
				this.$leftMenuBtn.css({left : new_width});
				this._sidebarStatus = this.SIDEBAR_SHOWING;
			} else {
				this.$leftMenu.width(0);
				this.$leftMenuBtn.css({left : 0});
				this.menuBtnOff();
				this.menuBtnToggleOff();
				this._sidebarStatus = this.SIDEBAR_HIDDEN;
				this._previousDistance = 0;
			}
		},
		/**
		 * shows the sidebar
		 * @returns
		 */
		show: function() {
			var _context = this;
			this.status(this.SIDEBAR_SHOWING);
			this.$leftMenu.animate({width: this.MAX_WIDTH},{
				step: function(now,tween){
					_context.$leftMenuBtn.css({left : now});
				},
				done: function() {
					_context.status(_context.SIDEBAR_SHOWN);
					_context.menuBtnOn();
					_context.menuBtnToggleOn();
				}
			});
		},
		/**
		 * shows the sidebar
		 * @returns
		 */
		hide: function() {
			var _context = this;
			this.status(this.SIDEBAR_SHOWING);
			this.$leftMenu.animate({width: 0},{
				step: function(now,tween){
					_context.$leftMenuBtn.css({left : now});
				},
				done: function() {
					_context.status(_context.SIDEBAR_HIDDEN);
					_context.menuBtnOff();
					_context.menuBtnToggleOff();
				}
			});
		},
		
		menuBtnOn : function(){
			this.$leftMenuBtn.css({opacity : 0.7});
		},
		
		menuBtnOff : function(){
			this.$leftMenuBtn.css({opacity : 0.3});
		},
		
		menuBtnToggleOn : function(){
			this.$leftMenuBtn.html('&lt;&lt;');
		},
		
		menuBtnToggleOff : function(){
			this.$leftMenuBtn.html('&gt;&gt;');
		},
		
		/**
		 * initializes the sidebar
		 * @param {object} opts requird content,container,scrollbar
		 * @returns {undefined}
		 */
		init : function(opts){
			this.$leftMenu = opts.leftMenu;
			this.$leftMenuBtn = opts.leftMenuBtn;
			this.$leftMenuBtn.html('&gt;&gt;');
			this._sidebarStatus = this.SIDEBAR_HIDDEN;
			this.$leftMenuBtn.on('click touchstart',function(event){
				event.stopPropagation();
				if( dashApp.sidebar.status() === dashApp.sidebar.SIDEBAR_HIDDEN )
					dashApp.sidebar.show();
				else if( dashApp.sidebar.status() === dashApp.sidebar.SIDEBAR_SHOWN )
					dashApp.sidebar.hide();
			}).mouseover(function(){
				dashApp.sidebar.menuBtnOn();
			}).mouseout(function(){
				if( dashApp.sidebar.status() !== dashApp.sidebar.SIDEBAR_HIDDEN ) return;
				dashApp.sidebar.menuBtnOff();
			});
		}

	},
	scrollable_content: {
		/**
		 * initializes the scrollable content
		 * @param {object} opts requird content,container,scrollbar
		 * @returns {undefined}
		 */
		init: function(opts) {
			this.$content = opts.content;
			this.$container = opts.container;
			this.$scrollbar = opts.scrollbar;
			this.content.init();
			
			/////////////////////////////////////
			//used for detecting mouse leaving browser window
			function addEvent(obj, evt, fn) {
				if (obj.addEventListener) {
					obj.addEventListener(evt, fn, false);
				}
				else if (obj.attachEvent) {
					obj.attachEvent("on" + evt, fn);
				}
			}
			addEvent(document, "mouseout", function(e) {
				e = e ? e : window.event;
				var from = e.relatedTarget || e.toElement;
				if (!from || from.nodeName == "HTML") {
					// stop your drag event here
					// for now we can just use an alert
					$('body').mouseup();
				}
			});
			///////////////////////////////////////////
			
			//when the window in resize the last thing we want to do is refresh the content and scrollbars
			windowResizeCallbacksAdd({
				name: 'content',
				priority : 100,
				callback: function(){
					dashApp.scrollable_content.refresh();
				}
			});
		},
		refresh: function() {
			this.content.refresh();
		},
		/**
		 * content singleton
		 * @type object
		 */
		content: {
			_content_height: 0,
			_container_height: 0,
			/**
			 * returns the content height
			 * @returns {integer|null}
			 */
			contentHeight: function() {
				return this._content_height;
			},
			/**
			 * returns the container height
			 * @returns {Number}
			 */
			containerHeight: function() {
				return this._container_height;
			},
			/**
			 * gets/sets the percentege of position between content and container
			 * @param {float} percentege
			 * @returns {undefined}
			 */
			percentageY : function(percentege){
				var max_top = this.contentHeight() - this.containerHeight();
				if( typeof percentege !== "undefined" ){
					dashApp.scrollable_content.$content.css({top : -max_top*percentege });
				}
				return dashApp.scrollable_content.$content.offset().top/max_top;
			},
			/**
			 * scrolls up
			 * @param {integer} distance
			 * @returns {Boolean}
			 */
			scrollUp: function(distance) {
				var new_top = dashApp.scrollable_content.$content.offset().top + distance;
				var ret = true;
				if (new_top > 0) {
					ret = false;
				}
				dashApp.scrollable_content.$content.css({top: new_top});
				return ret;
			},
			
			/**
			 * scrolls down
			 * @param {integer} distance
			 * @returns {Boolean}
			 */
			scrollDown: function(distance) {
				var new_top = dashApp.scrollable_content.$content.offset().top - distance;
				var max_top = this._container_height - this._content_height;
				var ret = true;
				if (new_top < max_top) {
					ret = false;
				}
				dashApp.scrollable_content.$content.css({top: new_top});
				return ret;
			},
			/**
			 * scrolls a certain distance
			 * @param {type} distance
			 * @returns {Boolean}
			 */
			scroll : function(distance){
				var ret = false;
				if (distance > 0)
					ret = dashApp.scrollable_content.content.scrollDown(distance);
				else
					ret = dashApp.scrollable_content.content.scrollUp(-distance);
				return ret;
			},
			
			/**
			 * initialize the content
			 * @returns
			 */
			init: function() {
				this._container_height = dashApp.scrollable_content.$container.height();
				dashApp.scrollable_content.scrollbar.init();
				this.refresh();
			},
			/**
			 * refresh the content
			 * @returns {undefined}
			 */
			refresh: function() {
				this._content_height = dashApp.scrollable_content.$content.height();
				this._container_height = dashApp.scrollable_content.$container.height();
				dashApp.scrollable_content.scrollbar.refresh();
			}

		},
		/**
		 * the scrollbar singleton
		 * @type type
		 */
		scrollbar: {
			_scrollbarHeight: 0,
			_scrollBarMax: 0,
			init: function() {
				dashApp.scrollable_content.$scrollbar.specialDraggable({
					dragstart: function($elem) {

					},
					dragmove: function(e) {
						var ret = false;
						//ret = dashApp.scrollable_content.content.scroll(e.distanceY - this._oldDistanceY);
						//this._oldDistanceY = e.distanceY;
						dashApp.scrollable_content.scrollbar.scrollY(e.tickY);
						dashApp.scrollable_content.content.percentageY( dashApp.scrollable_content.scrollbar.percentageY() );
						return ret;
					},
					dragend: function() {
						//dashApp.scrollable_content.$content.html("drag end");
						
					}
				});
			},
			scrollY : function(distance){
				var new_top = dashApp.scrollable_content.$scrollbar.offset().top + distance;
				if( new_top < 0 ) new_top = 0;
				if( new_top > this._scrollBarMax) new_top = this._scrollBarMax;
				dashApp.scrollable_content.$scrollbar.css({top: new_top});
			},
			/**
			 * gets/sets the percentege of position between conainer 
			 * @param {float} percentege
			 * @returns {undefined}
			 */
			percentageY : function(percentege){
				var max_top = dashApp.scrollable_content.$container.height() - dashApp.scrollable_content.$scrollbar.height();
				if( typeof percentege !== "undefined" ){
					dashApp.scrollable_content.$scrollbar.css({top : max_top*percentege });
				}
				return dashApp.scrollable_content.$scrollbar.offset().top/max_top;
			},
			refresh: function() {
				var container_h = dashApp.scrollable_content.content.containerHeight();
				var content_h = dashApp.scrollable_content.content.contentHeight();

				var _scrollbarHeight = parseInt(container_h * container_h / content_h);
				
				if (_scrollbarHeight < 1)
					_scrollbarHeight = 5;
				if (_scrollbarHeight >= container_h)
					_scrollbarHeight = null;
				this._scrollbarHeight = _scrollbarHeight;

				dashApp.scrollable_content.$scrollbar.show();
				if (this._scrollbarHeight === null) {
					dashApp.scrollable_content.$scrollbar.hide();
					return;
				} else {
					this._scrollBarMax = container_h - _scrollbarHeight;
					dashApp.scrollable_content.$scrollbar.height(_scrollbarHeight);
				}
			}

		}
	}
}

/**
 * global variable to store wheather or not the dragging is being handled
 * @type Boolean
 */
var _handled = false;

/**
 * gets/sets if the dragging is being handled
 * @param {Boolean} handled
 * @returns {Boolean}
 */
function dragHandled(handled){
	if( typeof handled !== 'undefined' ){
		_handled = handled;
	}
	return _handled;
}
