'use strict';

// ATTENTION!!!! NEVER DEFINE PROTOTYPE FOR ARRAY BECAUSE IT ADD ENUMERABLE PROPERTY THAT FUCK UP FOR IN LOOP
// Array.prototype.isEmpty = function() {
//   return !this.length;
// }


String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.is_true = function() {
	return this == 'true';
};

String.prototype.is_false = function() {
	return this == 'false';
};


Boolean.prototype.is_true = function() {
	return this == true;
};

Boolean.prototype.is_false = function() {
	return this == false;
};


Object.defineProperty(Array.prototype, 'is_empty', {
	value: function(){ return this.length === 0 },
	enumerable: false
});

Object.defineProperty(Array.prototype, 'unique', {
	value: function(){ 
		const arr = this;
  	return $.grep(arr, function(el, i){
      return i === $.inArray(el, arr); 
  	})
  },
	enumerable: false
});



// ellipsis --> function to truncate text so that it fit in the box with class 'ellipsis multiline'
(function($) {
  $.fn.ellipsis = function()
  {
    return this.each(function()
    {
      var el = $(this);

      if(el.css("overflow") == "hidden"){
        var text = el.html();
        var multiline = el.hasClass('multiline');
        var t = $(this.cloneNode(true))
            .hide()
            .css('position', 'absolute')
            .css('overflow', 'visible')
            .width(multiline ? el.width() : 'auto')
            .height(multiline ? 'auto' : el.height())
            ;

        el.after(t);

        function height() { return t.height() > el.height(); };
        function width() { return t.width() > el.width(); };

        var func = multiline ? height : width;

        while (text.length > 0 && func()){
          text = text.substr(0, text.length - 1);
          t.html(text + "...");
        }

        el.html(t.html());
        t.remove();
      }
    });
  };
})(jQuery);


// $('selector').waitUntilExists(function(){}) --> plugin which runs handler function once specified element is inserted into the DOM
(function ($, window) {

  var intervals = {};
  var removeListener = function(selector) {
  
    if (intervals[selector]) {
      window.clearInterval(intervals[selector]);
      intervals[selector] = null;
    }
  };
  var found = 'waitUntilExists.found';
  
  /**
   * @function
   * @property {object} jQuery plugin which runs handler function once specified
   *           element is inserted into the DOM
   * @param {function|string} handler 
   *            A function to execute at the time when the element is inserted or 
   *            string "remove" to remove the listener from the given selector
   * @param {bool} shouldRunHandlerOnce 
   *            Optional: if true, handler is unbound after its first invocation
   * @example jQuery(selector).waitUntilExists(function);
   */
  
    $.fn.waitUntilExists = function(handler, shouldRunHandlerOnce, isChild) {
  
      var selector = this.selector;
      var $this = $(selector);
      var $elements = $this.not(function() { return $(this).data(found); });

      if (handler === 'remove') {
        // Hijack and remove interval immediately if the code requests
        removeListener(selector);
      }
      else {
        // Run the handler on all found elements and mark as found
        $elements.each(handler).data(found, true);

        if (shouldRunHandlerOnce && $this.length) {
          // Element was found, implying the handler already ran for all 
          // matched elements
          removeListener(selector);
        }
        else if (!isChild) {
          // If this is a recurring search or if the target has not yet been 
          // found, create an interval to continue searching for the target
          intervals[selector] = window.setInterval(function () {
            $this.waitUntilExists(handler, shouldRunHandlerOnce, true);
          }, 500);
        }
    }
  
    return $this;
  };
  
}(jQuery, window));
