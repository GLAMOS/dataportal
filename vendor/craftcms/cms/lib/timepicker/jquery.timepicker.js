!function(e){"object"==typeof exports&&exports&&"object"==typeof module&&module&&module.exports===exports?e(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],e):e(jQuery)}(function(b){var w=86400,d={am:"am",pm:"pm",AM:"AM",PM:"PM",decimal:".",mins:"mins",hr:"hr",hrs:"hrs"},s={appendTo:"body",className:null,closeOnWindowScroll:!1,disableTextInput:!1,disableTimeRanges:[],disableTouchKeyboard:!1,durationTime:null,forceRoundTime:!1,maxTime:null,minTime:null,noneOption:!1,orientation:"l",roundingFunction:function(e,i){if(null===e)return null;if("number"!=typeof i.step)return e;var t=e%(60*i.step);return(t-=(i.minTime||0)%(60*i.step))>=30*i.step?e+=60*i.step-t:e-=t,I(e,i)},scrollDefault:null,selectOnBlur:!1,show2400:!1,showDuration:!1,showOn:["click","focus"],showOnFocus:!0,step:30,stopScrollPropagation:!1,timeFormat:"g:ia",typeaheadHighlight:!0,useSelect:!1,wrapHours:!0},y={init:function(a){return this.each(function(){var e=b(this),i=[];for(var t in s)e.data(t)&&(i[t]=e.data(t));var n=b.extend({},s,a,i);if(n.lang&&(d=b.extend(d,n.lang)),n=o(n),e.data("timepicker-settings",n),e.addClass("ui-timepicker-input"),n.useSelect)u(e);else{if(e.prop("autocomplete","off"),n.showOn)for(var r in n.showOn)e.on(n.showOn[r]+".timepicker",y.show);e.on("change.timepicker",c),e.on("keydown.timepicker",g),e.on("keyup.timepicker",k),n.disableTextInput&&e.on("keydown.timepicker",h),e.on("cut.timepicker",k),e.on("paste.timepicker",k),c.call(e.get(0),null,"initial")}})},show:function(e){var i=b(this),t=i.data("timepicker-settings");if(e&&e.preventDefault(),t.useSelect)i.data("timepicker-list").focus();else{C(i)&&i.blur();var n=i.data("timepicker-list");if(!i.prop("readonly")&&(n&&0!==n.length&&"function"!=typeof t.durationTime||(u(i),n=i.data("timepicker-list")),!l(n))){i.data("ui-timepicker-value",i.val()),O(i,n),y.hide(),n.show();var r,a={};t.orientation.match(/r/)?a.left=i.offset().left+i.outerWidth()-n.outerWidth()+parseInt(n.css("marginLeft").replace("px",""),10):a.left=i.offset().left+parseInt(n.css("marginLeft").replace("px",""),10),r=t.orientation.match(/t/)?"t":t.orientation.match(/b/)?"b":i.offset().top+i.outerHeight(!0)+n.outerHeight()>b(window).height()+b(window).scrollTop()?"t":"b",a.top="t"==r?(n.addClass("ui-timepicker-positioned-top"),i.offset().top-n.outerHeight()+parseInt(n.css("marginTop").replace("px",""),10)):(n.removeClass("ui-timepicker-positioned-top"),i.offset().top+i.outerHeight()+parseInt(n.css("marginTop").replace("px",""),10)),n.offset(a);var s=n.find(".ui-timepicker-selected");if(!s.length){var o=F(f(i));null!==o?s=m(i,n,o):t.scrollDefault&&(s=m(i,n,t.scrollDefault()))}if(s.length&&!s.hasClass("ui-timepicker-disabled")||(s=n.find("li:not(.ui-timepicker-disabled):first")),s&&s.length){var c=n.scrollTop()+s.position().top-s.outerHeight();n.scrollTop(c)}else n.scrollTop(0);return t.stopScrollPropagation&&b(document).on("wheel.ui-timepicker",".ui-timepicker-wrapper",function(e){e.preventDefault();var i=b(this).scrollTop();b(this).scrollTop(i+e.originalEvent.deltaY)}),b(document).on("touchstart.ui-timepicker mousedown.ui-timepicker",p),b(window).on("resize.ui-timepicker",p),t.closeOnWindowScroll&&b(document).on("scroll.ui-timepicker",p),i.trigger("showTimepicker"),this}}},hide:function(e){var i=b(this),t=i.data("timepicker-settings");return t&&t.useSelect&&i.blur(),b(".ui-timepicker-wrapper").each(function(){var e=b(this);if(l(e)){var i=e.data("timepicker-input"),t=i.data("timepicker-settings");t&&t.selectOnBlur&&R(i),e.hide(),i.trigger("hideTimepicker")}}),this},option:function(n,r){return"string"==typeof n&&void 0===r?b(this).data("timepicker-settings")[n]:this.each(function(){var e=b(this),i=e.data("timepicker-settings"),t=e.data("timepicker-list");"object"==typeof n?i=b.extend(i,n):"string"==typeof n&&(i[n]=r),i=o(i),e.data("timepicker-settings",i),c.call(e.get(0),{type:"change"},"initial"),t&&(t.remove(),e.data("timepicker-list",!1)),i.useSelect&&u(e)})},getSecondsFromMidnight:function(){return F(f(this))},getTime:function(e){var i=f(this);if(!i)return null;var t=F(i);if(null===t)return null;e||(e=new Date);var n=new Date(e);return n.setHours(t/3600),n.setMinutes(t%3600/60),n.setSeconds(t%60),n.setMilliseconds(0),n},isVisible:function(){var e=this.data("timepicker-list");return!(!e||!l(e))},setTime:function(e){var i=this,t=i.data("timepicker-settings");if(t.forceRoundTime)var n=H(F(e),t);else n=M(F(e),t);return e&&null===n&&t.noneOption&&(n=e),D(i,n,"initial"),c.call(i.get(0),{type:"change"},"initial"),i.data("timepicker-list")&&O(i,i.data("timepicker-list")),this},remove:function(){var e=this;if(e.hasClass("ui-timepicker-input")){var i=e.data("timepicker-settings");return e.removeAttr("autocomplete","off"),e.removeClass("ui-timepicker-input"),e.removeData("timepicker-settings"),e.off(".timepicker"),e.data("timepicker-list")&&e.data("timepicker-list").remove(),i.useSelect&&e.show(),e.removeData("timepicker-list"),this}}};function l(e){var i=e[0];return 0<i.offsetWidth&&0<i.offsetHeight}function o(e){if(e.minTime&&(e.minTime=F(e.minTime)),e.maxTime&&(e.maxTime=F(e.maxTime)),e.durationTime&&"function"!=typeof e.durationTime&&(e.durationTime=F(e.durationTime)),"now"==e.scrollDefault)e.scrollDefault=function(){return e.roundingFunction(F(new Date),e)};else if(e.scrollDefault&&"function"!=typeof e.scrollDefault){var i=e.scrollDefault;e.scrollDefault=function(){return e.roundingFunction(F(i),e)}}else e.minTime&&(e.scrollDefault=function(){return e.roundingFunction(e.minTime,e)});if("string"===b.type(e.timeFormat)&&e.timeFormat.match(/[gh]/)&&(e._twelveHourTime=!0),!1===e.showOnFocus&&-1!=e.showOn.indexOf("focus")&&e.showOn.splice(e.showOn.indexOf("focus"),1),0<e.disableTimeRanges.length){for(var t in e.disableTimeRanges)e.disableTimeRanges[t]=[F(e.disableTimeRanges[t][0]),F(e.disableTimeRanges[t][1])];e.disableTimeRanges=e.disableTimeRanges.sort(function(e,i){return e[0]-i[0]});for(t=e.disableTimeRanges.length-1;0<t;t--)e.disableTimeRanges[t][0]<=e.disableTimeRanges[t-1][1]&&(e.disableTimeRanges[t-1]=[Math.min(e.disableTimeRanges[t][0],e.disableTimeRanges[t-1][0]),Math.max(e.disableTimeRanges[t][1],e.disableTimeRanges[t-1][1])],e.disableTimeRanges.splice(t,1))}return e}function u(i){var e=i.data("timepicker-settings"),t=i.data("timepicker-list");if(t&&t.length&&(t.remove(),i.data("timepicker-list",!1)),e.useSelect)var n=t=b("<select />",{class:"ui-timepicker-select"});else t=b("<ul />",{class:"ui-timepicker-list"}),(n=b("<div />",{class:"ui-timepicker-wrapper",tabindex:-1})).css({display:"none",position:"absolute"}).append(t);if(e.noneOption)if(!0===e.noneOption&&(e.noneOption=e.useSelect?"Time...":"None"),b.isArray(e.noneOption)){for(var r in e.noneOption)if(parseInt(r,10)==r){var a=x(e.noneOption[r],e.useSelect);t.append(a)}}else{a=x(e.noneOption,e.useSelect);t.append(a)}if(e.className&&n.addClass(e.className),(null!==e.minTime||null!==e.durationTime)&&e.showDuration){"function"==typeof e.step||e.step;n.addClass("ui-timepicker-with-duration"),n.addClass("ui-timepicker-step-"+e.step)}var s=e.minTime;"function"==typeof e.durationTime?s=F(e.durationTime()):null!==e.durationTime&&(s=e.durationTime);var o=null!==e.minTime?e.minTime:0,c=null!==e.maxTime?e.maxTime:o+w-1;c<o&&(c+=w),c===w-1&&"string"===b.type(e.timeFormat)&&e.show2400&&(c=w);var l=e.disableTimeRanges,u=0,p=l.length,m=e.step;"function"!=typeof m&&(m=function(){return e.step});r=o;for(var d=0;r<=c;r+=60*m(++d)){var f,h=r,g=M(h,e);if(e.useSelect)(f=b("<option />",{value:g})).text(g);else(f=b("<li />")).addClass(h%w<w/2?"ui-timepicker-am":"ui-timepicker-pm"),f.data("time",I(h,e)),f.text(g);if((null!==e.minTime||null!==e.durationTime)&&e.showDuration){var k=S(r-s,e.step);if(e.useSelect)f.text(f.text()+" ("+k+")");else{var v=b("<span />",{class:"ui-timepicker-duration"});v.text(" ("+k+")"),f.append(v)}}u<p&&(h>=l[u][1]&&(u+=1),l[u]&&h>=l[u][0]&&h<l[u][1]&&(e.useSelect?f.prop("disabled",!0):f.addClass("ui-timepicker-disabled"))),t.append(f)}if(n.data("timepicker-input",i),i.data("timepicker-list",n),e.useSelect)i.val()&&t.val(H(F(i.val()),e)),t.on("focus",function(){b(this).data("timepicker-input").trigger("showTimepicker")}),t.on("blur",function(){b(this).data("timepicker-input").trigger("hideTimepicker")}),t.on("change",function(){D(i,b(this).val(),"select")}),D(i,t.val(),"initial"),i.hide().after(t);else{var T=e.appendTo;"string"==typeof T?T=b(T):"function"==typeof T&&(T=T(i)),T.append(n),O(i,t),t.on("mousedown click","li",function(e){i.off("focus.timepicker"),i.on("focus.timepicker-ie-hack",function(){i.off("focus.timepicker-ie-hack"),i.on("focus.timepicker",y.show)}),C(i)||i[0].focus(),t.find("li").removeClass("ui-timepicker-selected"),b(this).addClass("ui-timepicker-selected"),R(i)&&(i.trigger("hideTimepicker"),t.on("mouseup.timepicker click.timepicker","li",function(e){t.off("mouseup.timepicker click.timepicker"),n.hide()}))})}}function x(e,i){var t,n,r;return"object"==typeof e?(t=e.label,n=e.className,r=e.value):"string"==typeof e?t=e:b.error("Invalid noneOption value"),i?b("<option />",{value:r,class:n,text:t}):b("<li />",{class:n,text:t}).data("time",String(r))}function H(e,i){if(null!==(e=i.roundingFunction(e,i)))return M(e,i)}function p(e){if(e.target!=window){var i=b(e.target);i.closest(".ui-timepicker-input").length||i.closest(".ui-timepicker-wrapper").length||(y.hide(),b(document).unbind(".ui-timepicker"),b(window).unbind(".ui-timepicker"))}}function C(e){var i=e.data("timepicker-settings");return(window.navigator.msMaxTouchPoints||"ontouchstart"in document)&&i.disableTouchKeyboard}function m(e,i,n){if(!n&&0!==n)return!1;var t=e.data("timepicker-settings"),r=!1;n=t.roundingFunction(n,t);return i.find("li").each(function(e,i){var t=b(i);if("number"==typeof t.data("time"))return t.data("time")==n?(r=t,!1):void 0}),r}function O(e,i){i.find("li").removeClass("ui-timepicker-selected");var t=e.data("timepicker-settings"),n=F(f(e),t);if(null!==n){var r=m(e,i,n);if(r){var a=r.offset().top-i.offset().top;(a+r.outerHeight()>i.outerHeight()||a<0)&&i.scrollTop(i.scrollTop()+r.position().top-r.outerHeight()),(t.forceRoundTime||r.data("time")===n)&&r.addClass("ui-timepicker-selected")}}}function c(e,i){if("timepicker"!=i){var t=b(this);if(""!==this.value){if(!t.is(":focus")||e&&"change"==e.type){var n=t.data("timepicker-settings"),r=F(this.value,n);if(null!==r){var a=!1;if(null!==n.minTime&&null!==n.maxTime&&(r<n.minTime||r>n.maxTime)&&(a=!0),b.each(n.disableTimeRanges,function(){if(r>=this[0]&&r<this[1])return!(a=!0)}),n.forceRoundTime){var s=n.roundingFunction(r,n);s!=r&&(r=s,i=null)}var o=M(r,n);a?(D(t,o,"error")||e&&"change"==e.type)&&t.trigger("timeRangeError"):D(t,o,i)}else t.trigger("timeFormatError")}}else D(t,null,i)}}function f(e){return e.is("input")?e.val():e.data("ui-timepicker-value")}function D(e,i,t){if(e.is("input")){e.val(i);var n=e.data("timepicker-settings");n.useSelect&&"select"!=t&&e.data("timepicker-list").val(H(F(i),n))}return e.data("ui-timepicker-value")!=i?(e.data("ui-timepicker-value",i),"select"==t?e.trigger("selectTime").trigger("changeTime").trigger("change","timepicker"):-1==["error","initial"].indexOf(t)&&e.trigger("changeTime"),!0):(-1==["error","initial"].indexOf(t)&&e.trigger("selectTime"),!1)}function h(e){switch(e.keyCode){case 13:case 9:return;default:e.preventDefault()}}function g(e){var i=b(this),t=i.data("timepicker-list");if(!t||!l(t)){if(40!=e.keyCode)return!0;y.show.call(i.get(0)),t=i.data("timepicker-list"),C(i)||i.focus()}switch(e.keyCode){case 13:return R(i)&&(c.call(i.get(0),{type:"change"}),y.hide.apply(this)),e.preventDefault(),!1;case 38:var n=t.find(".ui-timepicker-selected");return n.length?n.is(":first-child")||(n.removeClass("ui-timepicker-selected"),n.prev().addClass("ui-timepicker-selected"),n.prev().position().top<n.outerHeight()&&t.scrollTop(t.scrollTop()-n.outerHeight())):(t.find("li").each(function(e,i){if(0<b(i).position().top)return n=b(i),!1}),n.addClass("ui-timepicker-selected")),!1;case 40:return 0===(n=t.find(".ui-timepicker-selected")).length?(t.find("li").each(function(e,i){if(0<b(i).position().top)return n=b(i),!1}),n.addClass("ui-timepicker-selected")):n.is(":last-child")||(n.removeClass("ui-timepicker-selected"),n.next().addClass("ui-timepicker-selected"),n.next().position().top+2*n.outerHeight()>t.outerHeight()&&t.scrollTop(t.scrollTop()+n.outerHeight())),!1;case 27:t.find("li").removeClass("ui-timepicker-selected"),y.hide();break;case 9:y.hide();break;default:return!0}}function k(e){var i=b(this),t=i.data("timepicker-list"),n=i.data("timepicker-settings");if(!t||!l(t)||n.disableTextInput)return!0;if("paste"!==e.type&&"cut"!==e.type)switch(e.keyCode){case 96:case 97:case 98:case 99:case 100:case 101:case 102:case 103:case 104:case 105:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 65:case 77:case 80:case 186:case 8:case 46:n.typeaheadHighlight?O(i,t):t.hide()}else setTimeout(function(){n.typeaheadHighlight?O(i,t):t.hide()},0)}function R(e){var i=e.data("timepicker-settings"),t=null,n=e.data("timepicker-list").find(".ui-timepicker-selected");return!n.hasClass("ui-timepicker-disabled")&&(n.length&&(t=n.data("time")),null!==t&&("string"!=typeof t&&(t=M(t,i)),D(e,t,"select")),!0)}function S(e,i){e=Math.abs(e);var t,n,r=Math.round(e/60),a=[];return r<60?a=[r,d.mins]:(t=Math.floor(r/60),n=r%60,30==i&&30==n&&(t+=d.decimal+5),a.push(t),a.push(1==t?d.hr:d.hrs),30!=i&&n&&(a.push(n),a.push(d.mins))),a.join(" ")}function M(e,i){if("number"!=typeof e)return null;var t=parseInt(e%60),n=parseInt(e/60%60),r=parseInt(e/3600%24),a=new Date(1970,0,2,r,n,t,0);if(isNaN(a.getTime()))return null;if("function"===b.type(i.timeFormat))return i.timeFormat(a);for(var s,o,c="",l=0;l<i.timeFormat.length;l++)switch(o=i.timeFormat.charAt(l)){case"a":c+=11<a.getHours()?d.pm:d.am;break;case"A":c+=11<a.getHours()?d.PM:d.AM;break;case"g":c+=0===(s=a.getHours()%12)?"12":s;break;case"G":s=a.getHours(),e===w&&(s=i.show2400?24:0),c+=s;break;case"h":0!==(s=a.getHours()%12)&&s<10&&(s="0"+s),c+=0===s?"12":s;break;case"H":s=a.getHours(),e===w&&(s=i.show2400?24:0),c+=9<s?s:"0"+s;break;case"i":c+=9<(n=a.getMinutes())?n:"0"+n;break;case"s":c+=9<(t=a.getSeconds())?t:"0"+t;break;case"\\":l++,c+=i.timeFormat.charAt(l);break;default:c+=o}return c}function F(e,i){if(""===e||null===e)return null;if("object"==typeof e)return 3600*e.getHours()+60*e.getMinutes()+e.getSeconds();if("string"!=typeof e)return e;"a"!=(e=e.toLowerCase().replace(/[\s\.]/g,"")).slice(-1)&&"p"!=e.slice(-1)||(e+="m");var t="("+d.am.replace(".","")+"|"+d.pm.replace(".","")+"|"+d.AM.replace(".","")+"|"+d.PM.replace(".","")+")?",n=new RegExp("^"+t+"([0-9]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?"+t+"$"),r=e.match(n);if(!r)return null;var a=parseInt(1*r[2],10),s=r[1]||r[5],o=a,c=1*r[3]||0,l=1*r[4]||0;if(a<=12&&s){var u=s==d.pm||s==d.PM;o=12==a?u?12:0:a+(u?12:0)}else if(i){if(3600*a+60*c+l>=w+(i.show2400?1:0)){if(!1===i.wrapHours)return null;o=a%24}}var p=3600*o+60*c+l;if(a<12&&!s&&i&&i._twelveHourTime&&i.scrollDefault){var m=p-i.scrollDefault();m<0&&w/-2<=m&&(p=(p+w/2)%w)}return p}function I(e,i){return e==w&&i.show2400?e:e%w}b.fn.timepicker=function(e){return this.length?y[e]?this.hasClass("ui-timepicker-input")?y[e].apply(this,Array.prototype.slice.call(arguments,1)):this:"object"!=typeof e&&e?void b.error("Method "+e+" does not exist on jQuery.timepicker"):y.init.apply(this,arguments):this}});
//# sourceMappingURL=jquery.timepicker.js.map
