!function(e,r){if("object"==typeof exports&&"object"==typeof module)module.exports=r();else if("function"==typeof define&&define.amd)define([],r);else{var t=r();for(var n in t)("object"==typeof exports?exports:e)[n]=t[n]}}(window,function(){return function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=21)}({1:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(4),o=t(2),u=t(3);r.urlGetToken=function(e,t,n){var o=[["method","auth.getToken"],["api_key",t]];return e+"?"+u.urlEncodeParams(o)+"&api_sig="+r.constructSignatureForParams(o,n)+"&format=json"},r.connectApplication=function(e,r,t){return e+"auth/?api_key="+(t?r+"&cb="+encodeURIComponent(t):r)},r.createSessionUrl=function(e,t,n,o){var i=[["api_key",t],["method","auth.getSession"],["token",n]];return e+"?"+u.urlEncodeParams(i)+"&api_sig="+r.constructSignatureForParams(i,o)+"&format=json"};var i=function(e,r,t){t&&e.push([r,t])},a=function(e,r,t){i(e,"artist["+t+"]",r.artist),i(e,"track["+t+"]",r.track),i(e,"timestamp["+t+"]",r.timestamp.toString()),i(e,"album["+t+"]",r.album),i(e,"trackNumber["+t+"]",r.trackNumber),i(e,"mbid["+t+"]",r.mbid),i(e,"duration["+t+"]",r.duration)};function c(e,t,n,o){var u=[];e.forEach(function(e,r){return a(u,e,r)});u.push(["method","track.scrobble"]),u.push(["api_key",t]),u.push(["sk",n]);var i=new FormData;return u.forEach(function(e){return i.append(e[0],e[1])}),i.append("api_sig",r.constructSignatureForParams(u,o)),i}r.createScrobbleFormData=c,r.scrobbleTracks=function(e,r,t,n,u){var i=c(u,r,t,n),a=o.makePostRequest(e,i,function(){alert(a.responseText)},function(){alert(a.responseText)})};r.constructSignatureForParams=function(e,r){return n.md5hash(""+function(e){return e.sort(function(e,r){return e[0]<r[0]?-1:e[0]>r[0]?1:0})}(e).map(function(e){return e[0]+e[1]})+r)}},2:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.createRequest=function(e,r,t){var n=new XMLHttpRequest;return n.overrideMimeType("application/json"),n.open("GET",e,!0),t&&(n.onerror=t),r&&(n.onload=r),n},r.makeGetRequest=function(e,r,t){var n=new XMLHttpRequest;return n.overrideMimeType("application/json"),n.open("GET",e,!0),t&&(n.onerror=t),r&&(n.onload=r),n.send(null),n},r.makePostRequest=function(e,r,t,n){var o=new XMLHttpRequest;return o.overrideMimeType("application/json"),o.open("POST",e,!0),n&&(o.onerror=n),t&&(o.onload=t),o.send(r),o}},21:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(6),o=t(1),u=t(5),i=t(2),a=document.getElementById("mount-point"),c=window?window.location:null,s=n.parseUrlParams(c?c.search:null);var f=function(e){var r=document.createElement("div");return r.innerText=e,r};if(function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];var t=!0;return e.forEach(function(e){s[e]||(alert("Expected parameter "+e),t=!1)}),t}("lastfm_user","lastfm_api_key","librefm_api_key","librefm_user","librefm_secret","token")&&a){var l=o.createSessionUrl(u.libre2_0,s.librefm_api_key,s.token,s.librefm_secret),p=document.createElement("div");p.innerHTML='Creating session (<a href="'+l+'">'+l+"</a>)",a.appendChild(p),i.makeGetRequest(l,function(){var e=JSON.parse(this.responseText);e&&e.key?a.appendChild(f("Could not create session: "+e.error)):a.appendChild(function(e){var r=document.createElement("div");return r.innerText=e,r}("Created session with session key "+e.key))},function(){a.appendChild(f("Could not create session"))})}},3:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.splitArray=function(e,r){var t=[],n=[];return t.push(n),e.forEach(function(e){n.length>=r&&(n=[],t.push(n)),n.push(e)}),t},r.urlEncodeParams=function(e,r){return void 0===r&&(r=!1),e.map(function(e){return e[0]+"="+(r?encodeURIComponent(e[1]):e[1])}).join("&")}},4:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=0;function o(e){return c(s(a(e),8*e.length))}function u(e){for(var r,t=n?"0123456789ABCDEF":"0123456789abcdef",o="",u=0;u<e.length;u++)r=e.charCodeAt(u),o+=t.charAt(r>>>4&15)+t.charAt(15&r);return o}function i(e){for(var r,t,n="",o=-1;++o<e.length;)r=e.charCodeAt(o),t=o+1<e.length?e.charCodeAt(o+1):0,55296<=r&&r<=56319&&56320<=t&&t<=57343&&(r=65536+((1023&r)<<10)+(1023&t),o++),r<=127?n+=String.fromCharCode(r):r<=2047?n+=String.fromCharCode(192|r>>>6&31,128|63&r):r<=65535?n+=String.fromCharCode(224|r>>>12&15,128|r>>>6&63,128|63&r):r<=2097151&&(n+=String.fromCharCode(240|r>>>18&7,128|r>>>12&63,128|r>>>6&63,128|63&r));return n}function a(e){for(var r=Array(e.length>>2),t=0;t<r.length;t++)r[t]=0;for(t=0;t<8*e.length;t+=8)r[t>>5]|=(255&e.charCodeAt(t/8))<<t%32;return r}function c(e){for(var r=[],t=0;t<32*e.length;t+=8)r.push(String.fromCharCode(e[t>>5]>>>t%32&255));return r.join("")}function s(e,r){e[r>>5]|=128<<r%32,e[14+(r+64>>>9<<4)]=r;for(var t=1732584193,n=-271733879,o=-1732584194,u=271733878,i=0;i<e.length;i+=16){var a=t,c=n,s=o,f=u;t=l(t,n,o,u,e[i],7,-680876936),u=l(u,t,n,o,e[i+1],12,-389564586),o=l(o,u,t,n,e[i+2],17,606105819),n=l(n,o,u,t,e[i+3],22,-1044525330),t=l(t,n,o,u,e[i+4],7,-176418897),u=l(u,t,n,o,e[i+5],12,1200080426),o=l(o,u,t,n,e[i+6],17,-1473231341),n=l(n,o,u,t,e[i+7],22,-45705983),t=l(t,n,o,u,e[i+8],7,1770035416),u=l(u,t,n,o,e[i+9],12,-1958414417),o=l(o,u,t,n,e[i+10],17,-42063),n=l(n,o,u,t,e[i+11],22,-1990404162),t=l(t,n,o,u,e[i+12],7,1804603682),u=l(u,t,n,o,e[i+13],12,-40341101),o=l(o,u,t,n,e[i+14],17,-1502002290),n=l(n,o,u,t,e[i+15],22,1236535329),t=p(t,n,o,u,e[i+1],5,-165796510),u=p(u,t,n,o,e[i+6],9,-1069501632),o=p(o,u,t,n,e[i+11],14,643717713),n=p(n,o,u,t,e[i],20,-373897302),t=p(t,n,o,u,e[i+5],5,-701558691),u=p(u,t,n,o,e[i+10],9,38016083),o=p(o,u,t,n,e[i+15],14,-660478335),n=p(n,o,u,t,e[i+4],20,-405537848),t=p(t,n,o,u,e[i+9],5,568446438),u=p(u,t,n,o,e[i+14],9,-1019803690),o=p(o,u,t,n,e[i+3],14,-187363961),n=p(n,o,u,t,e[i+8],20,1163531501),t=p(t,n,o,u,e[i+13],5,-1444681467),u=p(u,t,n,o,e[i+2],9,-51403784),o=p(o,u,t,n,e[i+7],14,1735328473),n=p(n,o,u,t,e[i+12],20,-1926607734),t=d(t,n,o,u,e[i+5],4,-378558),u=d(u,t,n,o,e[i+8],11,-2022574463),o=d(o,u,t,n,e[i+11],16,1839030562),n=d(n,o,u,t,e[i+14],23,-35309556),t=d(t,n,o,u,e[i+1],4,-1530992060),u=d(u,t,n,o,e[i+4],11,1272893353),o=d(o,u,t,n,e[i+7],16,-155497632),n=d(n,o,u,t,e[i+10],23,-1094730640),t=d(t,n,o,u,e[i+13],4,681279174),u=d(u,t,n,o,e[i],11,-358537222),o=d(o,u,t,n,e[i+3],16,-722521979),n=d(n,o,u,t,e[i+6],23,76029189),t=d(t,n,o,u,e[i+9],4,-640364487),u=d(u,t,n,o,e[i+12],11,-421815835),o=d(o,u,t,n,e[i+15],16,530742520),n=d(n,o,u,t,e[i+2],23,-995338651),t=m(t,n,o,u,e[i],6,-198630844),u=m(u,t,n,o,e[i+7],10,1126891415),o=m(o,u,t,n,e[i+14],15,-1416354905),n=m(n,o,u,t,e[i+5],21,-57434055),t=m(t,n,o,u,e[i+12],6,1700485571),u=m(u,t,n,o,e[i+3],10,-1894986606),o=m(o,u,t,n,e[i+10],15,-1051523),n=m(n,o,u,t,e[i+1],21,-2054922799),t=m(t,n,o,u,e[i+8],6,1873313359),u=m(u,t,n,o,e[i+15],10,-30611744),o=m(o,u,t,n,e[i+6],15,-1560198380),n=m(n,o,u,t,e[i+13],21,1309151649),t=m(t,n,o,u,e[i+4],6,-145523070),u=m(u,t,n,o,e[i+11],10,-1120210379),o=m(o,u,t,n,e[i+2],15,718787259),n=m(n,o,u,t,e[i+9],21,-343485551),t=b(t,a),n=b(n,c),o=b(o,s),u=b(u,f)}return Array(t,n,o,u)}r.md5hash=function(e){return u(o(i(e)))};var f=function(e,r,t,n,o,u){return b(v(b(b(r,e),b(n,u)),o),t)},l=function(e,r,t,n,o,u,i){return f(r&t|~r&n,e,r,o,u,i)},p=function(e,r,t,n,o,u,i){return f(r&n|t&~n,e,r,o,u,i)},d=function(e,r,t,n,o,u,i){return f(r^t^n,e,r,o,u,i)},m=function(e,r,t,n,o,u,i){return f(t^(r|~n),e,r,o,u,i)},b=function(e,r){var t=(65535&e)+(65535&r);return(e>>16)+(r>>16)+(t>>16)<<16|65535&t},v=function(e,r){return e<<r|e>>>32-r}},5:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(1);r.libreApi="https://libre.fm/api/",r.libre2_0="https://libre.fm/2.0/",r.connectApplicationLibreFm=function(e){return n.connectApplication(r.libreApi,e)};r.convertToLibreScrobbles=function(e){return e.map(function(e){return function(e,r,t,n,o,u,i){return{timestamp:e,track:r,artist:t,album:n,mbid:o,duration:u,trackNumber:i}}(e.uts,e.name,e.artist&&e.artist.name||"",e.album&&e.album.name,e.mbid,e.duration,e.trackNumber)})}},6:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=/([^&=]+)=?([^&]*)/g,o=function(e){return decodeURIComponent(e.replace(/\s+/g,""))};r.parseUrlParams=function(e){if(e){for(var r={},t=e.substring(1),u=void 0;u=n.exec(t);)r[o(u[1])]=o(u[2]);return r}return{}},r.getCurrentHostName=function(e){if(!e)return"";var r=e.location;return r&&r.hostname||""}}})});
//# sourceMappingURL=synchronize.js.map