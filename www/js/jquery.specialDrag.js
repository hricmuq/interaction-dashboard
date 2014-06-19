(function($) {
	$.fn.specialDraggable = function(opt) {

		opt = $.extend({
			cursor: "move",
			vertical: true,
			horizontal: false,
			dragstart: null,
			dragend: null,
			dragmove: null,
			stopPropagation: true,
			preventDefault : true
		}, opt);

		var $el = this;
		
		var _startDragX = 0;
		var _startDragY = 0;
		var _originalPosX = 0;
		var _originalPosY = 0;
		var _lastDragX = 0;
		var _lastDragY = 0;
		
		var _dragging = false;
		
		$('body').on("mousemove touchmove", function(e) {

			if (!_dragging)
				return;
			
			e.preventDefault(); // disable selection
			e.stopPropagation();

			try {
				var epy = (e.pageY ? e.pageY : e.originalEvent.targetTouches[0].pageY);
				var epx = (e.pageX ? e.pageX : e.originalEvent.targetTouches[0].pageX);
			} catch (err) {
				//event is off page - stop drag
				_dragging = false;
				return;
			}
			
			e.distanceX = epx - _startDragX;
			e.distanceY = epy - _startDragY;
			
			e.tickX = epx - _lastDragX;
			e.tickY = epy - _lastDragY;
			
			_lastDragX = epx;
			_lastDragY = epy;
			
			if (opt.dragmove !== null) {
				var dragResult = opt.dragmove(e);
				if (typeof dragResult !== "undefined" && dragResult === false) {
					return;
				}
			}
			
			var new_top = _originalPosY;
			if (opt.vertical)  new_top += e.distanceY;
			
			var new_left = _originalPosX;
			if (opt.horizontal) new_left += e.distanceX;
			
			$('.draggable').offset({
				top:  new_top,
				left:  new_left
			});

		}).on("mouseup touchend", function(e) {
			if(!_dragging) return;
			if( opt.stopPropagation )
				e.stopPropagation();
			if( opt.preventDefault )
				e.preventDefault();
			$('.draggable').removeClass('draggable');
			_dragging = false;
			
			if (opt.dragend !== null) opt.dragend();
		});

		return $el.css('cursor', opt.cursor).on("mousedown touchstart", function(e) {
			if( opt.stopPropagation )
				e.stopPropagation();
			if( opt.preventDefault )
				e.preventDefault();
			_dragging = true;
			
			if (opt.dragstart !== null) opt.dragstart($drag);

			var $drag = $(this).addClass('draggable');
			
			try {
				_startDragX = (e.pageX ? e.pageX : e.originalEvent.targetTouches[0].pageX);
				_startDragY = (e.pageY ? e.pageY : e.originalEvent.targetTouches[0].pageY);
			} catch (err) {
				//should never happen
				return;
			}
			
			_originalPosY = $drag.offset().top;
			_originalPosX = $drag.offset().left;
			
			_lastDragX = _startDragX;
			_lastDragY = _startDragY;

		});

	}
})(jQuery);



