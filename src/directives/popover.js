
angular.module('$strap.directives')

.directive('bsPopover', ['$parse', '$compile', '$http', '$timeout',  function($parse, $compile, $http, $timeout) {
	'use strict';

	// Hide popovers when pressing esc
	$("body").on("keyup", function(ev) {
		if(ev.keyCode === 27) {
			$(".popover.in").each(function() {
				var $this = $(this);
				$this.popover('hide');
			});
		}
	});

	return {
		restrict: 'A',
		scope: true,
		link: function postLink(scope, element, attr, ctrl) {

			var getter = $parse(attr.bsPopover),
				setter = getter.assign;

			$http.get(getter(scope)).success(function(data) {

				// Provide scope display functions
				scope.dismiss = function() {
					element.popover('hide');
				};
				scope.show = function() {
					element.popover('show');
				};

				if(!!attr.unique) {
					element.on('show', function(ev) {
						// Hide any active popover except self
						$(".popover.in").each(function() {
							var $this = $(this),
								popover = $this.data('popover');
							if(popover && !popover.$element.is(element)) {
								$this.popover('hide');
							}
						});
					});
				}

				// Initialize popover
				element.popover({
					content: function() {
						$timeout(function() {

							var popover = element.data('popover'),
								$tip = popover.tip();

							$compile($tip)(scope);

							setTimeout(function() {
								popover.refresh();
							});

						});

						return data;
					},
					html: true
				});

				// Bootstrap override to provide events & tip() reference & refresh positions
				var popover = element.data('popover');
				popover.refresh = function() {
					var $tip = this.tip(), inside, pos, actualWidth, actualHeight, placement, tp;

					placement = typeof this.options.placement === 'function' ?
						this.options.placement.call(this, $tip[0], this.$element[0]) :
						this.options.placement;

					inside = /in/.test(placement);

					pos = this.getPosition(inside);

					actualWidth = $tip[0].offsetWidth;
					actualHeight = $tip[0].offsetHeight;

					switch (inside ? placement.split(' ')[1] : placement) {
						case 'bottom':
						tp = {top: pos.top + pos.height + 10, left: pos.left + pos.width / 2 - actualWidth / 2};
						break;
						case 'top':
						tp = {top: pos.top - actualHeight - 10, left: pos.left + pos.width / 2 - actualWidth / 2};
						break;
						case 'left':
						tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - 10};
						break;
						case 'right':
						tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + 10};
						break;
					}

					$tip.offset(tp);
				};
				popover.show = function() {
					var e = $.Event('show');
					this.$element.trigger(e);
					if (e.isDefaultPrevented()) {
						return;
					}
					var r = $.fn.popover.Constructor.prototype.show.apply(this, arguments);
					// Bind popover to the tip()
					this.$tip.data('popover', this);
					return r;
				};
				popover.hide = function() {
					var e = $.Event('hide');
					this.$element.trigger(e);
					if (e.isDefaultPrevented()) {
						return;
					}
					return $.fn.popover.Constructor.prototype.hide.apply(this, arguments);
				};

			});
		}
	};

}]);