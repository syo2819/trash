$(function() {

	// sample listの作成
	$("#samples").append($("<option>"));
	for (var groupName in samples) {
		$("#samples").append($("<optgroup>").attr("label", groupName));
		var group = samples[groupName]; 

		for (var key in group) {
			$("#samples optgroup:last").append($("<option>").text(key).val(key));
		}
	}
	$("#samples_").append($("<option>"));
	for (var groupName in samples_) {
		$("#samples_").append($("<optgroup>").attr("label", groupName));
		var group = samples_[groupName]; 

		for (var key in group) {
			$("#samples_ optgroup:last").append($("<option>").text(key).val(key));
		}
	}


	// sample list選択時の処理
	$("#samples, #samples_").change(function() {
		$("#クリア").click();
		var groupName = $(this).find("option:selected").parent().attr("label");
		if (!groupName) {
			return;
		}

		var samples = window[$(this).prop("id")];
		var obj = samples[groupName][$(this).val()];
		for (var key in obj) {
			$(key).val(obj[key]);
		}
	});

	$("#inputHist").change(function() {
		$("#input").val($(this).val());
	});

	$("#文字化け").click(function() {
		文字化け変換($("#input"), $("#result"));
	});

	$("#基本文字化け").click(function() {
		$("#inputEncode").val("UTF-8");
		$("#outputEncode").val("SJIS-win");
		if (文字化け変換($("#input"), $("#result"))) {
			$("#outputEncode").val("UTF-8");
			$("#inputEncode").val("SJIS-win");
			文字化け変換($("#result"), $("#reverse"), true);

			if ($("#input").val() == $("#result").val()) {
				$("#notice").html("文字化け対象外の文字しか入力されていません");
				setNoticeAlertClass("alert-warning");
			} else if ($("#input").val() == $("#reverse").val()) {
				$("#notice").text("復元できる文字化けです");
				setNoticeAlertClass("alert-success");
			} else {
				$("#notice").text("復元できない文字化けです");
				setNoticeAlertClass("alert-danger");
			}
		}
	});

	$("#文字化け復元").click(function() {
		$("#outputEncode").val("UTF-8");
		$("#inputEncode").val("SJIS-win");
		文字化け変換($("#result"), $("#reverse"));
		$("#notice").text("");
		setNoticeAlertClass();
	});

	function 文字化け変換($input, $result, forced) {
		var input = $input.val();
		var inputEncode = $("#inputEncode").val();
		var outputEncode = $("#outputEncode").val();
		if (input == "") {
			alert("TEXTAREA欄に文字列を入力して下さい");
			$input.focus();
			return false;
		}
		if (inputEncode == outputEncode) {
			alert("入力と出力は異なる文字コードを指定してください");
			$("#outputEncode").focus();
			return false;
		}
		if (!forced && input.length > 200) {
			alert("文字列は200文字以内で入力して下さい");
			$input.focus();
			return false;
		}

		if ($("#inputEncode").val() == "UTF-8") {
			履歴保存(input);
			inputHist
			$("#inputHist").empty().append($("<option>"));
			for (var i = 0; i < inputHist.length; i++) {
				$("#inputHist").append($("<option>").text(inputHist[i].label).val(inputHist[i].val));
			}
		}

		var param = {
			"input": input, 
			"inputEncode": inputEncode,
			"outputEncode": outputEncode,
		};
		var 成否;
		$.ajax({
			type: "post",
			url: "../ajax/mojibake_ajax.php",
			data: param,
			dataType: 'text',
			async : false,
			crossDomain: false,
			scriptCharset: 'utf-8'
		}).done(function(result) {
			$result.val(result);
			成否 = true;
		}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
			$result.val(textStatus);
			成否 = false;
		});
		return 成否;
	}

	function 履歴保存(str) {
		var label = TOOLS.string.truncate(str, 30);

		var p = inArray_(inputHist, str);
		var t = (new Date()).getTime();
		if (p == -1) {
			inputHist.push({label: label, val: str, time: t});
		} else {
			inputHist[p]["time"] = t;
		}

		// 時間でソート。10を超える場合は削除。
		inputHist.sort(function(a, b) {return b.time - a.time;});
		inputHist = inputHist.slice(0, 10);

		// 配列中にvalが同じものがあるか
		function inArray_(arr, val) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i]["val"] == val) {
					return i;
				}
			}
			return -1;
		}
	}

	$("#入れ替え").click(function() {
		var tmp = $("#inputEncode").val();
		$("#inputEncode").val($("#outputEncode").val());
		$("#outputEncode").val(tmp);
		$("#input").val($("#result").val());
		$("#result").val("");
	});

	$("#クリア").click(function() {
		$("#input, #result, #reverse").val("");
		$("#notice").text("");
		setNoticeAlertClass();
	});

	function setNoticeAlertClass(clazz) {
		$("#notice").removeClass("alert-info alert-success alert-warning alert-danger").addClass(clazz || "alert-info");
	}

	$("#コピー").click(function() {
		$("#result_").val($("#result").val()).select().blur();
		document.execCommand("copy");
		$("#result_").val("");
	});

	// modeの切り替え時：char listの生成
	$("#mode").change(function() {
		$("#inputEncode").empty();
		$("#outputEncode").empty();

		if ($("#mode").val() == "general") {
			for (var i = 0; i < charCodes.length; i++) {
				var charCode = charCodes[i];
				if (~popularCharCodes.indexOf(charCode)) {
					$("#inputEncode").append($("<option>").text(charCode).val(charCode));
					$("#outputEncode").append($("<option>").text(charCode).val(charCode));
				}
			}
		} else {
			for (var i = 0; i < charCodes.length; i++) {
				var charCode = charCodes[i];
				$("#inputEncode").append($("<option>").text(charCode).val(charCode));
				$("#outputEncode").append($("<option>").text(charCode).val(charCode));
			}
		}
		$("#outputEncode").val("SJIS-win");
	});
	$("#mode").change();
});

var inputHist = [];

var popularCharCodes = [
	"UTF-8",
	"UTF-16",
	"SJIS-win",
	"Shift_JIS",
	"eucJP-win",
];

var samples = {
	"入出力の選択のみ": {
		"UTF-8→MS932(SJIS-win)": {"#inputEncode": "UTF-8", "#outputEncode": "SJIS-win"},
		"MS932(SJIS-win)→UTF-8": {"#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
		"MS932(SJIS-win)→SJIS": {"#inputEncode": "SJIS-win", "#outputEncode": "Shift_JIS"},
		"MS932(SJIS-win)→EUC-JP": {"#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"EUC-JP→MS932(SJIS-win)": {"#inputEncode": "eucJP-win", "#outputEncode": "SJIS-win"},
	},
	"復元不可能な文字化け例": {
		"SJISの指定ミス1": {"#input": "文字化け–ー₋～", "#inputEncode": "SJIS-win", "#outputEncode": "Shift_JIS"},
		"SJISの指定ミス2": {"#input": "高崎：髙﨑", "#inputEncode": "SJIS-win", "#outputEncode": "Shift_JIS"},
		"SJISの指定ミス3": {"#input": "①Ⅲ㈱㎝", "#inputEncode": "SJIS-win", "#outputEncode": "Shift_JIS"},
		"JIS第三・四水準/サロゲートペア": {"#input": "伃㐂佺𠮷"},
	},
	"(おおむね)復元可能な文字化け例": {
		"半角カナ：MS932(SJIS-win)→EUC": {"#input": "ｱｲｳｴｵ：｢｣､｡･", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"半角カナ：EUC→MS932(SJIS-win)": {"#input": "ｱｲｳｴｵ：｢｣､｡･", "#inputEncode": "eucJP-win", "#outputEncode": "SJIS-win"},
	},
	"文字化け修復例": {
		"EUCをMS932(SJIS-win)で表示した文字化け": {"#input": "､｢､､､ｦ､ｨ､ｪ ｣ｰ｣ｱ｣ｲ｣ｳ\n竺軸宍雫七 而耳自蒔･ｩ", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"MS932(SJIS-win)をUTF-8で表示した文字化け": {"#input": "繝峨く繝･繝｡繝ｳ繝\n濶ｲ隕区悽", "#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
	},
};
var samples_ = {
	"基本文字": {
		"ひらがな": {"#input": "ぁあぃいぅうぇえぉおかがきぎくぐけげこご\nさざしじすずせぜそぞただちぢっつづてでとど\nなにぬねのはばぱひびぴふぶぷへべぺほぼぽ\nまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"カタカナ": {"#input": "ァアィイゥウェエォオカガキギクグケゲコゴ\nサザシジスズセゼソゾタダチヂッツヅテデトド\nナニヌネノハバパヒビピフブプヘベペホボポ\nマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ", "#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
	},
	"復元できる文字化け": {
		"ひらがな": {"#input": "まぐろ さけ あじ はまち\nたまち しながわ おかちまち きたせんじゅ よこはま かわさき\n", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"都道府県：ひらがな・カタカナ": {"#input": "ふくしま ひろしま とくしま かごしま\nちば しが さが\nぐんたま ちばらき\nチバ シガ サガ\nキョナラ", "#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
		"都道府県": {"#input": "青森 秋田 山形\n東京 群馬 山梨\n愛知  静岡 富山\n大阪 京都 奈良 三重 和歌山\n兵庫 岡山 島根 山口\n徳島 高知 福岡 鹿児島", "#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
	},
	"文字化けしやすい文字と文字化け回避ヒント": {
		"ヒント": {"#input": "復元不可能な文字化けも文字を入替えると回避できる場合があります\n復旧できなかった文字化けも表現を工夫すれば回避できる場合がある", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"あいうえお": {"#input": "ぁぃぅぇぉ\nぁぃぁぅぁぇぁぉ\nあいうえお\nあいあうあえあお", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"句点は化け易い": {"#input": "句点は復旧不可能な文字化けになりやすいです。\n特に行末の句点は絶対に復旧できません。\n行末以外なら復旧できる場合もありますよ。しかし復元率を高めるためには避けた方が無難です", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"月がきれいですね": {"#input": "月がきれいですね\n月が綺麗ですね\n月が綺麗ですよね\n月が綺麗ですネ", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"ありがとう": {"#input": "ありがとう\nありがとー\nアリガトウ", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
		"苦肉の策": {"#input": "あじあ\nあじあm\n", "#inputEncode": "SJIS-win", "#outputEncode": "eucJP-win"},
	},
	"特殊": {
		"2019/06/02 QuizKnock 問題": {"#result": "縺ｾ縺ｾ  縺ｿ縺ｿ  縺ｻ縺ｻ  縺ｲ縺ｵ\n繧ｹ繧ｷ  繧ｵ繧ｱ\n繧ｸ繝･繝ｪ繧｢繧ｹ繝ｻ繧ｷ繝ｼ繧ｶ繝ｼ", "#inputEncode": "SJIS-win", "#outputEncode": "UTF-8"},
		"2019/06/02 QuizKnock 解答→問題": {"#input": "まま  みみ  ほほ  ひふ\nスシ  サケ\nジュリアス・シーザー", "#inputEncode": "UTF-8", "#outputEncode": "SJIS-win"},
		"2019/06/02 QuizKnock 説明例外": {"#input": "まま  みみ  スシ\nしま  すみ  トシ", "#inputEncode": "UTF-8", "#outputEncode": "SJIS-win"},
	},
};
