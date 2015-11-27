
(function (hto) {
	"use strict";

	function directive() {
		/// <summary>
		/// Represent a signature pad in the ui.
		/// </summary>

		function link($scope, $element) {
			var rectSize = $element[0].width;
			var ctx = $element[0].getContext('2d');

			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, rectSize, rectSize);

			//var mobileoffsetX = 100;
			//var mobileoffsetY = 30;
			var mobileoffsetX = 0;
			var mobileoffsetY = 100;

			var drawing = false;
			var lastX, lastY;

			var start = 'mousedown',
                move = 'mousemove',
                end = 'mouseup';

			if (Modernizr.touch === true) {
				start = 'touchstart';
				move = 'touchmove';
				end = 'touchend';
			}

			$element.bind(start, function (event) {
				if (start == 'touchstart') {
					event.preventDefault();
				}

				if (event.offsetX !== undefined) {
					lastX = event.offsetX;
					lastY = event.offsetY;
				} else if (event.pageX !== undefined) {
					// Firefox compatibility
					lastX = event.pageX - event.currentTarget.offsetLeft;
					lastY = event.pageY - event.currentTarget.offsetTop;
				} else {
					// Mobile compatibility
					lastX = event.originalEvent.targetTouches[0].pageX - mobileoffsetX;
					lastY = event.originalEvent.targetTouches[0].pageY - mobileoffsetY;
				}

				ctx.beginPath();
				drawing = true;

			});


			$element.bind(move, function (event) {
				if (move == 'touchmove') {
					event.preventDefault();
				}

				if (drawing) {
					if (event.offsetX !== undefined) {
						currentX = event.offsetX;
						currentY = event.offsetY;
					} else if (event.pageX !== undefined) {
						currentX = event.pageX - event.currentTarget.offsetLeft;
						currentY = event.pageY - event.currentTarget.offsetTop;
					} else {
						currentX = event.originalEvent.targetTouches[0].pageX - mobileoffsetX;
						currentY = event.originalEvent.targetTouches[0].pageY - mobileoffsetY;
					}

					draw(lastX, lastY, currentX, currentY);

					lastX = currentX;
					lastY = currentY;
				}
			});

			$element.bind(end, function (event) {
				drawing = false;
			});

			function reset() {
				$element[0].width = $element[0].width;
			}

			function draw(lX, lY, cX, cY) {
				ctx.moveTo(lX, lY);
				ctx.lineTo(cX, cY);
				ctx.lineWidth = 3;
				ctx.strokeStyle = '#000000';
				ctx.stroke();
			}
		}

		return {
			restrict: "EA",
			link: link
		};
	}

	angular
        .module("hto")
        .directive("htoDrawing", [directive]);

}(hto));