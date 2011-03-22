/* Copyright (c) 2008 Chris Moyer (chris@inarow.net)
 *  MIT (http://www.opensource.org/licenses/mit-license.php) licensed.
 * 
 *  Version: 1.0
 * 
 *  Requires:
 *   jQuery 1.2+
 */

jQuery.fn.throttle = function (callback, settings) {
  settings = jQuery.extend({
    per: 50,  
    pause: 2
  }, settings);

  var on = 0;
  var num_items = this.length;
  var original_this = this;
  var iter = function () {
    var done = 0;
    while (done++ < settings.per && on < num_items) {
      callback.call(original_this.eq(on));
      on++;
    }


    if (on != num_items) {
      setTimeout(iter, settings.pause);
    }
  }
  iter();
};
