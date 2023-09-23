// ./QUnit/index.php
// ./QUnit/common.TOOLS.math.QUnitTest.html
// ./QUnit/common.TOOLS.string.QUnitTest.html
var TOOLS = (function() {
	var exports = {};

	// 文字列操作関連
	// (今のところ)サロゲートペア文字対応向け
	exports.string = {};

	/**
	 * (サロゲートペア数ではなく)文字数を返します
	 */
	exports.string.length = function(str) {
		str += "";
		var len = 0;
		for (var i = 0; i < str.length; i++) {
			len++;
			var code = str.charCodeAt(i);
			if (0xD800 <= code && code <= 0xDBFF) {
				i++;
			}
		}
		return len;
	};

	/**
	 * UTF-8のバイト数を返します
	 */
	exports.string.countUtf8byte = function(str) {
		str += "";
		var utf8byte = 0;
		for (var i = 0; i < str.length; i++) {
			var code = str.charCodeAt(i);

			if (code <= 0x007F) {
				utf8byte += 1;
			} else if (code <= 0x07FF || 0xD800 <= code && code <= 0xDFFF) {
				utf8byte += 2;
			} else if (code <= 0xFFFF) {
				utf8byte += 3;
			} else {
				throw new Error("codeが想定外の値でした");
			}
		}
		return utf8byte;
	};

	/**
	 * 指定された文字のUTF-8のコード値をバイト配列で返します
	 */
	exports.string.getUtf8Code = function(str) {
		let encoder = new TextEncoder();
		let uint8Array = encoder.encode(str);
		return uint8Array;
	};

	/**
	 * 指定された文字のUTF-8のコード値をバイト配列で返します
	 * 1文字ごとにバイト配列を作り、バイト配列の配列の形式で返します
	 */
	exports.string.getUtf8Codes = function(str) {
		var charArray = exports.string.str2charArray(str);
		var arr = [];
		charArray.forEach(c => {
			arr.push(exports.string.getUtf8Code(c));
		})
		return arr;
	};


	/**
	 * 文字列を指定された文字数ごとに分割した配列を返します
	 */
	exports.string.split = function(str, len) {
		len = len || 1;

		var baseArr = exports.string.str2charArray(str);
		str += "";
		var arr = [];
		while (baseArr.length) {
			arr.push(baseArr.splice(0, len).join(""));
		}
		return arr;
	};

	/**
	 * 文字列を1文字ずつの配列にして返します
	 */
	exports.string.str2charArray = function(str) {
		var charArray = [];
		for (var i = 0; i < str.length; i++) {
			var char = str[i];
			var code = str.charCodeAt(i);
			if (0xD800 <= code && code <= 0xDBFF) {
				i++;
				char += str[i];
			}
			charArray.push(char);
		}
		return charArray;
	};

	/**
	 * 文字列の幅をカウントします。
	 * ASCII文字及び半角カナを1、それ以外の文字を2とカウントします。
	 */
	exports.string.stringWidth = function(str) {
		var stringWidth = 0;
		for (var i = 0; i < str.length; i++) {
			var code = str.charCodeAt(i);
			if ((0x0 <= code && code <= 0x7F) || (0xFF61 <= code && code <= 0xFF9F)) {
				// UTF-16のASCIIと半角カナの範囲
				stringWidth += 1;
			} else if (0xD800 <= code && code <= 0xDBFF) {
				// サロゲートペアの範囲
				stringWidth += 2;
				i++;
			} else {
				// 「ASCIIと半角カナとサロゲートペア」以外
				stringWidth += 2;
			}
		}
		return stringWidth;
	};

	/**
	 * 文字列が指定の長さを超えていた場合切り捨てます。
	 * ASCII文字及び半角カナを1、それ以外の文字を2とカウントします。
	 */
	exports.string.truncate = function(str, maxWidth) {
		var width = 0;
		var result = "";
		for (var i = 0; i < str.length; i++) {

			var code = str.charCodeAt(i);
			var currentChar = str[i];
			var currentWidth;

			if ((0x0 <= code && code <= 0x7F) || (0xFF61 <= code && code <= 0xFF9F)) {
				// UTF-16のASCIIと半角カナの範囲
				currentWidth = 1;
			} else if (0xD800 <= code && code <= 0xDBFF) {
				// サロゲートペアの範囲
				i++;
				currentChar += str[i];
				currentWidth = 2;
			} else {
				// 「ASCIIと半角カナとサロゲートペア」以外。主にひらがなや漢字。
				currentWidth = 2;
			}

			// 
			if (width + currentWidth > maxWidth) {
				result += "…";
				break;
			}
			result += currentChar;
			width += currentWidth;

		}
		return result;
	};

	/**
	 * 連続的な置換をします
	 */
	exports.string.replaces = function(str, obj) {
		for (var key in obj) {
			str = str.replace(key, obj[key]);
		}
		return str;
	};

	// フォーマット関連
	exports.format = {};

	/**
	 * 数値をカンマ区切り形式に変換します
	 */
	exports.format.addComma = function(val) {
		if (val === "" || isNaN(val)) {
			return val;
		}
		val = Math.round(val);
		return ("" + val).replace(/(\d)(?=(\d\d\d)+$)/g, "$1,");
	};

	/**
	 * 数値を16進数形式に変換します
	 */
	exports.format.toHex = function(val, len) {
		if (val === "" || isNaN(val)) {
			return val;
		}
		if (len == "" || isNaN(len)) {
			return val;
		}
		val = val - 0;
		var str = val.toString(16).toUpperCase();

		if (len === undefined || len === null) {
			len = 0;
		}
		if (str.length < len) {
			str = exports.format.lpad(str, len, "0");
		}
		return str;
	};


	/**
	 * 秒数を「時分秒」の文字列に変換します
	 */
	exports.format.toHms = function(t) {
		var hms = "";
		var h = t / 3600 | 0;
		var m = t % 3600 / 60 | 0;
		var s = Math.round(t % 60);

		if (h != 0) {
			hms = h + "時間" + exports.format.zeroPad(m, 2) + "分" + exports.format.zeroPad(s, 2) + "秒";
		} else if (m != 0) {
			hms = m + "分" + exports.format.zeroPad(s, 2) + "秒";
		} else {
			hms = s + "秒";
		}

		return hms;
	};

	/**
	 * 秒数を「年日時分秒」の文字列に変換します
	 */
	exports.format.toYdhms = function(t) {
		var ydhms = "";
		var y = t / 31536000 | 0;
		var d = t % 31536000 / 86400 | 0;
		var h = t % 86400 / 3600 | 0;
		var m = t % 3600 / 60 | 0;
		var s = Math.round(t % 60);

		if (y != 0) {
			ydhms = y + "年" + d + "日";
		} else if (d != 0) {
			ydhms = d + "日";
		}

		if (h != 0) {
			ydhms += h + "時間" + exports.format.zeroPad(m, 2) + "分" + exports.format.zeroPad(s, 2) + "秒";
		} else if (m != 0) {
			ydhms += m + "分" + exports.format.zeroPad(s, 2) + "秒";
		} else if (s != 0) {
			ydhms += s + "秒";
		}

		if (ydhms == "") {
			ydhms = "0秒";
		}

		return ydhms;
	};

	/**
	 * 秒数を任意の日時形式の文字列に変換します
	 * formatFlag
	 *   y：年を表示する
	 *   d：日を表示する
	 *   h：時間を表示する
	 *   m：分を表示する
	 *   s：秒を表示する
	 */
	exports.format.datetimeString = function(t, formatFlag) {
		var str = "";

		if (formatFlag.indexOf("y") != -1) {
			var y = t / 31536000 | 0;
			t = t % 31536000;
			if (y) {
				str += y + "年";
			}
		}
		if (formatFlag.indexOf("d") != -1) {
			var d = t / 86400 | 0;
			t = t % 86400;
			if (d) {
				str += d + "日";
			}
		}

		if (formatFlag.indexOf("h") != -1) {
			var h = t / 3600 | 0;
			t = t % 3600;
			if (h) {
				str += h + "時間";
			}
		}
		if (formatFlag.indexOf("m") != -1) {
			var m = t / 60 | 0;
			t = t % 60;
			if (m) {
				str += m + "分";
			}
		}
		if (formatFlag.indexOf("s") != -1) {
			if (t) {
				str += t + "秒";
			}
		}

		return str;
	};

	/**
	 * バイト単位表現を自動調節して返します
	 */
	exports.format.toAdjustedByteUnit = function(val, scale) {
		scale = scale || 0;
		if (val < 1024) {
			return val.toFixed(scale) + " byte";
		}
		val /= 1024;
		if (val < 1024) {
			return val.toFixed(scale) + " KB";
		}
		val /= 1024;
		if (val < 1024) {
			return val.toFixed(scale) + " MB";
		}
		val /= 1024;
		if (val < 1024) {
			return val.toFixed(scale) + " GB";
		}
		val /= 1024;
		if (val < 1024) {
			return val.toFixed(scale) + " TB";
		}
	};

	/**
	 * 数値を指定された桁数まで0埋めします
	 */
	exports.format.zeroPad = function(val, n) {
		var arry = new Array(n + 1);
		var zeros = arry.join("0");
		if (val == "" || isNaN(val)) {
			return zeros;
		}
		val = Math.round(val);
		return (zeros + val).slice(-n);
	};

	/**
	 * 指定された文字数まで指定された文字で、右側に埋めます
	 */
	exports.format.rpad = function(val, n, c) {
		var arry = new Array(n + 1);
		var padstr = arry.join(c);
		return (val + padstr).substr(0, n);
	};

	/**
	 * 指定された文字数まで指定された文字で、左側に埋めます
	 */
	exports.format.lpad = function(val, n, c) {
		var arry = new Array(n + 1);
		var padstr = arry.join(c);
		return (padstr + val).slice(-n);
	};

	/**
	 * 指定されたバイト配列を、指定の基数の文字列にします
	 */
	exports.format.byteArray2str = function(arr, radix, byteSeparate) {
		byteSeparate = byteSeparate || "";
		var len = 8 / Math.log2(radix);

		var binStrList = [];
		// mapを使いたいが、Uint8Arrayの場合は文字列が要素の配列に変換することができなかった。Chrome/Firefoxともに
		arr.forEach(function(val) {
			binStrList.push(val.toString(radix).padStart(len, '0'));
		});
		return binStrList.join(byteSeparate);
	};

	/**
	 * 指定されたバイト配列の配列を、指定の基数の文字列にします
	 */
	exports.format.byteArrArr2str = function(arrArr, radix, byteSeparate, charSeparate) {
		byteSeparate = byteSeparate || "";
		var len = 8 / Math.log2(radix);

		var charBinList = [];
		arrArr.forEach(function(arr) {
			var binStrList = [];
			arr.forEach(function(val) {
				binStrList.push(val.toString(radix).padStart(len, '0'));
			});
			charBinList.push(binStrList.join(byteSeparate));
		});
		return charBinList.join(charSeparate);
	};


	// 数学関数
	exports.math = {};

	// 素数判定
	// 素数でないなら割れる数を、素数ならfalseを返す
	exports.math.isNotPrimeNumber = function(n) {
		var LOOP_MAX = Math.sqrt(n) + 1;
		var LEN = PRIME_NUMBERS.length;

		// 素数リストで判断できる範囲
		for (var i = 0; i < LEN; i++) {
			if (n == PRIME_NUMBERS[i] || PRIME_NUMBERS[i] > LOOP_MAX) {
				return false;
			}
			if (n % PRIME_NUMBERS[i] == 0) {
				return PRIME_NUMBERS[i];
			}
		}

		var START = PRIME_NUMBERS[LEN - 1] + 1 - (PRIME_NUMBERS[LEN - 1] % 210);
		for (var i = START; i < LOOP_MAX; i += 210) {
			if (n % i == 0) {return i;}
			if (n % (i + 10) == 0) {return i + 10;}
			if (n % (i + 12) == 0) {return i + 12;}
			if (n % (i + 16) == 0) {return i + 16;}
			if (n % (i + 18) == 0) {return i + 18;}
			if (n % (i + 22) == 0) {return i + 22;}
			if (n % (i + 28) == 0) {return i + 28;}
			if (n % (i + 30) == 0) {return i + 30;}
			if (n % (i + 36) == 0) {return i + 36;}
			if (n % (i + 40) == 0) {return i + 40;}
			if (n % (i + 42) == 0) {return i + 42;}
			if (n % (i + 46) == 0) {return i + 46;}
			if (n % (i + 52) == 0) {return i + 52;}
			if (n % (i + 58) == 0) {return i + 58;}
			if (n % (i + 60) == 0) {return i + 60;}
			if (n % (i + 66) == 0) {return i + 66;}
			if (n % (i + 70) == 0) {return i + 70;}
			if (n % (i + 72) == 0) {return i + 72;}
			if (n % (i + 78) == 0) {return i + 78;}
			if (n % (i + 82) == 0) {return i + 82;}
			if (n % (i + 88) == 0) {return i + 88;}
			if (n % (i + 96) == 0) {return i + 96;}
			if (n % (i + 100) == 0) {return i + 100;}
			if (n % (i + 102) == 0) {return i + 102;}
			if (n % (i + 106) == 0) {return i + 106;}
			if (n % (i + 108) == 0) {return i + 108;}
			if (n % (i + 112) == 0) {return i + 112;}
			if (n % (i + 120) == 0) {return i + 120;}
			if (n % (i + 126) == 0) {return i + 126;}
			if (n % (i + 130) == 0) {return i + 130;}
			if (n % (i + 136) == 0) {return i + 136;}
			if (n % (i + 138) == 0) {return i + 138;}
			if (n % (i + 142) == 0) {return i + 142;}
			if (n % (i + 148) == 0) {return i + 148;}
			if (n % (i + 150) == 0) {return i + 150;}
			if (n % (i + 156) == 0) {return i + 156;}
			if (n % (i + 162) == 0) {return i + 162;}
			if (n % (i + 166) == 0) {return i + 166;}
			if (n % (i + 168) == 0) {return i + 168;}
			if (n % (i + 172) == 0) {return i + 172;}
			if (n % (i + 178) == 0) {return i + 178;}
			if (n % (i + 180) == 0) {return i + 180;}
			if (n % (i + 186) == 0) {return i + 186;}
			if (n % (i + 190) == 0) {return i + 190;}
			if (n % (i + 192) == 0) {return i + 192;}
			if (n % (i + 196) == 0) {return i + 196;}
			if (n % (i + 198) == 0) {return i + 198;}
			if (n % (i + 208) == 0) {return i + 208;}
		}
		return false;
	};

	// 引数を素因数分解し、素因数の配列で返す
	exports.math.primeFactorization = function(n) {
		var primeFactors = [];
		while (true) {
			var result = exports.math.isNotPrimeNumber(n);
			if (!result) {
				primeFactors.push(n);
				break;
			}
			primeFactors.push(result);
			n = n / result;
		}
		return primeFactors;
	};

	exports.math.累乗化 = function(a) {
		var map = {};
		for (var i = 0; i < a.length; i++) {
			if (map[a[i]]) {
				map[a[i]]++;
			} else {
				map[a[i]] = 1;
			}
		}

		var 累乗表現 = [];
		for (var key in map) {
			if (map[key] == 1) {
				累乗表現.push(key);
			} else {
				累乗表現.push(key + "<sup>" + map[key] + "</sup>");
			}
		}
		return 累乗表現;
	};

	// 最大公約数算出
	exports.math.calcGcd = function(a, b) {
		if (b == 0) {
			return a;
		}

		var r;
		while ((r = a % b) != 0) {
			a = b;
			b = r;
		}
		return b;
	};

	// 最大公約数配列を返す
	exports.math.gcdList = function(a, b) {
		var i = 0, j = 0;
		var r = [];
		while (i < a.length && j < b.length) {
			if (a[i] == b[j]) {
				r.push(a[i]);
				i++, j++;
			} else if (a[i] > b[j]) {
				j++;
			} else {
				i++;
			}
		}
		return r;
	};

	// 最小公倍数配列を返す
	exports.math.lcmList = function(a, b) {
		var i = 0, j = 0;
		var r = [];

		while (true) {
			var v1 = a[i];
			var v2 = b[j];

			if (v1 == v2) {
				r.push(v1);
				i++, j++;
			} else if (v1 > v2) {
				r.push(v2);
				j++;
			} else {
				r.push(v1);
				i++;
			}

			if (i >= a.length) {
				return r.concat(b.slice(j));
			} else if (j >= b.length) {
				return r.concat(a.slice(i));
			}

		}
	};

	// 引数として与えられた文字列を構文解析して浮動小数点数を返します。基数の指定が可能です。
	exports.math.parseFloat = function(str, radix) {
		str = "" + str;
		radix = radix ? radix : 10;

		var v = parseInt(str.replace(/\./, ""), radix);
		if (isNaN(v)) {
			return NaN;
		}

		var m = str.match(/^\-?[0-9a-z]+\.([0-9a-z]+)/i);
		if (m) {
			var scale = m[1].length;
		} else {
			var scale = 0;
		}

		v = v / (Math.pow(radix, scale));
		return v;
	};


	// 日付関連
	exports.date= {};
	var 曜日list = ["日", "月", "火", "水", "木", "金", "土"];

	exports.date.get曜日 = function(date) {
		return 曜日list[date.getDay()];
	};

	// 型チェック・入力チェック
	exports.checks = {};

	exports.checks.getInputValuesAndCheck = function(inputs) {
		var vals = {};
		for (var key in inputs) {
			var item = inputs[key];
			var v = $(item["selector"]).val();

			if (item["chkfncs"]) {
				for (var msg in item["chkfncs"]) {
					if (!item["chkfncs"][msg](v, vals)) {
						alert(msg);
						return false;
					}
				}

			} else {
				if (!item["chkfnc"](v, vals)) {
					alert(item["msg"]);
					return false;
				}
			}

			if (item["type"] === "number") {
				vals[key] = v - 0;
			} else {
				vals[key] = v;
			}
		}
		return vals;
	};

	exports.checks.is = function(type, obj) {
		var clas = Object.prototype.toString.call(obj).slice(8, -1);
		return (obj !== undefined || obj !== null) && clas === type;
	};

	exports.checks.isInt = function(v) {
		if (v === undefined || v === null) {
			return false;
		}
		if (!exports.checks.is("String", v) && !exports.checks.is("Number", v)) {
			return false;
		}
		v = "" + v;
		return (v === "0" || /^-?[1-9]\d*$/.test(v));
	};

	exports.checks.isNumber = function(v) {
		if (v === undefined || v === null) {
			return false;
		}
		if (!exports.checks.is("String", v) && !exports.checks.is("Number", v)) {
			return false;
		}
		v = "" + v;
		return (v === "0" || /^-?\d+(\.\d*)?$/.test(v));
	};

	// ユーティリティ
	exports.utils = {};

	exports.utils.isNumerical = function(v) {
		if (v == "") {
			return false;
		}
		return !isNaN(v);
	};

	/**
	 * 自然数かチェック
	 */
	exports.utils.isNaturalNumber = function(v) {
		return /^[1-9][0-9]*$/.test(v);
	};

	exports.utils.escapeHtml = function(str) {
		str = "" + str;
		str = str.replace(/&/g, "&amp;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/</g, "&lt;");
		return str;
	};

	/**
	 * FORMコントロールへの値の設定
	 * @param setting 「{key1: value1, key2: value2, ...}」形式のオブジェクト
	 *   key  ：要素を特定するjQueryのセレクタ
	 *   value：設定する値
	 */
	exports.utils.setValues = function(settings) {
		for (var key in settings) {
			var v = settings[key];
			var elm = $(key);
			if (typeof v == "boolean") {
				elm.prop("checked", v);
			} else {
				elm.val(v);
			}
		}
	};

	/**
	 * カウンター
	 */
	exports.utils.counter = function(map) {
		map = map || {};
		return {
			inc: function(key) {
				map[key] ? map[key]++ : map[key] = 1;
				return map;
			},
			dec: function(key) {
				map[key] ? map[key]-- : map[key] = -1;
				return map;
			},
			add: function(key, val) {
				if (isNaN(val)) {
					throw new TypeError("addの第二引数には、数値を指定してください");
				}
				val -= 0;
				map[key] ? map[key] += val : map[key] = val;
				return map;
			},
		};
	};

	// 画面構築補助
	exports.builder = {};

	exports.builder.id;
	function spin($elm, step, min, max, fraction, t) {
		fraction = (typeof fraction === "number") ? fraction : 1;
		t = t || 500;

		var h = $elm.val() - 0;
		h = h + step;
		if (h == "" || isNaN(h) || h < min || h > max) {
			return;
		}
		$elm.val(h.toFixed(fraction));

		exports.builder.id = setTimeout(function() {spin($elm, step, min, max, fraction, 70)}, t);
	}

	// spinボタンの動きを設定
	// {target, step, littleStep, min, max}
	exports.builder.buildSpinner = function(obj) {
		var target = obj.target;
		var step = obj.step || 1;
		var littleStep = obj.littleStep || 0.1;
		var min = obj.min || Number.MIN_VALUE;
		var max = obj.max || Number.MAX_VALUE;
		var fraction = (typeof obj.fraction === "number") ? obj.fraction : 1;

		$("#" + target + "-up").bind("mousedown", function() {
			spin($("#" + target), step, min, max, fraction);
		});
		$("#" + target + "-down").bind("mousedown", function() {
			spin($("#" + target), -step, min, max, fraction);
		});
		$("#" + target + "-little-up").bind("mousedown", function() {
			spin($("#" + target), littleStep, min, max, fraction);
		});
		$("#" + target + "-little-down").bind("mousedown", function() {
			spin($("#" + target), -littleStep, min, max, fraction);
		});
		$("#" + target + "-up, #" + target + "-down, #" + target + "-little-up, #" + target + "-little-down").bind("mouseup mouseout touchend", function() {
			clearTimeout(exports.builder.id);
		});
	};

	// 丸め処理の定義。丸めたい数値を引数に取り、丸めた値を返す関数オブジェクトを設定する。
	exports.builder.丸め処理 = {
		"調整なし・カンマなし": function(num) {return num;},
		調整なし: function(num)     {return num.toLocaleString("ja-JP", {maximumFractionDigits: 20});},
		整数表示: function(num)     {return num.toLocaleString("ja-JP", {maximumFractionDigits:  0});},
		"小数第一位": function(num) {return num.toLocaleString("ja-JP", {maximumFractionDigits:  1});},
		"小数第二位": function(num) {return num.toLocaleString("ja-JP", {maximumFractionDigits:  2});},
		"小数第三位": function(num) {return num.toLocaleString("ja-JP", {maximumFractionDigits:  3});},
		"小数第四位": function(num) {return num.toLocaleString("ja-JP", {maximumFractionDigits:  4});},
		"小数第一位 (強制)": function(num) {return num.toLocaleString("ja-JP", {minimumFractionDigits: 1, maximumFractionDigits: 1});},
		"小数第二位 (強制)": function(num) {return num.toLocaleString("ja-JP", {minimumFractionDigits: 2, maximumFractionDigits: 2});},
		"小数第三位 (強制)": function(num) {return num.toLocaleString("ja-JP", {minimumFractionDigits: 3, maximumFractionDigits: 3});},
		"小数第四位 (強制)": function(num) {return num.toLocaleString("ja-JP", {minimumFractionDigits: 4, maximumFractionDigits: 4});},
	};
	exports.builder.build丸め処理List = function() {
		for (var key in exports.builder.丸め処理) {
			$("#丸め処理").append($("<option>").text(key).val(key));
		}
	};

	// SELECT要素の選択をマウスホイールで変えられるようにする
	exports.builder.addOnWheel = function(selector) {
		$(selector).on("wheel", function(e) {
			var delta = -(e.originalEvent.deltaY || e.originalEvent.detail || -e.originalEvent.wheelDelta);
			if (delta < 0) {
				if (this.length - 1 > this.selectedIndex) {
					this.selectedIndex++;
				}
			} else {
				if (0 < this.selectedIndex) {
					this.selectedIndex--;
				}
			}
			$(this).change();
			return false;
		});
	};

	return exports;
})();

// 画面共通で実行する処理
$(function() {
	// 「ちょこっとアンケート＆メッセージ」用処理
	$("#send").click(function() {

		if ($("#msg").val() == "" && $("#役に立った？").val() == "") {
			$("#basicModal").modal("show");
			$("#modalMsg").text("ちょこっとアンケートを選択するか、メッセージを入力するか、どちらかを行ってください。");
			return;
		}

		var param = {
			subject: "ちょこっとアンケート＆メッセージ - instant tools",
			pagename: $("h1").text(),
			vote: $("#役に立った？").val(),
			body: $("#msg").val(),
			securimageCode: $("#securimageCode").val(),
			url: location.href,
			referrer: document.referrer,
		};

		if ($("#dataSend").prop("checked")) {
			var selector = "textarea:not([id=msg]), " +
				"input:not([type=button], [type=submit], [id=dataSend]), " +
				"select:not([id=役に立った？], [id=datas], [id=samples])";
			var inputDatas = {};
			$(selector).each(function(i, o) {
				var $o = $(o);
				var isNotEmpty = $o.val() === 0 || $o.val();
				var isCheckboxOrRadio = ($o.prop("type") === "checkbox" || $o.prop("type") === "radio");
				// TYPEがCHECKBOXもしくはRADIOでかつ、チェックされていなかった場合のみtrue
				var isNotChecked = isCheckboxOrRadio && $o.prop("checked") === false;
				var notSend = $o.data("send") == "no";
				if (isNotEmpty && !isNotChecked && !notSend) {
					if ($o.prop("id")) {
						var key = "#" + $o.prop("id");
					} else {
						var name = $o.prop("name");
						var idx = $("[name=" + name + "]").index(o);
						var key = TOOLS.string.replaces(
							"[name=【name】]:eq(【index】)",
							{"【name】": name, "【index】": idx}
						);
					}
					if (isCheckboxOrRadio) {
						var v = true;
					} else {
						var v = $o.val();
						// 文字列の幅：ASCII文字及び半角カナを1、それ以外の文字を2とカウント
						var len = TOOLS.string.stringWidth(v);
						if (len > 200) {
							v = TOOLS.string.truncate(v, 200);
							v += "(" + len + "文字)";
						}
					}
					inputDatas[key] = v;

				}
			});
			if (window["editor1"]) {
				inputDatas["editor1"] = editor1.getValue();
			}
			var inputDatasStr = JSON.stringify(inputDatas);
			param["inputDatas"] = inputDatasStr;
		}

		$("#send").prop("disabled", true);
		$("#sending").addClass("sending");

		$.ajax({
			type: "post",
			url: "../ajax/message_ajax.php",
			data: param,
			crossDomain: false,
			scriptCharset: 'utf-8'
		}).done(function(result) {
			$("#sending").removeClass("sending");
			$("#basicModal").modal("show");
			$("#modalMsg").html(result);
			$("#securimageRefresh").click();
			setTimeout(function() {
				$("#msg").val("");
				$("#send").prop("disabled", false);
			}, 6000);
		}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
			$("#sending").removeClass("sending");
			if (XMLHttpRequest.status == 401) {
				var erroMsg = "認証コードが正しくありません。画像に表示されている文字を入力して下さい。";
			} else {
				var erroMsg = "何か問題が起きたようです。せっかくメッセージをお送りしていただきましたのに申し訳ありません。";
			}
			$("#basicModal").modal("show");
			$("#modalMsg").text(erroMsg);
			$("#send").prop("disabled", false);
			$("#securimageRefresh").click();
		});

	});

	$("#securimageRefresh").click(function() {
		var url = "../home/securimage.php?" + (new Date()).getTime();
		$("img.securimage").prop("src", url);
	}).click();

	// SWAPボタンの有効化
	$("#swap").click(function() {
		$("#input").val($("#result").val());
		$("#result").val("");
	});

	// スペルチェックの無効化
	$("textarea, input").prop("spellcheck", false);


	if (location.href != localStorage.getItem("histUrl0")) {
		if (localStorage.getItem("histUrl1")) {
			localStorage.setItem("histUrl2", localStorage.getItem("histUrl1"));
			localStorage.setItem("histTime2", localStorage.getItem("histTime1"));
		}
		if (localStorage.getItem("histUrl0")) {
			localStorage.setItem("histUrl1", localStorage.getItem("histUrl0"));
			localStorage.setItem("histTime1", localStorage.getItem("histTime0"));
		}
		localStorage.setItem("histUrl0", location.href);
		localStorage.setItem("histTime0", (new Date()).getTime());
	}

});

