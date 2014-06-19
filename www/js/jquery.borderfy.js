/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function($) {
	$.fn.borderfy = function(opts) {

		var $el = $(this);
		
		if (typeof opts === "string") {
			if (opts === "refresh") {
				refresh($el);
			}
			return $el;
		}

		var opt = $.extend({
			cellCallback: null,
			resize: true
		}, opts);

		$el.data('opts',opt);

		if (typeof opt.cellCallback !== "function") {
			throw "cellCallback missing"
		}
		
		init($el);

		return $el;
	};

	function resizeRow($lastElem) {
		var maxHeight = 0;
		var $cur = $lastElem;
		var $prev = $cur.prev();
		while ($prev.length !== 0 && $prev.position().top === $cur.position().top) {
			$cur.height('auto');

			if ($cur.height() > maxHeight) {
				maxHeight = $cur.height();
			}
			var $temp = $prev;
			$prev = $cur.prev();
			$cur = $temp;
		}

		//now that we have the max height for this row, assign it to all row cells
		$cur = $lastElem;
		$prev = $cur.prev();
		while ($prev.length !== 0 && $prev.position().top === $cur.position().top) {
			$cur.height(maxHeight);
			$temp = $prev;
			$prev = $cur.prev();
			$cur = $temp;
		}
	}

	function fixChildrenBorders($el) {
		var origin = $el.children(":first").position();
		var opt = $el.data('opts');

		$el.children().height('auto').each(function(i, v) {
			var $child = $(this);
			var firstCol = false;
			var lastCol = false;
			var firstRow = false;
			var lastRow = false;

			if ($child.position().top === origin.top) {
				firstRow = true;
			}

			if ($child.position().left === origin.left) {
				firstCol = true;
			}

			var $next = $child.next();

			if ($next.length === 0) {
				lastCol = true;
				lastRow = true;
			} else {
				if ($next.position().top !== $child.position().top) {
					lastCol = true;
				}
			}

			if (lastCol && opt && opt.resize) {
				resizeRow($child);
			}

            if( opt ){
                opt.cellCallback($child, {
                    lastCol: lastCol,
                    lastRow: lastRow,
                    firstCol: firstCol,
                    firstRow: firstRow
                });
            }
		});
	}

	function init($el) {
		fixChildrenBorders($el);

		//after resizing the window the positions of the children could change
		windowResizeCallbacksAdd({
			name: 'borderfy',
			priority: 50,
			callback: function() {
				fixChildrenBorders($el);
			}
		});
	}

	function refresh($el) {
		fixChildrenBorders($el);
	}

})(jQuery);

