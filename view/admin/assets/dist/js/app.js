/**
 * Created by Kupletsky Sergey on 17.10.14.
 *
 * Material Sidebar (Profile menu)
 * Tested on Win8.1 with browsers: Chrome 37, Firefox 32, Opera 25, IE 11, Safari 5.1.7
 * You can use this sidebar in Bootstrap (v3) projects. HTML-markup like Navbar bootstrap component will make your work easier.
 * Dropdown menu and sidebar toggle button works with JQuery and Bootstrap.min.js
 */

// Sidebar toggle
//
// -------------------
$(document).ready(function() {
    var overlay = $('.sidebar-overlay');

    $('.sidebar-toggle').on('click', function() {
        var sidebar = $('#sidebar');
        sidebar.toggleClass('open');
        if ((sidebar.hasClass('sidebar-fixed-left') || sidebar.hasClass('sidebar-fixed-right')) && sidebar.hasClass('open')) {
            overlay.addClass('active');
        } else {
            overlay.removeClass('active');
        }
    });

    overlay.on('click', function() {
        $(this).removeClass('active');
        $('#sidebar').removeClass('open');
    });

});

// Sidebar constructor
//
// -------------------
$(document).ready(function() {

    var sidebar = $('#sidebar');
    var sidebarHeader = $('#sidebar .sidebar-header');
    var sidebarImg = sidebarHeader.css('background-image');
    var toggleButtons = $('.sidebar-toggle');

    // Hide toggle buttons on default position
    toggleButtons.css('display', 'none');
    $('body').css('display', 'table');


    // Sidebar position
    $('#sidebar-position').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-fixed-left sidebar-fixed-right sidebar-stacked').addClass(value).addClass('open');
        if (value == 'sidebar-fixed-left' || value == 'sidebar-fixed-right') {
            $('.sidebar-overlay').addClass('active');
        }
        // Show toggle buttons
        if (value != '') {
            toggleButtons.css('display', 'initial');
            $('body').css('display', 'initial');
        } else {
            // Hide toggle buttons
            toggleButtons.css('display', 'none');
            $('body').css('display', 'table');
        }
    });

    // Sidebar theme
    $('#sidebar-theme').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-default sidebar-inverse sidebar-colored sidebar-colored-inverse').addClass(value)
    });

    // Header cover
    $('#sidebar-header').change(function() {
        var value = $(this).val();

        $('.sidebar-header').removeClass('header-cover').addClass(value);

        if (value == 'header-cover') {
            sidebarHeader.css('background-image', sidebarImg)
        } else {
            sidebarHeader.css('background-image', '')
        }
    });
});

/**
 * Created by Kupletsky Sergey on 08.09.14.
 *
 * Add JQuery animation to bootstrap dropdown elements.
 */

(function($) {
    var dropdown = $('.dropdown');

    // Add slidedown animation to dropdown
    dropdown.on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideup animation to dropdown
    dropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });
})(jQuery);



(function(removeClass) {

	jQuery.fn.removeClass = function( value ) {
		if ( value && typeof value.test === "function" ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];
				if ( elem.nodeType === 1 && elem.className ) {
					var classNames = elem.className.split( /\s+/ );

					for ( var n = classNames.length; n--; ) {
						if ( value.test(classNames[n]) ) {
							classNames.splice(n, 1);
						}
					}
					elem.className = jQuery.trim( classNames.join(" ") );
				}
			}
		} else {
			removeClass.call(this, value);
		}
		return this;
	}

})(jQuery.fn.removeClass);

$(function () {
    $('.comment-delete').on("click", function () {
        var comment = $(this);
        alertify.confirm("Are you sure you want to delete this post?", function() {
            var id = comment.attr("rel");
            $.ajax({
                type: "delete",
                url: "/admin/comments/?id=" + id,
                success: function (json) {
                    alertify.success("Comment delted");
                    $('#comment-' + id).remove();
                },
                error: function (json) {
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            });
        });
    });
    $('.comment-approve').on("click", function () {
        var comment = $(this);
        var id = $(this).attr("rel");
        $.ajax({
            type: "put",
            url: "/admin/comments/?id=" + id,
            "success":function(json){
                if(json.status === "success"){
                    alertify.success("Comment approved");
                    comment.removeClass("comment-approve").removeClass("mdl-color-text--green").addClass("disabled").attr("disabled", true);
                    comment.unbind();
                }else{
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            }
        });
        return false;
    });
    $('.comment-reply').on("click",function(){
        var id = $(this).attr("rel");
        $('#comment-'+id).after($('#comment-block').detach().show());
        $('#comment-parent').val(id);
        return false;
    });
    $('#comment-form').ajaxForm({
        success: function (json) {
            alertify.success("Succesfully replied");
            window.location.href = "/admin/comments/";
        },
        error: function (json) {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $('#comment-close').on("click",function(){
        $('#comment-block').hide();
        $('#comment-parent').val(0);
        $('#comment-content').val("");
    });
});

$(function () {
  new FormValidator("post-form", [
      {"name": "slug", "rules": "alpha_dash"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#post-form').ajaxSubmit({
    success: function (json) {
      if (json.status === "success") {
        alertify.success("Content saved", 'success');
        window.history.pushState({}, "", "/admin/editor/" + json.content.Id + "/");
      } else {
        alertify.error(json.msg);
      }
    },
    error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
    }
    });
  });
  initUpload("#post-information");
});

$(function() {
  $("#files_table").on("click", ".delete-file", function(e) {
    e.preventDefault();

    var me = $(this);
    var id = me.attr("id");

    alertify.confirm("Are you sure you want to delete this file?", function() {
      $.ajax({
        type: "delete",
        url: "/admin/files/?id=" + id,
        success: function(json) {
          if (json.status === "success") {
            me.parent()
              .parent()
              .remove();
            alertify.success("File deleted");
          } else {
            alert(json.msg);
          }
        }
      });
    });
  });
});

window.listenDigSelectEvent = function () {
  $(".dig-select").change(function(){
    var id = $(this).attr("id");
    var val=$(this).find('option:selected').val();
    $.ajax({
      type: "post",
      url: "/admin/files/gallery_status",
      data: `id=${id}&val=${val}`,
      success: function(json) {
        if (json.status === "success") {
          alertify.success(`change id ${id} success`);
        } else {
          alert(json.msg);
        }
      }
    });
  })
}

$(function() {
  listenDigSelectEvent()
});

$(function () {
  new FormValidator("login-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }

    $('#login-form').ajaxSubmit({
      dataType: "json",
      success: function (json) {
        if (json.status === "error") {
          alertify.error("Incorrect username & password combination.");
        } else {
          window.location.href = "/admin/";
        }
      }
    });
  })
});

$(function(){
  new FormValidator("password-form",[
      {"name":"old","rules":"min_length[2]|max_length[20]"},
      {"name":"new","rules":"min_length[2]|max_length[20]"},
      {"name":"confirm","rules":"required|matches[new]"}
  ],function(errors,e){
    e.preventDefault();
    $('.invalid').hide();
    if(errors.length){
      $("#"+errors[0].id+"-invalid").removeClass("hide").show();
      return;
    }
    $('#password').ajaxSubmit({
      "success": function() {
        alertify.success("Password changed");
      },
      "error": function() {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});

$(".delete-post").on("click",function(e){
  e.preventDefault();
  var id = $(this).attr("rel");
  alertify.confirm("Are you sure you want to delete this post?", function() {
    $.ajax({
      "url":"/admin/editor/"+id+"/",
      "type":"delete",
      "success":function(json){
        if(json.status === "success"){
          alertify.success("Post deleted");
          $('#dingo-post-' + id).remove();
        }else{
          alertify.error((JSON.parse(json.responseText).msg));
        }
      }
    });
  });
});


$(function(){
    new FormValidator("profile-form",[
        {"name":"slug","rules":"alpha_numeric|min_length[1]|max_length[20]"},
        {"name":"email","rules":"valid_email"},
        {"name":"url","rules":"valid_url"}
    ],function(errors,e) {
        e.preventDefault();
        $('.invalid').hide();
        if(errors.length){
            $("#"+errors[0].id+"-invalid").removeClass("hide").show();
            return;
        }
        $('#profile').ajaxSubmit(function(json){
            if(json.status === "error"){
                alert(json.msg);
            }else{
                alertify.success("Profile saved")
            }
            return false;
        });
    })
});

var pumelo =
  /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
      /******/ 			return installedModules[moduleId].exports;
      /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
      /******/ 			i: moduleId,
      /******/ 			l: false,
      /******/ 			exports: {}
      /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// define getter function for harmony exports
  /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
      /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
      /******/ 		}
    /******/ 	};
  /******/
  /******/ 	// define __esModule on exports
  /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      /******/ 		}
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
  /******/
  /******/ 	// create a fake namespace object
  /******/ 	// mode & 1: value is a module id, require it
  /******/ 	// mode & 2: merge all properties of value into the ns
  /******/ 	// mode & 4: return value when already ns object
  /******/ 	// mode & 8|1: behave like require
  /******/ 	__webpack_require__.t = function(value, mode) {
    /******/ 		if(mode & 1) value = __webpack_require__(value);
    /******/ 		if(mode & 8) return value;
    /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    /******/ 		var ns = Object.create(null);
    /******/ 		__webpack_require__.r(ns);
    /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    /******/ 		return ns;
    /******/ 	};
  /******/
  /******/ 	// getDefaultExport function for compatibility with non-harmony modules
  /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
      /******/ 			function getDefault() { return module['default']; } :
      /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
  /******/
  /******/ 	// Object.prototype.hasOwnProperty.call
  /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(__webpack_require__.s = 0);
  /******/ })
/************************************************************************/
/******/ ([
  /* 0 */
  /***/ (function(module, exports, __webpack_require__) {

    /**
     *
     * @name pumelo.js
     * @description JavaScript工具箱
     * @author xqLi
     */

    module.exports = Object.assign(
      __webpack_require__(1),
      __webpack_require__(2),
      __webpack_require__(3),
    );

    /***/ }),
  /* 1 */
  /***/ (function(module, exports) {

    /**
     * find
     * @param {Array} arr
     * @param {Function} callback
     * @returns {*}
     */
    module.exports.find = function (arr, callback) {
      if (arr == null || arr.length == 0) {
        this.print('array is null');
        return;
      }

      for (var i = 0; i < arr.length; i++) {
        var __boolean__ = callback(arr[i]);
        if (__boolean__) {
          return arr[i]
        }
      }
    };


    /**
     * every
     * @param {Array} arr
     * @param {Function} fn
     * @returns {Boolean}
     */
    module.exports.every = function (arr, fn) {
      var result = true;
      for (var i = 0; i < arr.length; i++) {
        result = result && fn(arr[i]);

        // 遇到第一个不匹配条件的元素时就停止遍历数组
        if (result === false) return false;
      }
      return result;
    };

    /**
     * some
     * @param {Array} arr
     * @param {Function} fn
     * @returns {Boolean}
     */
    module.exports.some = function (arr, fn) {
      var result = false;
      for (var i = 0; i < arr.length; i++) {
        result = fn(arr[i]);
        if (result) return true;
      }
      return result;
    };

    /**
     * once
     * @param {Function} fn
     * @returns {Function}
     */
    module.exports.once = function (fn) {
      var done = false;

      return function () {
        return done ? void 0 : ((done = true), fn.apply(this, arguments));
      }
    };

    module.exports.copyArray = function (arr) {
      return arr.concat()
    };

    module.exports.hp = function (obj, key) {
      return obj.hasOwnProperty(key)
    }

    module.exports.typeof = function (obj) {
      let type = Object.prototype.toString.call(obj);
      if (type == '[object Array]') return 'array';
      if (type == '[object Object]') return 'object';
      return 'not object type';
    }

    /**
     * isObj
     * @param {*} obj
     * @returns {Boolean}
     */
    module.exports.isObj = function (obj) {
      return this.typeof(obj) === 'object';
    }

    /**
     * isArray
     * @param {*} obj
     * @returns {Boolean}
     */
    module.exports.isArray = function (obj) {
      return this.typeof(obj) === 'array';
    }

    /**
     * Returns all the distinct values of an array.
     * @param {Array} - source array
     * @returns {Array} - new array
     */
    module.exports.distinctValuesOfArray = (arr) => [...new Set(arr)];

    /**
     * Measures the time taken by a function to execute.
     * @param {Function} - callback function
     * @returns {*}
     */
    module.exports.timeTaken = function (callback) {
      console.time('timeTaken');
      const r = callback();
      console.timeEnd('timeTaken');
      return r;
    }

    /**
     * 生成随机颜色
     * @returns {String}
     */
    module.exports.randomColor = function () {
      let n = ((Math.random() * 0xfffff) | 0).toString(16);
      return '#' + (n.length !== 6 ? ((Math.random() * 0xf) | 0).toString(16) + n : n);
    }

    /**
     * 生成随机字符串
     * @param {Number} - 随机字符串长度
     * @returns {String}
     */
    module.exports.randomString = function (length) {
      var str = "";
      var length = length;
      var arr = ['0', '1', '2', '3', '4', '5',
        '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e',
        'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y',
        'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
        'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      ];

      for (var i = 0; i < length; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
      }
      return str;
    }

    /**
     * @param {String} - 被检测的字符串
     * @param {String} - 检测类型
     * @returns {Boolean}
     */
    module.exports.checkStringType = function (str, type) {
      switch (type) {
        case 'email':
          return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(str);
        case 'phone':
          return /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(str);
        case 'tel':
          return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
        case 'number':
          return /^[0-9]$/.test(str);
        case 'lower':
          return /^[a-z]+$/.test(str);
        case 'upper':
          return /^[A-Z]+$/.test(str);
        case 'ip':
          return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(str);
        default:
          return true;
      }
    };

    /**
     * 生成随机数.
     * @param {Number} - 最小值
     * @param {Number} - 最大值
     * @returns {Number}
     */
    module.exports.randomNum = function (Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      return (Min + Math.round(Rand * Range));
    }

    /**
     * 数组排序.
     * @param {Array} - source array
     * @returns {Array} - new array
     */
    module.exports.quickSort = function (arr) {
      if (arr.length <= 1) return arr;
      let middle_number = Math.floor(arr.length / 2);
      let pivot = arr.splice(middle_number, 1)[0];
      let leftList = [];
      let rightList = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] < pivot) {
          leftList.push(arr[i])
        } else {
          rightList.push(arr[i])
        }
      }
      return this.quickSort(leftList).concat([pivot], this.quickSort(rightList));
    }

    /***/ }),
  /* 2 */
  /***/ (function(module, exports) {



    /***/ }),
  /* 3 */
  /***/ (function(module, exports) {

    /**
     * Base64加密
     * @returns {String}
     * @example
     * let base64 = new pumelo.base64();
     * 加密
     * base64.encode("some string");
     * 解密
     * base64.decode(base64.encode("some string"));
     */
    module.exports.base64 = function () {

      // private property
      _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

      // public method for encoding
      this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
      }

      // public method for decoding
      this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
          enc1 = _keyStr.indexOf(input.charAt(i++));
          enc2 = _keyStr.indexOf(input.charAt(i++));
          enc3 = _keyStr.indexOf(input.charAt(i++));
          enc4 = _keyStr.indexOf(input.charAt(i++));
          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;
          output = output + String.fromCharCode(chr1);
          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
          }
        }
        output = _utf8_decode(output);
        return output;
      }

      // private method for UTF-8 encoding
      _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }

        }
        return utftext;
      }

      // private method for UTF-8 decoding
      _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
          c = utftext.charCodeAt(i);
          if (c < 128) {
            string += String.fromCharCode(c);
            i++;
          } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
          }
        }
        return string;
      }
    }

    /**
     * MD5加密（Message-Digest Algorithm 5 ／ 消息摘要算法）
     * @returns {String}
     * @example
     * let md5 = new pumelo.md5()
     * 加密
     * md5.hex_md5("some string")
     */
    module.exports.md5 = function () {
      var hexcase = 0;
      var b64pad = "";
      var chrsz = 8;

      this.hex_md5 = function (s) {
        return binl2hex(core_md5(str2binl(s), s.length * chrsz));
      }

      function b64_md5(s) {
        return binl2b64(core_md5(str2binl(s), s.length * chrsz));
      }

      function str_md5(s) {
        return binl2str(core_md5(str2binl(s), s.length * chrsz));
      }

      function hex_hmac_md5(key, data) {
        return binl2hex(core_hmac_md5(key, data));
      }

      function b64_hmac_md5(key, data) {
        return binl2b64(core_hmac_md5(key, data));
      }

      function str_hmac_md5(key, data) {
        return binl2str(core_hmac_md5(key, data));
      }

      function md5_vm_test() {
        return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
      }


      function core_md5(x, len) {
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
          var olda = a;
          var oldb = b;
          var oldc = c;
          var oldd = d;

          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);

      }

      function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      }

      function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
      }

      function core_hmac_md5(key, data) {
        var bkey = str2binl(key);
        if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

        var ipad = Array(16),
          opad = Array(16);
        for (var i = 0; i < 16; i++) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
        return core_md5(opad.concat(hash), 512 + 128);
      }

      function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
      }

      function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
      }

      function str2binl(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz)
          bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
        return bin;
      }

      function binl2str(bin) {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < bin.length * 32; i += chrsz)
          str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
        return str;
      }

      function binl2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
          str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
            hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
      }

      function binl2b64(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i += 3) {
          var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) |
            (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) |
            ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
          for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
            else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
          }
        }
        return str;
      }
    }

    /**
     * sha1加密（Secure Hash Algorithm ／ 安全哈希算法）
     * @returns {String}
     * @example
     * let sha1 = new pumelo.sha1()
     * 加密
     * sha1.hex_sha1("some string")
     */
    module.exports.sha1 = function () {
      var hexcase = 0;
      var b64pad = "";
      var chrsz = 8;

      this.hex_sha1 = function (s) {
        return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
      }

      function b64_sha1(s) {
        return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
      }

      function str_sha1(s) {
        return binb2str(core_sha1(str2binb(s), s.length * chrsz));
      }

      function hex_hmac_sha1(key, data) {
        return binb2hex(core_hmac_sha1(key, data));
      }

      function b64_hmac_sha1(key, data) {
        return binb2b64(core_hmac_sha1(key, data));
      }

      function str_hmac_sha1(key, data) {
        return binb2str(core_hmac_sha1(key, data));
      }

      function sha1_vm_test() {
        return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
      }

      function core_sha1(x, len) {
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
          var olda = a;
          var oldb = b;
          var oldc = c;
          var oldd = d;
          var olde = e;

          for (var j = 0; j < 80; j++) {
            if (j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
          }

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
          e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);

      }

      function sha1_ft(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
      }

      function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
      }

      function core_hmac_sha1(key, data) {
        var bkey = str2binb(key);
        if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

        var ipad = Array(16),
          opad = Array(16);
        for (var i = 0; i < 16; i++) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
        return core_sha1(opad.concat(hash), 512 + 160);
      }

      function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
      }

      function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
      }

      function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz)
          bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        return bin;
      }

      function binb2str(bin) {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < bin.length * 32; i += chrsz)
          str += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & mask);
        return str;
      }

      function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
          str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
      }

      function binb2b64(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i += 3) {
          var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
          for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
            else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
          }
        }
        return str;
      }
    }

    /***/ })
  /******/ ]);
$(function () {
    $('.setting-form').ajaxForm({
        'success': function() {
            alertify.success("Saved");
        },
        'error': function() {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $("#add-custom").on("click", function(e) {
        e.preventDefault();
        $("#custom-settings").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();

    });
    $('.setting-form').on("click", ".del-nav", function(e) {
        e.preventDefault();
        console.log($(this).parent().parent());
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
    $('.setting-form').on("click", ".del-custom", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
})

$(function () {
    new FormValidator("signup-form", [
        {"name": "name", "rules": "required"},
        {"name": "email", "rules": "required"},
        {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
    ], function (errors, e) {
        e.preventDefault();
        if (errors.length) {
            alertify.error("Error: " + errors[0].message);
            return;
        }
        $('#signup-form').ajaxSubmit({
            success: function (json) {
                window.location.href = "/admin/";
            },
            error: function (json) {
                alertify.error(("Error: " + JSON.parse(json.responseText).msg));
            }
        });
    })
});

function editorAction(json) {
    var cm = $('.CodeMirror')[0].CodeMirror;
    var doc = cm.getDoc();
    doc.replaceSelections(["![](/" + json.file.url + ")"]);
}

function filesAction(json) {
    var $fileLine = $('<tr id="file-' + json.file.name + '">' 
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.time + '</td>'
        // + '<td class="mdl-data-table__cell--non-numeric">' + json.file.size + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.name + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<img class="admin-thumbnail" src="/' + json.file.url + '" alt="">'
        + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.type + '</td>'
        +` <td class="mdl-data-table__cell--non-numeric">
            <select class="dig-select" id="${json.file.id}">
              <option ${json.is_show_on_gallery ? 'selected'  : ''} value ="true">true</option>
              <option ${json.is_show_on_gallery ? ''  : 'selected'} value ="false">false</option>
            </select>
        </td>`

        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<a class="btn btn-small blue" href="/'+ json.file.url +'" target="_blank" title="/' + json.file.name + '">View</a>&nbsp;'
          + '<a class="btn btn-small red delete-file" href="#" name="' + json.file.name + '" rel="' + json.file.url + '" title="Delete">Delete</a>'
        + '</td></tr>');
    $('tbody').prepend($fileLine);
    window.listenDigSelectEvent()
}

function initUpload(p) {
    $('#attach-show').on("click", function() {
        $('#attach-upload').trigger("click");
    });
    $('#attach-upload').on("change", function () {
        alertify.confirm("Upload now?", function() {
            var bar = $('<p class="file-progress inline-block">0%</p>');
            $('#attach-form').ajaxSubmit({
                "beforeSubmit": function () {
                    $(p).before(bar);
                },
                "uploadProgress": function (event, position, total, percentComplete) {
                    var percentVal = percentComplete + '%';
                    bar.css("width", percentVal).html(percentVal);
                },
                "success": function (json) {
                    $('#attach-upload').val("");
                    if (json.status === "error") {
                        bar.html(json.msg).addClass("err");
                        setTimeout(function () {
                            bar.remove();
                        }, 5000);
                        return
                    }
                    
                    alertify.success("File has been uploaded.")
                    bar.html("/" + json.file.url + "&nbsp;&nbsp;&nbsp;(@" + json.file.name + ")");                    
                    if ($('.CodeMirror').length == 0) {
                        filesAction(json);
                    } else {
                        editorAction(json);
                    }
                }
            });
        }, function() {
            $(this).val("");
        });
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJwcm9maWxlLmpzIiwicHVtZWxvLmpzIiwic2V0dGluZ3MuanMiLCJzaWdudXAuanMiLCJ1cGxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBLdXBsZXRza3kgU2VyZ2V5IG9uIDE3LjEwLjE0LlxuICpcbiAqIE1hdGVyaWFsIFNpZGViYXIgKFByb2ZpbGUgbWVudSlcbiAqIFRlc3RlZCBvbiBXaW44LjEgd2l0aCBicm93c2VyczogQ2hyb21lIDM3LCBGaXJlZm94IDMyLCBPcGVyYSAyNSwgSUUgMTEsIFNhZmFyaSA1LjEuN1xuICogWW91IGNhbiB1c2UgdGhpcyBzaWRlYmFyIGluIEJvb3RzdHJhcCAodjMpIHByb2plY3RzLiBIVE1MLW1hcmt1cCBsaWtlIE5hdmJhciBib290c3RyYXAgY29tcG9uZW50IHdpbGwgbWFrZSB5b3VyIHdvcmsgZWFzaWVyLlxuICogRHJvcGRvd24gbWVudSBhbmQgc2lkZWJhciB0b2dnbGUgYnV0dG9uIHdvcmtzIHdpdGggSlF1ZXJ5IGFuZCBCb290c3RyYXAubWluLmpzXG4gKi9cblxuLy8gU2lkZWJhciB0b2dnbGVcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJy5zaWRlYmFyLW92ZXJsYXknKTtcblxuICAgICQoJy5zaWRlYmFyLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgICAgIHNpZGViYXIudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKChzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQnKSB8fCBzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLXJpZ2h0JykpICYmIHNpZGViYXIuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgb3ZlcmxheS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdmVybGF5LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJyNzaWRlYmFyJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9KTtcblxufSk7XG5cbi8vIFNpZGViYXIgY29uc3RydWN0b3Jcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIHZhciBzaWRlYmFyID0gJCgnI3NpZGViYXInKTtcbiAgICB2YXIgc2lkZWJhckhlYWRlciA9ICQoJyNzaWRlYmFyIC5zaWRlYmFyLWhlYWRlcicpO1xuICAgIHZhciBzaWRlYmFySW1nID0gc2lkZWJhckhlYWRlci5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcbiAgICB2YXIgdG9nZ2xlQnV0dG9ucyA9ICQoJy5zaWRlYmFyLXRvZ2dsZScpO1xuXG4gICAgLy8gSGlkZSB0b2dnbGUgYnV0dG9ucyBvbiBkZWZhdWx0IHBvc2l0aW9uXG4gICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcblxuXG4gICAgLy8gU2lkZWJhciBwb3NpdGlvblxuICAgICQoJyNzaWRlYmFyLXBvc2l0aW9uJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZml4ZWQtbGVmdCBzaWRlYmFyLWZpeGVkLXJpZ2h0IHNpZGViYXItc3RhY2tlZCcpLmFkZENsYXNzKHZhbHVlKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICBpZiAodmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtbGVmdCcgfHwgdmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtcmlnaHQnKSB7XG4gICAgICAgICAgICAkKCcuc2lkZWJhci1vdmVybGF5JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNob3cgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgaWYgKHZhbHVlICE9ICcnKSB7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2lkZWJhciB0aGVtZVxuICAgICQoJyNzaWRlYmFyLXRoZW1lJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZGVmYXVsdCBzaWRlYmFyLWludmVyc2Ugc2lkZWJhci1jb2xvcmVkIHNpZGViYXItY29sb3JlZC1pbnZlcnNlJykuYWRkQ2xhc3ModmFsdWUpXG4gICAgfSk7XG5cbiAgICAvLyBIZWFkZXIgY292ZXJcbiAgICAkKCcjc2lkZWJhci1oZWFkZXInKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykudmFsKCk7XG5cbiAgICAgICAgJCgnLnNpZGViYXItaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1jb3ZlcicpLmFkZENsYXNzKHZhbHVlKTtcblxuICAgICAgICBpZiAodmFsdWUgPT0gJ2hlYWRlci1jb3ZlcicpIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgc2lkZWJhckltZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJycpXG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAwOC4wOS4xNC5cbiAqXG4gKiBBZGQgSlF1ZXJ5IGFuaW1hdGlvbiB0byBib290c3RyYXAgZHJvcGRvd24gZWxlbWVudHMuXG4gKi9cblxuKGZ1bmN0aW9uKCQpIHtcbiAgICB2YXIgZHJvcGRvd24gPSAkKCcuZHJvcGRvd24nKTtcblxuICAgIC8vIEFkZCBzbGlkZWRvd24gYW5pbWF0aW9uIHRvIGRyb3Bkb3duXG4gICAgZHJvcGRvd24ub24oJ3Nob3cuYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5zbGlkZURvd24oKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBzbGlkZXVwIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdoaWRlLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVVcCgpO1xuICAgIH0pO1xufSkoalF1ZXJ5KTtcblxuXG5cbihmdW5jdGlvbihyZW1vdmVDbGFzcykge1xuXG5cdGpRdWVyeS5mbi5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50ZXN0ID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0dmFyIGVsZW0gPSB0aGlzW2ldO1xuXHRcdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgJiYgZWxlbS5jbGFzc05hbWUgKSB7XG5cdFx0XHRcdFx0dmFyIGNsYXNzTmFtZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCggL1xccysvICk7XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgbiA9IGNsYXNzTmFtZXMubGVuZ3RoOyBuLS07ICkge1xuXHRcdFx0XHRcdFx0aWYgKCB2YWx1ZS50ZXN0KGNsYXNzTmFtZXNbbl0pICkge1xuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWVzLnNwbGljZShuLCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgPSBqUXVlcnkudHJpbSggY2xhc3NOYW1lcy5qb2luKFwiIFwiKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZUNsYXNzLmNhbGwodGhpcywgdmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59KShqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLmNvbW1lbnQtZGVsZXRlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gJCh0aGlzKTtcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBwb3N0P1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGNvbW1lbnQuYXR0cihcInJlbFwiKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb21tZW50IGRlbHRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2NvbW1lbnQtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJCgnLmNvbW1lbnQtYXBwcm92ZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29tbWVudCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwicHV0XCIsXG4gICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgXCJzdWNjZXNzXCI6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkNvbW1lbnQgYXBwcm92ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQucmVtb3ZlQ2xhc3MoXCJjb21tZW50LWFwcHJvdmVcIikucmVtb3ZlQ2xhc3MoXCJtZGwtY29sb3ItdGV4dC0tZ3JlZW5cIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQudW5iaW5kKCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcuY29tbWVudC1yZXBseScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gICAgICAgICQoJyNjb21tZW50LScraWQpLmFmdGVyKCQoJyNjb21tZW50LWJsb2NrJykuZGV0YWNoKCkuc2hvdygpKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKGlkKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJyNjb21tZW50LWZvcm0nKS5hamF4Rm9ybSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiU3VjY2VzZnVsbHkgcmVwbGllZFwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vY29tbWVudHMvXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1jbG9zZScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICAkKCcjY29tbWVudC1ibG9jaycpLmhpZGUoKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKDApO1xuICAgICAgICAkKCcjY29tbWVudC1jb250ZW50JykudmFsKFwiXCIpO1xuICAgIH0pO1xufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwb3N0LWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInNsdWdcIiwgXCJydWxlc1wiOiBcImFscGhhX2Rhc2hcIn1cbiAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgJChcIiNcIiArIGVycm9yc1swXS5pZCArIFwiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJCgnI3Bvc3QtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb250ZW50IHNhdmVkXCIsICdzdWNjZXNzJyk7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJcIiwgXCIvYWRtaW4vZWRpdG9yL1wiICsganNvbi5jb250ZW50LklkICsgXCIvXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoanNvbi5tc2cpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIGluaXRVcGxvYWQoXCIjcG9zdC1pbmZvcm1hdGlvblwiKTtcbn0pO1xuIiwiJChmdW5jdGlvbigpIHtcbiAgJChcIiNmaWxlc190YWJsZVwiKS5vbihcImNsaWNrXCIsIFwiLmRlbGV0ZS1maWxlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgbWUgPSAkKHRoaXMpO1xuICAgIHZhciBpZCA9IG1lLmF0dHIoXCJpZFwiKTtcblxuICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgZmlsZT9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB0eXBlOiBcImRlbGV0ZVwiLFxuICAgICAgICB1cmw6IFwiL2FkbWluL2ZpbGVzLz9pZD1cIiArIGlkLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICAgICAgbWUucGFyZW50KClcbiAgICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJGaWxlIGRlbGV0ZWRcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KGpzb24ubXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG53aW5kb3cubGlzdGVuRGlnU2VsZWN0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICQoXCIuZGlnLXNlbGVjdFwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJpZFwiKTtcbiAgICB2YXIgdmFsPSQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykudmFsKCk7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgdXJsOiBcIi9hZG1pbi9maWxlcy9nYWxsZXJ5X3N0YXR1c1wiLFxuICAgICAgZGF0YTogYGlkPSR7aWR9JnZhbD0ke3ZhbH1gLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNvbikge1xuICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhgY2hhbmdlIGlkICR7aWR9IHN1Y2Nlc3NgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbGVydChqc29uLm1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn1cblxuJChmdW5jdGlvbigpIHtcbiAgbGlzdGVuRGlnU2VsZWN0RXZlbnQoKVxufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJsb2dpbi1mb3JtXCIsIFtcbiAgICAgIHtcIm5hbWVcIjogXCJwYXNzd29yZFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWR8bWluX2xlbmd0aFs0XXxtYXhfbGVuZ3RoWzIwXVwifVxuICBdLCBmdW5jdGlvbiAoZXJyb3JzLCBlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAkKFwiI1wiICsgZXJyb3JzWzBdLmlkICsgXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICQoJyNsb2dpbi1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIikge1xuICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKFwiSW5jb3JyZWN0IHVzZXJuYW1lICYgcGFzc3dvcmQgY29tYmluYXRpb24uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn0pO1xuIiwiJChmdW5jdGlvbigpe1xuICBuZXcgRm9ybVZhbGlkYXRvcihcInBhc3N3b3JkLWZvcm1cIixbXG4gICAgICB7XCJuYW1lXCI6XCJvbGRcIixcInJ1bGVzXCI6XCJtaW5fbGVuZ3RoWzJdfG1heF9sZW5ndGhbMjBdXCJ9LFxuICAgICAge1wibmFtZVwiOlwibmV3XCIsXCJydWxlc1wiOlwibWluX2xlbmd0aFsyXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgIHtcIm5hbWVcIjpcImNvbmZpcm1cIixcInJ1bGVzXCI6XCJyZXF1aXJlZHxtYXRjaGVzW25ld11cIn1cbiAgXSxmdW5jdGlvbihlcnJvcnMsZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgIGlmKGVycm9ycy5sZW5ndGgpe1xuICAgICAgJChcIiNcIitlcnJvcnNbMF0uaWQrXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkKCcjcGFzc3dvcmQnKS5hamF4U3VibWl0KHtcbiAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlBhc3N3b3JkIGNoYW5nZWRcIik7XG4gICAgICB9LFxuICAgICAgXCJlcnJvclwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59KTtcbiIsIiQoXCIuZGVsZXRlLXBvc3RcIikub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBwb3N0P1wiLCBmdW5jdGlvbigpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgXCJ1cmxcIjpcIi9hZG1pbi9lZGl0b3IvXCIraWQrXCIvXCIsXG4gICAgICBcInR5cGVcIjpcImRlbGV0ZVwiLFxuICAgICAgXCJzdWNjZXNzXCI6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlBvc3QgZGVsZXRlZFwiKTtcbiAgICAgICAgICAkKCcjZGluZ28tcG9zdC0nICsgaWQpLnJlbW92ZSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBhbGVydGlmeS5lcnJvcigoSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcblxuIiwiJChmdW5jdGlvbigpe1xuICAgIG5ldyBGb3JtVmFsaWRhdG9yKFwicHJvZmlsZS1mb3JtXCIsW1xuICAgICAgICB7XCJuYW1lXCI6XCJzbHVnXCIsXCJydWxlc1wiOlwiYWxwaGFfbnVtZXJpY3xtaW5fbGVuZ3RoWzFdfG1heF9sZW5ndGhbMjBdXCJ9LFxuICAgICAgICB7XCJuYW1lXCI6XCJlbWFpbFwiLFwicnVsZXNcIjpcInZhbGlkX2VtYWlsXCJ9LFxuICAgICAgICB7XCJuYW1lXCI6XCJ1cmxcIixcInJ1bGVzXCI6XCJ2YWxpZF91cmxcIn1cbiAgICBdLGZ1bmN0aW9uKGVycm9ycyxlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgICAgIGlmKGVycm9ycy5sZW5ndGgpe1xuICAgICAgICAgICAgJChcIiNcIitlcnJvcnNbMF0uaWQrXCItaW52YWxpZFwiKS5yZW1vdmVDbGFzcyhcImhpZGVcIikuc2hvdygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICQoJyNwcm9maWxlJykuYWpheFN1Ym1pdChmdW5jdGlvbihqc29uKXtcbiAgICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpe1xuICAgICAgICAgICAgICAgIGFsZXJ0KGpzb24ubXNnKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQcm9maWxlIHNhdmVkXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH0pXG59KTtcbiIsInZhciBwdW1lbG8gPVxuICAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4gIC8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuICAvKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4gIC8qKioqKiovXG4gIC8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiAgLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4gICAgLyoqKioqKi9cbiAgICAvKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gICAgLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gICAgICAvKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiAgICAgIC8qKioqKiovIFx0XHR9XG4gICAgLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gICAgLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiAgICAgIC8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuICAgICAgLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4gICAgICAvKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuICAgICAgLyoqKioqKi8gXHRcdH07XG4gICAgLyoqKioqKi9cbiAgICAvKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gICAgLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuICAgIC8qKioqKiovXG4gICAgLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiAgICAvKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuICAgIC8qKioqKiovXG4gICAgLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gICAgLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiAgICAvKioqKioqLyBcdH1cbiAgLyoqKioqKi9cbiAgLyoqKioqKi9cbiAgLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuICAvKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4gIC8qKioqKiovXG4gIC8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiAgLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuICAvKioqKioqL1xuICAvKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuICAvKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuICAgIC8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gICAgICAvKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiAgICAgIC8qKioqKiovIFx0XHR9XG4gICAgLyoqKioqKi8gXHR9O1xuICAvKioqKioqL1xuICAvKioqKioqLyBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiAgLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gICAgLyoqKioqKi8gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuICAgICAgLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gICAgICAvKioqKioqLyBcdFx0fVxuICAgIC8qKioqKiovIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIC8qKioqKiovIFx0fTtcbiAgLyoqKioqKi9cbiAgLyoqKioqKi8gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiAgLyoqKioqKi8gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiAgLyoqKioqKi8gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiAgLyoqKioqKi8gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiAgLyoqKioqKi8gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gIC8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiAgICAvKioqKioqLyBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gICAgLyoqKioqKi8gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gICAgLyoqKioqKi8gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gICAgLyoqKioqKi8gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gICAgLyoqKioqKi8gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAvKioqKioqLyBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuICAgIC8qKioqKiovIFx0XHRyZXR1cm4gbnM7XG4gICAgLyoqKioqKi8gXHR9O1xuICAvKioqKioqL1xuICAvKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gIC8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gICAgLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuICAgICAgLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiAgICAgIC8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gICAgLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiAgICAvKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbiAgICAvKioqKioqLyBcdH07XG4gIC8qKioqKiovXG4gIC8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gIC8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuICAvKioqKioqL1xuICAvKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gIC8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbiAgLyoqKioqKi9cbiAgLyoqKioqKi9cbiAgLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiAgLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcbiAgLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuICAvKiAwICovXG4gIC8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG5hbWUgcHVtZWxvLmpzXG4gICAgICogQGRlc2NyaXB0aW9uIEphdmFTY3JpcHTlt6XlhbfnrrFcbiAgICAgKiBAYXV0aG9yIHhxTGlcbiAgICAgKi9cblxuICAgIG1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIF9fd2VicGFja19yZXF1aXJlX18oMSksXG4gICAgICBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpLFxuICAgICAgX193ZWJwYWNrX3JlcXVpcmVfXygzKSxcbiAgICApO1xuXG4gICAgLyoqKi8gfSksXG4gIC8qIDEgKi9cbiAgLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4gICAgLyoqXG4gICAgICogZmluZFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMuZmluZCA9IGZ1bmN0aW9uIChhcnIsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoYXJyID09IG51bGwgfHwgYXJyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRoaXMucHJpbnQoJ2FycmF5IGlzIG51bGwnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgX19ib29sZWFuX18gPSBjYWxsYmFjayhhcnJbaV0pO1xuICAgICAgICBpZiAoX19ib29sZWFuX18pIHtcbiAgICAgICAgICByZXR1cm4gYXJyW2ldXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBldmVyeVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMuZXZlcnkgPSBmdW5jdGlvbiAoYXJyLCBmbikge1xuICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgZm4oYXJyW2ldKTtcblxuICAgICAgICAvLyDpgYfliLDnrKzkuIDkuKrkuI3ljLnphY3mnaHku7bnmoTlhYPntKDml7blsLHlgZzmraLpgY3ljobmlbDnu4RcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHNvbWVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLnNvbWUgPSBmdW5jdGlvbiAoYXJyLCBmbikge1xuICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gZm4oYXJyW2ldKTtcbiAgICAgICAgaWYgKHJlc3VsdCkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBvbmNlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMub25jZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUgPyB2b2lkIDAgOiAoKGRvbmUgPSB0cnVlKSwgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzLmNvcHlBcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuY29uY2F0KClcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMuaHAgPSBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgICAgIHJldHVybiBvYmouaGFzT3duUHJvcGVydHkoa2V5KVxuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzLnR5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIGxldCB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG4gICAgICBpZiAodHlwZSA9PSAnW29iamVjdCBBcnJheV0nKSByZXR1cm4gJ2FycmF5JztcbiAgICAgIGlmICh0eXBlID09ICdbb2JqZWN0IE9iamVjdF0nKSByZXR1cm4gJ29iamVjdCc7XG4gICAgICByZXR1cm4gJ25vdCBvYmplY3QgdHlwZSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaXNPYmpcbiAgICAgKiBAcGFyYW0geyp9IG9ialxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLmlzT2JqID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMudHlwZW9mKG9iaikgPT09ICdvYmplY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlzQXJyYXlcbiAgICAgKiBAcGFyYW0geyp9IG9ialxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLmlzQXJyYXkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gdGhpcy50eXBlb2Yob2JqKSA9PT0gJ2FycmF5JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCB0aGUgZGlzdGluY3QgdmFsdWVzIG9mIGFuIGFycmF5LlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IC0gc291cmNlIGFycmF5XG4gICAgICogQHJldHVybnMge0FycmF5fSAtIG5ldyBhcnJheVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLmRpc3RpbmN0VmFsdWVzT2ZBcnJheSA9IChhcnIpID0+IFsuLi5uZXcgU2V0KGFycildO1xuXG4gICAgLyoqXG4gICAgICogTWVhc3VyZXMgdGhlIHRpbWUgdGFrZW4gYnkgYSBmdW5jdGlvbiB0byBleGVjdXRlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBtb2R1bGUuZXhwb3J0cy50aW1lVGFrZW4gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIGNvbnNvbGUudGltZSgndGltZVRha2VuJyk7XG4gICAgICBjb25zdCByID0gY2FsbGJhY2soKTtcbiAgICAgIGNvbnNvbGUudGltZUVuZCgndGltZVRha2VuJyk7XG4gICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnlJ/miJDpmo/mnLrpopzoibJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLnJhbmRvbUNvbG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IG4gPSAoKE1hdGgucmFuZG9tKCkgKiAweGZmZmZmKSB8IDApLnRvU3RyaW5nKDE2KTtcbiAgICAgIHJldHVybiAnIycgKyAobi5sZW5ndGggIT09IDYgPyAoKE1hdGgucmFuZG9tKCkgKiAweGYpIHwgMCkudG9TdHJpbmcoMTYpICsgbiA6IG4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOeUn+aIkOmaj+acuuWtl+espuS4slxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSAtIOmaj+acuuWtl+espuS4sumVv+W6plxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMucmFuZG9tU3RyaW5nID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgICAgdmFyIHN0ciA9IFwiXCI7XG4gICAgICB2YXIgbGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgdmFyIGFyciA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLFxuICAgICAgICAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLFxuICAgICAgICAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsXG4gICAgICAgICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JyxcbiAgICAgICAgJ3onLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLFxuICAgICAgICAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsXG4gICAgICAgICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ1xuICAgICAgXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcG9zID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGFyci5sZW5ndGggLSAxKSk7XG4gICAgICAgIHN0ciArPSBhcnJbcG9zXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IC0g6KKr5qOA5rWL55qE5a2X56ym5LiyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IC0g5qOA5rWL57G75Z6LXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMuY2hlY2tTdHJpbmdUeXBlID0gZnVuY3Rpb24gKHN0ciwgdHlwZSkge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICByZXR1cm4gL14oW2EtekEtWjAtOV8tXSkrQChbYS16QS1aMC05Xy1dKSsoLlthLXpBLVowLTlfLV0pKy8udGVzdChzdHIpO1xuICAgICAgICBjYXNlICdwaG9uZSc6XG4gICAgICAgICAgcmV0dXJuIC9eKCgoMTNbMC05XXsxfSl8KDE1WzAtOV17MX0pfCgxOFswLTldezF9KSkrXFxkezh9KSQvLnRlc3Qoc3RyKTtcbiAgICAgICAgY2FzZSAndGVsJzpcbiAgICAgICAgICByZXR1cm4gL14oMFxcZHsyLDN9LVxcZHs3LDh9KSgtXFxkezEsNH0pPyQvLnRlc3Qoc3RyKTtcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICByZXR1cm4gL15bMC05XSQvLnRlc3Qoc3RyKTtcbiAgICAgICAgY2FzZSAnbG93ZXInOlxuICAgICAgICAgIHJldHVybiAvXlthLXpdKyQvLnRlc3Qoc3RyKTtcbiAgICAgICAgY2FzZSAndXBwZXInOlxuICAgICAgICAgIHJldHVybiAvXltBLVpdKyQvLnRlc3Qoc3RyKTtcbiAgICAgICAgY2FzZSAnaXAnOlxuICAgICAgICAgIHJldHVybiAvXihcXGR7MSwyfXwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR7MSwyfXwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR7MSwyfXwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR7MSwyfXwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSQvLnRlc3Qoc3RyKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog55Sf5oiQ6ZqP5py65pWwLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSAtIOacgOWwj+WAvFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSAtIOacgOWkp+WAvFxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMucmFuZG9tTnVtID0gZnVuY3Rpb24gKE1pbiwgTWF4KSB7XG4gICAgICB2YXIgUmFuZ2UgPSBNYXggLSBNaW47XG4gICAgICB2YXIgUmFuZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgICByZXR1cm4gKE1pbiArIE1hdGgucm91bmQoUmFuZCAqIFJhbmdlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pWw57uE5o6S5bqPLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IC0gc291cmNlIGFycmF5XG4gICAgICogQHJldHVybnMge0FycmF5fSAtIG5ldyBhcnJheVxuICAgICAqL1xuICAgIG1vZHVsZS5leHBvcnRzLnF1aWNrU29ydCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDw9IDEpIHJldHVybiBhcnI7XG4gICAgICBsZXQgbWlkZGxlX251bWJlciA9IE1hdGguZmxvb3IoYXJyLmxlbmd0aCAvIDIpO1xuICAgICAgbGV0IHBpdm90ID0gYXJyLnNwbGljZShtaWRkbGVfbnVtYmVyLCAxKVswXTtcbiAgICAgIGxldCBsZWZ0TGlzdCA9IFtdO1xuICAgICAgbGV0IHJpZ2h0TGlzdCA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXSA8IHBpdm90KSB7XG4gICAgICAgICAgbGVmdExpc3QucHVzaChhcnJbaV0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmlnaHRMaXN0LnB1c2goYXJyW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5xdWlja1NvcnQobGVmdExpc3QpLmNvbmNhdChbcGl2b3RdLCB0aGlzLnF1aWNrU29ydChyaWdodExpc3QpKTtcbiAgICB9XG5cbiAgICAvKioqLyB9KSxcbiAgLyogMiAqL1xuICAvKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblxuXG4gICAgLyoqKi8gfSksXG4gIC8qIDMgKi9cbiAgLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4gICAgLyoqXG4gICAgICogQmFzZTY05Yqg5a+GXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGxldCBiYXNlNjQgPSBuZXcgcHVtZWxvLmJhc2U2NCgpO1xuICAgICAqIOWKoOWvhlxuICAgICAqIGJhc2U2NC5lbmNvZGUoXCJzb21lIHN0cmluZ1wiKTtcbiAgICAgKiDop6Plr4ZcbiAgICAgKiBiYXNlNjQuZGVjb2RlKGJhc2U2NC5lbmNvZGUoXCJzb21lIHN0cmluZ1wiKSk7XG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMuYmFzZTY0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBwcml2YXRlIHByb3BlcnR5XG4gICAgICBfa2V5U3RyID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xuXG4gICAgICAvLyBwdWJsaWMgbWV0aG9kIGZvciBlbmNvZGluZ1xuICAgICAgdGhpcy5lbmNvZGUgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9IFwiXCI7XG4gICAgICAgIHZhciBjaHIxLCBjaHIyLCBjaHIzLCBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0O1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGlucHV0ID0gX3V0ZjhfZW5jb2RlKGlucHV0KTtcbiAgICAgICAgd2hpbGUgKGkgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBjaHIxID0gaW5wdXQuY2hhckNvZGVBdChpKyspO1xuICAgICAgICAgIGNocjIgPSBpbnB1dC5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgICAgY2hyMyA9IGlucHV0LmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgICBlbmMxID0gY2hyMSA+PiAyO1xuICAgICAgICAgIGVuYzIgPSAoKGNocjEgJiAzKSA8PCA0KSB8IChjaHIyID4+IDQpO1xuICAgICAgICAgIGVuYzMgPSAoKGNocjIgJiAxNSkgPDwgMikgfCAoY2hyMyA+PiA2KTtcbiAgICAgICAgICBlbmM0ID0gY2hyMyAmIDYzO1xuICAgICAgICAgIGlmIChpc05hTihjaHIyKSkge1xuICAgICAgICAgICAgZW5jMyA9IGVuYzQgPSA2NDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKGNocjMpKSB7XG4gICAgICAgICAgICBlbmM0ID0gNjQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dHB1dCA9IG91dHB1dCArXG4gICAgICAgICAgICBfa2V5U3RyLmNoYXJBdChlbmMxKSArIF9rZXlTdHIuY2hhckF0KGVuYzIpICtcbiAgICAgICAgICAgIF9rZXlTdHIuY2hhckF0KGVuYzMpICsgX2tleVN0ci5jaGFyQXQoZW5jNCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gcHVibGljIG1ldGhvZCBmb3IgZGVjb2RpbmdcbiAgICAgIHRoaXMuZGVjb2RlID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSBcIlwiO1xuICAgICAgICB2YXIgY2hyMSwgY2hyMiwgY2hyMztcbiAgICAgICAgdmFyIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQ7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgXCJcIik7XG4gICAgICAgIHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgZW5jMSA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7XG4gICAgICAgICAgZW5jMiA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7XG4gICAgICAgICAgZW5jMyA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7XG4gICAgICAgICAgZW5jNCA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7XG4gICAgICAgICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgICAgICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgICAgICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG4gICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIxKTtcbiAgICAgICAgICBpZiAoZW5jMyAhPSA2NCkge1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVuYzQgIT0gNjQpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyMyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG91dHB1dCA9IF91dGY4X2RlY29kZShvdXRwdXQpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICAvLyBwcml2YXRlIG1ldGhvZCBmb3IgVVRGLTggZW5jb2RpbmdcbiAgICAgIF91dGY4X2VuY29kZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xcclxcbi9nLCBcIlxcblwiKTtcbiAgICAgICAgdmFyIHV0ZnRleHQgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHN0cmluZy5sZW5ndGg7IG4rKykge1xuICAgICAgICAgIHZhciBjID0gc3RyaW5nLmNoYXJDb2RlQXQobik7XG4gICAgICAgICAgaWYgKGMgPCAxMjgpIHtcbiAgICAgICAgICAgIHV0ZnRleHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKChjID4gMTI3KSAmJiAoYyA8IDIwNDgpKSB7XG4gICAgICAgICAgICB1dGZ0ZXh0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgPj4gNikgfCAxOTIpO1xuICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgNjMpIHwgMTI4KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRmdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDEyKSB8IDIyNCk7XG4gICAgICAgICAgICB1dGZ0ZXh0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjID4+IDYpICYgNjMpIHwgMTI4KTtcbiAgICAgICAgICAgIHV0ZnRleHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyAmIDYzKSB8IDEyOCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0ZnRleHQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kIGZvciBVVEYtOCBkZWNvZGluZ1xuICAgICAgX3V0ZjhfZGVjb2RlID0gZnVuY3Rpb24gKHV0ZnRleHQpIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IFwiXCI7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGMgPSBjMSA9IGMyID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB1dGZ0ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgIGMgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgaWYgKGMgPCAxMjgpIHtcbiAgICAgICAgICAgIHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoKGMgPiAxOTEpICYmIChjIDwgMjI0KSkge1xuICAgICAgICAgICAgYzIgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgc3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMzEpIDw8IDYpIHwgKGMyICYgNjMpKTtcbiAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYzIgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgICAgYzMgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSArIDIpO1xuICAgICAgICAgICAgc3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMTUpIDw8IDEyKSB8ICgoYzIgJiA2MykgPDwgNikgfCAoYzMgJiA2MykpO1xuICAgICAgICAgICAgaSArPSAzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ENeWKoOWvhu+8iE1lc3NhZ2UtRGlnZXN0IEFsZ29yaXRobSA1IO+8jyDmtojmga/mkZjopoHnrpfms5XvvIlcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqIEBleGFtcGxlXG4gICAgICogbGV0IG1kNSA9IG5ldyBwdW1lbG8ubWQ1KClcbiAgICAgKiDliqDlr4ZcbiAgICAgKiBtZDUuaGV4X21kNShcInNvbWUgc3RyaW5nXCIpXG4gICAgICovXG4gICAgbW9kdWxlLmV4cG9ydHMubWQ1ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGhleGNhc2UgPSAwO1xuICAgICAgdmFyIGI2NHBhZCA9IFwiXCI7XG4gICAgICB2YXIgY2hyc3ogPSA4O1xuXG4gICAgICB0aGlzLmhleF9tZDUgPSBmdW5jdGlvbiAocykge1xuICAgICAgICByZXR1cm4gYmlubDJoZXgoY29yZV9tZDUoc3RyMmJpbmwocyksIHMubGVuZ3RoICogY2hyc3opKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYjY0X21kNShzKSB7XG4gICAgICAgIHJldHVybiBiaW5sMmI2NChjb3JlX21kNShzdHIyYmlubChzKSwgcy5sZW5ndGggKiBjaHJzeikpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdHJfbWQ1KHMpIHtcbiAgICAgICAgcmV0dXJuIGJpbmwyc3RyKGNvcmVfbWQ1KHN0cjJiaW5sKHMpLCBzLmxlbmd0aCAqIGNocnN6KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhleF9obWFjX21kNShrZXksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGJpbmwyaGV4KGNvcmVfaG1hY19tZDUoa2V5LCBkYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGI2NF9obWFjX21kNShrZXksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGJpbmwyYjY0KGNvcmVfaG1hY19tZDUoa2V5LCBkYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHN0cl9obWFjX21kNShrZXksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGJpbmwyc3RyKGNvcmVfaG1hY19tZDUoa2V5LCBkYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV92bV90ZXN0KCkge1xuICAgICAgICByZXR1cm4gaGV4X21kNShcImFiY1wiKSA9PSBcIjkwMDE1MDk4M2NkMjRmYjBkNjk2M2Y3ZDI4ZTE3ZjcyXCI7XG4gICAgICB9XG5cblxuICAgICAgZnVuY3Rpb24gY29yZV9tZDUoeCwgbGVuKSB7XG4gICAgICAgIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgKChsZW4pICUgMzIpO1xuICAgICAgICB4WygoKGxlbiArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsZW47XG5cbiAgICAgICAgdmFyIGEgPSAxNzMyNTg0MTkzO1xuICAgICAgICB2YXIgYiA9IC0yNzE3MzM4Nzk7XG4gICAgICAgIHZhciBjID0gLTE3MzI1ODQxOTQ7XG4gICAgICAgIHZhciBkID0gMjcxNzMzODc4O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICAgICAgICB2YXIgb2xkYSA9IGE7XG4gICAgICAgICAgdmFyIG9sZGIgPSBiO1xuICAgICAgICAgIHZhciBvbGRjID0gYztcbiAgICAgICAgICB2YXIgb2xkZCA9IGQ7XG5cbiAgICAgICAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSArIDBdLCA3LCAtNjgwODc2OTM2KTtcbiAgICAgICAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSArIDFdLCAxMiwgLTM4OTU2NDU4Nik7XG4gICAgICAgICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2kgKyAyXSwgMTcsIDYwNjEwNTgxOSk7XG4gICAgICAgICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2kgKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcbiAgICAgICAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA3LCAtMTc2NDE4ODk3KTtcbiAgICAgICAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSArIDVdLCAxMiwgMTIwMDA4MDQyNik7XG4gICAgICAgICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTcsIC0xNDczMjMxMzQxKTtcbiAgICAgICAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSArIDddLCAyMiwgLTQ1NzA1OTgzKTtcbiAgICAgICAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSArIDhdLCA3LCAxNzcwMDM1NDE2KTtcbiAgICAgICAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSArIDldLCAxMiwgLTE5NTg0MTQ0MTcpO1xuICAgICAgICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNywgLTQyMDYzKTtcbiAgICAgICAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSArIDExXSwgMjIsIC0xOTkwNDA0MTYyKTtcbiAgICAgICAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSArIDEyXSwgNywgMTgwNDYwMzY4Mik7XG4gICAgICAgICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2kgKyAxM10sIDEyLCAtNDAzNDExMDEpO1xuICAgICAgICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpICsgMTRdLCAxNywgLTE1MDIwMDIyOTApO1xuICAgICAgICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpICsgMTVdLCAyMiwgMTIzNjUzNTMyOSk7XG5cbiAgICAgICAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSArIDFdLCA1LCAtMTY1Nzk2NTEwKTtcbiAgICAgICAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSArIDZdLCA5LCAtMTA2OTUwMTYzMik7XG4gICAgICAgICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2kgKyAxMV0sIDE0LCA2NDM3MTc3MTMpO1xuICAgICAgICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpICsgMF0sIDIwLCAtMzczODk3MzAyKTtcbiAgICAgICAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSArIDVdLCA1LCAtNzAxNTU4NjkxKTtcbiAgICAgICAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSArIDEwXSwgOSwgMzgwMTYwODMpO1xuICAgICAgICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XG4gICAgICAgICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2kgKyA0XSwgMjAsIC00MDU1Mzc4NDgpO1xuICAgICAgICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpICsgOV0sIDUsIDU2ODQ0NjQzOCk7XG4gICAgICAgICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2kgKyAxNF0sIDksIC0xMDE5ODAzNjkwKTtcbiAgICAgICAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSArIDNdLCAxNCwgLTE4NzM2Mzk2MSk7XG4gICAgICAgICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2kgKyA4XSwgMjAsIDExNjM1MzE1MDEpO1xuICAgICAgICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpICsgMTNdLCA1LCAtMTQ0NDY4MTQ2Nyk7XG4gICAgICAgICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2kgKyAyXSwgOSwgLTUxNDAzNzg0KTtcbiAgICAgICAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSArIDddLCAxNCwgMTczNTMyODQ3Myk7XG4gICAgICAgICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2kgKyAxMl0sIDIwLCAtMTkyNjYwNzczNCk7XG5cbiAgICAgICAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSArIDVdLCA0LCAtMzc4NTU4KTtcbiAgICAgICAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSArIDhdLCAxMSwgLTIwMjI1NzQ0NjMpO1xuICAgICAgICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpICsgMTFdLCAxNiwgMTgzOTAzMDU2Mik7XG4gICAgICAgICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2kgKyAxNF0sIDIzLCAtMzUzMDk1NTYpO1xuICAgICAgICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpICsgMV0sIDQsIC0xNTMwOTkyMDYwKTtcbiAgICAgICAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSArIDRdLCAxMSwgMTI3Mjg5MzM1Myk7XG4gICAgICAgICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xuICAgICAgICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpICsgMTBdLCAyMywgLTEwOTQ3MzA2NDApO1xuICAgICAgICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpICsgMTNdLCA0LCA2ODEyNzkxNzQpO1xuICAgICAgICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpICsgMF0sIDExLCAtMzU4NTM3MjIyKTtcbiAgICAgICAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSArIDNdLCAxNiwgLTcyMjUyMTk3OSk7XG4gICAgICAgICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2kgKyA2XSwgMjMsIDc2MDI5MTg5KTtcbiAgICAgICAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSArIDldLCA0LCAtNjQwMzY0NDg3KTtcbiAgICAgICAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSArIDEyXSwgMTEsIC00MjE4MTU4MzUpO1xuICAgICAgICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNiwgNTMwNzQyNTIwKTtcbiAgICAgICAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSArIDJdLCAyMywgLTk5NTMzODY1MSk7XG5cbiAgICAgICAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSArIDBdLCA2LCAtMTk4NjMwODQ0KTtcbiAgICAgICAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSArIDddLCAxMCwgMTEyNjg5MTQxNSk7XG4gICAgICAgICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2kgKyAxNF0sIDE1LCAtMTQxNjM1NDkwNSk7XG4gICAgICAgICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2kgKyA1XSwgMjEsIC01NzQzNDA1NSk7XG4gICAgICAgICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDYsIDE3MDA0ODU1NzEpO1xuICAgICAgICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpICsgM10sIDEwLCAtMTg5NDk4NjYwNik7XG4gICAgICAgICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2kgKyAxMF0sIDE1LCAtMTA1MTUyMyk7XG4gICAgICAgICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2kgKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcbiAgICAgICAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSArIDhdLCA2LCAxODczMzEzMzU5KTtcbiAgICAgICAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSArIDE1XSwgMTAsIC0zMDYxMTc0NCk7XG4gICAgICAgICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcbiAgICAgICAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSArIDEzXSwgMjEsIDEzMDkxNTE2NDkpO1xuICAgICAgICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpICsgNF0sIDYsIC0xNDU1MjMwNzApO1xuICAgICAgICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpICsgMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xuICAgICAgICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpICsgMl0sIDE1LCA3MTg3ODcyNTkpO1xuICAgICAgICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpICsgOV0sIDIxLCAtMzQzNDg1NTUxKTtcblxuICAgICAgICAgIGEgPSBzYWZlX2FkZChhLCBvbGRhKTtcbiAgICAgICAgICBiID0gc2FmZV9hZGQoYiwgb2xkYik7XG4gICAgICAgICAgYyA9IHNhZmVfYWRkKGMsIG9sZGMpO1xuICAgICAgICAgIGQgPSBzYWZlX2FkZChkLCBvbGRkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXkoYSwgYiwgYywgZCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbWQ1X2NtbihxLCBhLCBiLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBzYWZlX2FkZChiaXRfcm9sKHNhZmVfYWRkKHNhZmVfYWRkKGEsIHEpLCBzYWZlX2FkZCh4LCB0KSksIHMpLCBiKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbWQ1X2ZmKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcbiAgICAgICAgcmV0dXJuIG1kNV9jbW4oKGIgJiBjKSB8ICgofmIpICYgZCksIGEsIGIsIHgsIHMsIHQpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtZDVfZ2coYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICAgICAgICByZXR1cm4gbWQ1X2NtbigoYiAmIGQpIHwgKGMgJiAofmQpKSwgYSwgYiwgeCwgcywgdCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9oaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBtZDVfY21uKGIgXiBjIF4gZCwgYSwgYiwgeCwgcywgdCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1kNV9paShhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gICAgICAgIHJldHVybiBtZDVfY21uKGMgXiAoYiB8ICh+ZCkpLCBhLCBiLCB4LCBzLCB0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY29yZV9obWFjX21kNShrZXksIGRhdGEpIHtcbiAgICAgICAgdmFyIGJrZXkgPSBzdHIyYmlubChrZXkpO1xuICAgICAgICBpZiAoYmtleS5sZW5ndGggPiAxNikgYmtleSA9IGNvcmVfbWQ1KGJrZXksIGtleS5sZW5ndGggKiBjaHJzeik7XG5cbiAgICAgICAgdmFyIGlwYWQgPSBBcnJheSgxNiksXG4gICAgICAgICAgb3BhZCA9IEFycmF5KDE2KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgICAgaXBhZFtpXSA9IGJrZXlbaV0gXiAweDM2MzYzNjM2O1xuICAgICAgICAgIG9wYWRbaV0gPSBia2V5W2ldIF4gMHg1QzVDNUM1QztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNoID0gY29yZV9tZDUoaXBhZC5jb25jYXQoc3RyMmJpbmwoZGF0YSkpLCA1MTIgKyBkYXRhLmxlbmd0aCAqIGNocnN6KTtcbiAgICAgICAgcmV0dXJuIGNvcmVfbWQ1KG9wYWQuY29uY2F0KGhhc2gpLCA1MTIgKyAxMjgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzYWZlX2FkZCh4LCB5KSB7XG4gICAgICAgIHZhciBsc3cgPSAoeCAmIDB4RkZGRikgKyAoeSAmIDB4RkZGRik7XG4gICAgICAgIHZhciBtc3cgPSAoeCA+PiAxNikgKyAoeSA+PiAxNikgKyAobHN3ID4+IDE2KTtcbiAgICAgICAgcmV0dXJuIChtc3cgPDwgMTYpIHwgKGxzdyAmIDB4RkZGRik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJpdF9yb2wobnVtLCBjbnQpIHtcbiAgICAgICAgcmV0dXJuIChudW0gPDwgY250KSB8IChudW0gPj4+ICgzMiAtIGNudCkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdHIyYmlubChzdHIpIHtcbiAgICAgICAgdmFyIGJpbiA9IEFycmF5KCk7XG4gICAgICAgIHZhciBtYXNrID0gKDEgPDwgY2hyc3opIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoICogY2hyc3o7IGkgKz0gY2hyc3opXG4gICAgICAgICAgYmluW2kgPj4gNV0gfD0gKHN0ci5jaGFyQ29kZUF0KGkgLyBjaHJzeikgJiBtYXNrKSA8PCAoaSAlIDMyKTtcbiAgICAgICAgcmV0dXJuIGJpbjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYmlubDJzdHIoYmluKSB7XG4gICAgICAgIHZhciBzdHIgPSBcIlwiO1xuICAgICAgICB2YXIgbWFzayA9ICgxIDw8IGNocnN6KSAtIDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmluLmxlbmd0aCAqIDMyOyBpICs9IGNocnN6KVxuICAgICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChiaW5baSA+PiA1XSA+Pj4gKGkgJSAzMikpICYgbWFzayk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJpbmwyaGV4KGJpbmFycmF5KSB7XG4gICAgICAgIHZhciBoZXhfdGFiID0gaGV4Y2FzZSA/IFwiMDEyMzQ1Njc4OUFCQ0RFRlwiIDogXCIwMTIzNDU2Nzg5YWJjZGVmXCI7XG4gICAgICAgIHZhciBzdHIgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmFycmF5Lmxlbmd0aCAqIDQ7IGkrKykge1xuICAgICAgICAgIHN0ciArPSBoZXhfdGFiLmNoYXJBdCgoYmluYXJyYXlbaSA+PiAyXSA+PiAoKGkgJSA0KSAqIDggKyA0KSkgJiAweEYpICtcbiAgICAgICAgICAgIGhleF90YWIuY2hhckF0KChiaW5hcnJheVtpID4+IDJdID4+ICgoaSAlIDQpICogOCkpICYgMHhGKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBiaW5sMmI2NChiaW5hcnJheSkge1xuICAgICAgICB2YXIgdGFiID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCI7XG4gICAgICAgIHZhciBzdHIgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmFycmF5Lmxlbmd0aCAqIDQ7IGkgKz0gMykge1xuICAgICAgICAgIHZhciB0cmlwbGV0ID0gKCgoYmluYXJyYXlbaSA+PiAyXSA+PiA4ICogKGkgJSA0KSkgJiAweEZGKSA8PCAxNikgfFxuICAgICAgICAgICAgKCgoYmluYXJyYXlbaSArIDEgPj4gMl0gPj4gOCAqICgoaSArIDEpICUgNCkpICYgMHhGRikgPDwgOCkgfFxuICAgICAgICAgICAgKChiaW5hcnJheVtpICsgMiA+PiAyXSA+PiA4ICogKChpICsgMikgJSA0KSkgJiAweEZGKTtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgICAgaWYgKGkgKiA4ICsgaiAqIDYgPiBiaW5hcnJheS5sZW5ndGggKiAzMikgc3RyICs9IGI2NHBhZDtcbiAgICAgICAgICAgIGVsc2Ugc3RyICs9IHRhYi5jaGFyQXQoKHRyaXBsZXQgPj4gNiAqICgzIC0gaikpICYgMHgzRik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2hhMeWKoOWvhu+8iFNlY3VyZSBIYXNoIEFsZ29yaXRobSDvvI8g5a6J5YWo5ZOI5biM566X5rOV77yJXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGxldCBzaGExID0gbmV3IHB1bWVsby5zaGExKClcbiAgICAgKiDliqDlr4ZcbiAgICAgKiBzaGExLmhleF9zaGExKFwic29tZSBzdHJpbmdcIilcbiAgICAgKi9cbiAgICBtb2R1bGUuZXhwb3J0cy5zaGExID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGhleGNhc2UgPSAwO1xuICAgICAgdmFyIGI2NHBhZCA9IFwiXCI7XG4gICAgICB2YXIgY2hyc3ogPSA4O1xuXG4gICAgICB0aGlzLmhleF9zaGExID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIGJpbmIyaGV4KGNvcmVfc2hhMShzdHIyYmluYihzKSwgcy5sZW5ndGggKiBjaHJzeikpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBiNjRfc2hhMShzKSB7XG4gICAgICAgIHJldHVybiBiaW5iMmI2NChjb3JlX3NoYTEoc3RyMmJpbmIocyksIHMubGVuZ3RoICogY2hyc3opKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc3RyX3NoYTEocykge1xuICAgICAgICByZXR1cm4gYmluYjJzdHIoY29yZV9zaGExKHN0cjJiaW5iKHMpLCBzLmxlbmd0aCAqIGNocnN6KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhleF9obWFjX3NoYTEoa2V5LCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBiaW5iMmhleChjb3JlX2htYWNfc2hhMShrZXksIGRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYjY0X2htYWNfc2hhMShrZXksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGJpbmIyYjY0KGNvcmVfaG1hY19zaGExKGtleSwgZGF0YSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdHJfaG1hY19zaGExKGtleSwgZGF0YSkge1xuICAgICAgICByZXR1cm4gYmluYjJzdHIoY29yZV9obWFjX3NoYTEoa2V5LCBkYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNoYTFfdm1fdGVzdCgpIHtcbiAgICAgICAgcmV0dXJuIGhleF9zaGExKFwiYWJjXCIpID09IFwiYTk5OTNlMzY0NzA2ODE2YWJhM2UyNTcxNzg1MGMyNmM5Y2QwZDg5ZFwiO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjb3JlX3NoYTEoeCwgbGVuKSB7XG4gICAgICAgIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbGVuICUgMzIpO1xuICAgICAgICB4WygobGVuICsgNjQgPj4gOSkgPDwgNCkgKyAxNV0gPSBsZW47XG5cbiAgICAgICAgdmFyIHcgPSBBcnJheSg4MCk7XG4gICAgICAgIHZhciBhID0gMTczMjU4NDE5MztcbiAgICAgICAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICAgICAgICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICAgICAgICB2YXIgZCA9IDI3MTczMzg3ODtcbiAgICAgICAgdmFyIGUgPSAtMTAwOTU4OTc3NjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgICAgICAgdmFyIG9sZGEgPSBhO1xuICAgICAgICAgIHZhciBvbGRiID0gYjtcbiAgICAgICAgICB2YXIgb2xkYyA9IGM7XG4gICAgICAgICAgdmFyIG9sZGQgPSBkO1xuICAgICAgICAgIHZhciBvbGRlID0gZTtcblxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgODA7IGorKykge1xuICAgICAgICAgICAgaWYgKGogPCAxNikgd1tqXSA9IHhbaSArIGpdO1xuICAgICAgICAgICAgZWxzZSB3W2pdID0gcm9sKHdbaiAtIDNdIF4gd1tqIC0gOF0gXiB3W2ogLSAxNF0gXiB3W2ogLSAxNl0sIDEpO1xuICAgICAgICAgICAgdmFyIHQgPSBzYWZlX2FkZChzYWZlX2FkZChyb2woYSwgNSksIHNoYTFfZnQoaiwgYiwgYywgZCkpLCBzYWZlX2FkZChzYWZlX2FkZChlLCB3W2pdKSwgc2hhMV9rdChqKSkpO1xuICAgICAgICAgICAgZSA9IGQ7XG4gICAgICAgICAgICBkID0gYztcbiAgICAgICAgICAgIGMgPSByb2woYiwgMzApO1xuICAgICAgICAgICAgYiA9IGE7XG4gICAgICAgICAgICBhID0gdDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhID0gc2FmZV9hZGQoYSwgb2xkYSk7XG4gICAgICAgICAgYiA9IHNhZmVfYWRkKGIsIG9sZGIpO1xuICAgICAgICAgIGMgPSBzYWZlX2FkZChjLCBvbGRjKTtcbiAgICAgICAgICBkID0gc2FmZV9hZGQoZCwgb2xkZCk7XG4gICAgICAgICAgZSA9IHNhZmVfYWRkKGUsIG9sZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheShhLCBiLCBjLCBkLCBlKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGExX2Z0KHQsIGIsIGMsIGQpIHtcbiAgICAgICAgaWYgKHQgPCAyMCkgcmV0dXJuIChiICYgYykgfCAoKH5iKSAmIGQpO1xuICAgICAgICBpZiAodCA8IDQwKSByZXR1cm4gYiBeIGMgXiBkO1xuICAgICAgICBpZiAodCA8IDYwKSByZXR1cm4gKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpO1xuICAgICAgICByZXR1cm4gYiBeIGMgXiBkO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaGExX2t0KHQpIHtcbiAgICAgICAgcmV0dXJuICh0IDwgMjApID8gMTUxODUwMDI0OSA6ICh0IDwgNDApID8gMTg1OTc3NTM5MyA6ICh0IDwgNjApID8gLTE4OTQwMDc1ODggOiAtODk5NDk3NTE0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjb3JlX2htYWNfc2hhMShrZXksIGRhdGEpIHtcbiAgICAgICAgdmFyIGJrZXkgPSBzdHIyYmluYihrZXkpO1xuICAgICAgICBpZiAoYmtleS5sZW5ndGggPiAxNikgYmtleSA9IGNvcmVfc2hhMShia2V5LCBrZXkubGVuZ3RoICogY2hyc3opO1xuXG4gICAgICAgIHZhciBpcGFkID0gQXJyYXkoMTYpLFxuICAgICAgICAgIG9wYWQgPSBBcnJheSgxNik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgICAgIGlwYWRbaV0gPSBia2V5W2ldIF4gMHgzNjM2MzYzNjtcbiAgICAgICAgICBvcGFkW2ldID0gYmtleVtpXSBeIDB4NUM1QzVDNUM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGFzaCA9IGNvcmVfc2hhMShpcGFkLmNvbmNhdChzdHIyYmluYihkYXRhKSksIDUxMiArIGRhdGEubGVuZ3RoICogY2hyc3opO1xuICAgICAgICByZXR1cm4gY29yZV9zaGExKG9wYWQuY29uY2F0KGhhc2gpLCA1MTIgKyAxNjApO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzYWZlX2FkZCh4LCB5KSB7XG4gICAgICAgIHZhciBsc3cgPSAoeCAmIDB4RkZGRikgKyAoeSAmIDB4RkZGRik7XG4gICAgICAgIHZhciBtc3cgPSAoeCA+PiAxNikgKyAoeSA+PiAxNikgKyAobHN3ID4+IDE2KTtcbiAgICAgICAgcmV0dXJuIChtc3cgPDwgMTYpIHwgKGxzdyAmIDB4RkZGRik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJvbChudW0sIGNudCkge1xuICAgICAgICByZXR1cm4gKG51bSA8PCBjbnQpIHwgKG51bSA+Pj4gKDMyIC0gY250KSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHN0cjJiaW5iKHN0cikge1xuICAgICAgICB2YXIgYmluID0gQXJyYXkoKTtcbiAgICAgICAgdmFyIG1hc2sgPSAoMSA8PCBjaHJzeikgLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGggKiBjaHJzejsgaSArPSBjaHJzeilcbiAgICAgICAgICBiaW5baSA+PiA1XSB8PSAoc3RyLmNoYXJDb2RlQXQoaSAvIGNocnN6KSAmIG1hc2spIDw8ICgyNCAtIGkgJSAzMik7XG4gICAgICAgIHJldHVybiBiaW47XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJpbmIyc3RyKGJpbikge1xuICAgICAgICB2YXIgc3RyID0gXCJcIjtcbiAgICAgICAgdmFyIG1hc2sgPSAoMSA8PCBjaHJzeikgLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbi5sZW5ndGggKiAzMjsgaSArPSBjaHJzeilcbiAgICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYmluW2kgPj4gNV0gPj4+ICgyNCAtIGkgJSAzMikpICYgbWFzayk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJpbmIyaGV4KGJpbmFycmF5KSB7XG4gICAgICAgIHZhciBoZXhfdGFiID0gaGV4Y2FzZSA/IFwiMDEyMzQ1Njc4OUFCQ0RFRlwiIDogXCIwMTIzNDU2Nzg5YWJjZGVmXCI7XG4gICAgICAgIHZhciBzdHIgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmFycmF5Lmxlbmd0aCAqIDQ7IGkrKykge1xuICAgICAgICAgIHN0ciArPSBoZXhfdGFiLmNoYXJBdCgoYmluYXJyYXlbaSA+PiAyXSA+PiAoKDMgLSBpICUgNCkgKiA4ICsgNCkpICYgMHhGKSArIGhleF90YWIuY2hhckF0KChiaW5hcnJheVtpID4+IDJdID4+ICgoMyAtIGkgJSA0KSAqIDgpKSAmIDB4Rik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYmluYjJiNjQoYmluYXJyYXkpIHtcbiAgICAgICAgdmFyIHRhYiA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiO1xuICAgICAgICB2YXIgc3RyID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaW5hcnJheS5sZW5ndGggKiA0OyBpICs9IDMpIHtcbiAgICAgICAgICB2YXIgdHJpcGxldCA9ICgoKGJpbmFycmF5W2kgPj4gMl0gPj4gOCAqICgzIC0gaSAlIDQpKSAmIDB4RkYpIDw8IDE2KSB8ICgoKGJpbmFycmF5W2kgKyAxID4+IDJdID4+IDggKiAoMyAtIChpICsgMSkgJSA0KSkgJiAweEZGKSA8PCA4KSB8ICgoYmluYXJyYXlbaSArIDIgPj4gMl0gPj4gOCAqICgzIC0gKGkgKyAyKSAlIDQpKSAmIDB4RkYpO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoaSAqIDggKyBqICogNiA+IGJpbmFycmF5Lmxlbmd0aCAqIDMyKSBzdHIgKz0gYjY0cGFkO1xuICAgICAgICAgICAgZWxzZSBzdHIgKz0gdGFiLmNoYXJBdCgodHJpcGxldCA+PiA2ICogKDMgLSBqKSkgJiAweDNGKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKioqLyB9KVxuICAvKioqKioqLyBdKTsiLCIkKGZ1bmN0aW9uICgpIHtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykuYWpheEZvcm0oe1xuICAgICAgICAnc3VjY2Vzcyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlNhdmVkXCIpO1xuICAgICAgICB9LFxuICAgICAgICAnZXJyb3InOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNhZGQtY3VzdG9tXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjY3VzdG9tLXNldHRpbmdzXCIpLmFwcGVuZCgkKCQodGhpcykuYXR0cihcInJlbFwiKSkuaHRtbCgpKTtcbiAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRG9tKCk7XG4gICAgfSk7XG4gICAgJChcIiNhZGQtbmF2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjbmF2aWdhdG9yc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuXG4gICAgfSk7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLm9uKFwiY2xpY2tcIiwgXCIuZGVsLW5hdlwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKSk7XG4gICAgICAgIHZhciBpdGVtID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKVxuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiRGVsZXRlIHRoaXMgaXRlbT9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykub24oXCJjbGlja1wiLCBcIi5kZWwtY3VzdG9tXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KClcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW0/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KVxuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgbmV3IEZvcm1WYWxpZGF0b3IoXCJzaWdudXAtZm9ybVwiLCBbXG4gICAgICAgIHtcIm5hbWVcIjogXCJuYW1lXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZFwifSxcbiAgICAgICAge1wibmFtZVwiOiBcImVtYWlsXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZFwifSxcbiAgICAgICAge1wibmFtZVwiOiBcInBhc3N3b3JkXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZHxtaW5fbGVuZ3RoWzRdfG1heF9sZW5ndGhbMjBdXCJ9XG4gICAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcihcIkVycm9yOiBcIiArIGVycm9yc1swXS5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkKCcjc2lnbnVwLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9cIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSlcbn0pO1xuIiwiZnVuY3Rpb24gZWRpdG9yQWN0aW9uKGpzb24pIHtcbiAgICB2YXIgY20gPSAkKCcuQ29kZU1pcnJvcicpWzBdLkNvZGVNaXJyb3I7XG4gICAgdmFyIGRvYyA9IGNtLmdldERvYygpO1xuICAgIGRvYy5yZXBsYWNlU2VsZWN0aW9ucyhbXCIhW10oL1wiICsganNvbi5maWxlLnVybCArIFwiKVwiXSk7XG59XG5cbmZ1bmN0aW9uIGZpbGVzQWN0aW9uKGpzb24pIHtcbiAgICB2YXIgJGZpbGVMaW5lID0gJCgnPHRyIGlkPVwiZmlsZS0nICsganNvbi5maWxlLm5hbWUgKyAnXCI+JyBcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS50aW1lICsgJzwvdGQ+J1xuICAgICAgICAvLyArICc8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj4nICsganNvbi5maWxlLnNpemUgKyAnPC90ZD4nXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUubmFtZSArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+J1xuICAgICAgICAgICsgJzxpbWcgY2xhc3M9XCJhZG1pbi10aHVtYm5haWxcIiBzcmM9XCIvJyArIGpzb24uZmlsZS51cmwgKyAnXCIgYWx0PVwiXCI+J1xuICAgICAgICArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS50eXBlICsgJzwvdGQ+J1xuICAgICAgICArYCA8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj5cbiAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJkaWctc2VsZWN0XCIgaWQ9XCIke2pzb24uZmlsZS5pZH1cIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiAke2pzb24uaXNfc2hvd19vbl9nYWxsZXJ5ID8gJ3NlbGVjdGVkJyAgOiAnJ30gdmFsdWUgPVwidHJ1ZVwiPnRydWU8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiAke2pzb24uaXNfc2hvd19vbl9nYWxsZXJ5ID8gJycgIDogJ3NlbGVjdGVkJ30gdmFsdWUgPVwiZmFsc2VcIj5mYWxzZTwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvdGQ+YFxuXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPidcbiAgICAgICAgICArICc8YSBjbGFzcz1cImJ0biBidG4tc21hbGwgYmx1ZVwiIGhyZWY9XCIvJysganNvbi5maWxlLnVybCArJ1wiIHRhcmdldD1cIl9ibGFua1wiIHRpdGxlPVwiLycgKyBqc29uLmZpbGUubmFtZSArICdcIj5WaWV3PC9hPiZuYnNwOydcbiAgICAgICAgICArICc8YSBjbGFzcz1cImJ0biBidG4tc21hbGwgcmVkIGRlbGV0ZS1maWxlXCIgaHJlZj1cIiNcIiBuYW1lPVwiJyArIGpzb24uZmlsZS5uYW1lICsgJ1wiIHJlbD1cIicgKyBqc29uLmZpbGUudXJsICsgJ1wiIHRpdGxlPVwiRGVsZXRlXCI+RGVsZXRlPC9hPidcbiAgICAgICAgKyAnPC90ZD48L3RyPicpO1xuICAgICQoJ3Rib2R5JykucHJlcGVuZCgkZmlsZUxpbmUpO1xuICAgIHdpbmRvdy5saXN0ZW5EaWdTZWxlY3RFdmVudCgpXG59XG5cbmZ1bmN0aW9uIGluaXRVcGxvYWQocCkge1xuICAgICQoJyNhdHRhY2gtc2hvdycpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNhdHRhY2gtdXBsb2FkJykudHJpZ2dlcihcImNsaWNrXCIpO1xuICAgIH0pO1xuICAgICQoJyNhdHRhY2gtdXBsb2FkJykub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiVXBsb2FkIG5vdz9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYmFyID0gJCgnPHAgY2xhc3M9XCJmaWxlLXByb2dyZXNzIGlubGluZS1ibG9ja1wiPjAlPC9wPicpO1xuICAgICAgICAgICAgJCgnI2F0dGFjaC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICAgICAgICAgICAgXCJiZWZvcmVTdWJtaXRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHApLmJlZm9yZShiYXIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJ1cGxvYWRQcm9ncmVzc1wiOiBmdW5jdGlvbiAoZXZlbnQsIHBvc2l0aW9uLCB0b3RhbCwgcGVyY2VudENvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50VmFsID0gcGVyY2VudENvbXBsZXRlICsgJyUnO1xuICAgICAgICAgICAgICAgICAgICBiYXIuY3NzKFwid2lkdGhcIiwgcGVyY2VudFZhbCkuaHRtbChwZXJjZW50VmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnZhbChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhci5odG1sKGpzb24ubXNnKS5hZGRDbGFzcyhcImVyclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJGaWxlIGhhcyBiZWVuIHVwbG9hZGVkLlwiKVxuICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChcIi9cIiArIGpzb24uZmlsZS51cmwgKyBcIiZuYnNwOyZuYnNwOyZuYnNwOyhAXCIgKyBqc29uLmZpbGUubmFtZSArIFwiKVwiKTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoJCgnLkNvZGVNaXJyb3InKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNBY3Rpb24oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JBY3Rpb24oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbChcIlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iXX0=
