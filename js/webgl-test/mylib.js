// WebGL API / チュートリアル
// https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Tutorial
//
// glMatrix
// http://glmatrix.net/

//=============================================================
// gl-matrix.js の glMatrix.mat4 に短縮名をつける
const mat4 = glMatrix.mat4;

//=============================================================
// WebGLコンテキストの初期化
function init_context(id) {

	const canvas = document.querySelector('canvas#' + id);
	const gl = canvas.getContext('webgl');

	if (gl === null) {
		alert('WebGLを初期化できません。対応するブラウザおよびGPUが必要です。');
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);	// 不透明の黒
	gl.clearDepth(1.0);					// すべてクリア
	gl.enable(gl.DEPTH_TEST);			// Enable depth testing
	gl.depthFunc(gl.LEQUAL);			// Near things obscure far things

	return gl;
}

//=============================================================
// シェーダプログラムの作成

// シェーダのコンパイル
function create_shader(gl, type, source) {

	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('シェーダがコンパイルできません: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

// 頂点シェーダとフラグメントシェーダをコンパイルし、リンクする
function create_prog(gl, vsSource, fsSource) {

	const prog = gl.createProgram();
	gl.attachShader(prog, create_shader(gl, gl.VERTEX_SHADER, vsSource));
	gl.attachShader(prog, create_shader(gl, gl.FRAGMENT_SHADER, fsSource));
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		alert('シェーダをリンクできません: ' + gl.getProgramInfoLog(prog));
		return null;
	}

	return prog;
}

//=============================================================
// テクスチャを読み込むTEXLOADERオブジェクト
//
// TEXLOADER.load(gl, url)
//	URLで指定した画像を読み込み、テクスチャを作成して返す
//	一度作成したデータは保存し、次回からそれを返す
//
// TEXLOADER.reload(gl, url)
//	保存データを無視し、あらためてテクスチャを作成する
//
const TEXLOADER = (function() {

	// URLとテクスチャの対応を記録するオブジェクト
	const my_history = new Map();

	// glとurlからユニークなキーを作る
	function get_key(gl, url)
	{
		return url + "\t" + gl.canvas.id;
	}

	// URLから画像を読み込みテクスチャを作成する
	function create_texture(gl, url)
	{
		// 新規作成
		const texture = gl.createTexture();
		const key = get_key(gl, url);
		my_history.set(key, texture);

		// とりあえずダミーの画像を割り当てる
		const dummy_data = new Uint8Array([0, 0, 255, 255]); // 青の1ピクセル
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,		// target
			0,					// level
			gl.RGBA,			// internalFormat
			1,					// width
			1,					// height
			0,					// border
			gl.RGBA,			// srcFormat
			gl.UNSIGNED_BYTE,	// srcType
			dummy_data			// pixels
		);

		// 画像の読み込みを開始する
		const img = new Image();
		img.onload = function() {

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,		// target
				0,					// level
				gl.RGBA,			// internalformal
				gl.RGBA,			// format
				gl.UNSIGNED_BYTE,	// type
				img					// ImageData
				);

			// テクスチャの属性を設定する
			if (is_power_of_2(img.width) && is_power_of_2(img.height)) {
				// 幅も高さも2のべき乗の場合
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);
			}
			else {
				// 幅と高さの少なくとも一方が2のべき乗ではない場合
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			}

		};
		img.src = url;

		return texture;
	}

	// URLに対応するテクスチャを返す
	function get_texture(gl, url)
	{
		const key = get_key(gl, url);
		if (my_history.has(key)) {
			// すでに取得済みならそれを返す
			return my_history.get(key);
		}
		else {
			// まだなら新しく取得する
			return create_texture(gl, url);
		}
	}

	// TEXLOADERオブジェクトの本体
	return {
		load: get_texture,
		reload: create_texture,
	};

})();

//=============================================================
// 周回加算器を作るファクトリ関数
//
// 周回加算器の機能
// .span		周期。ファクトリの引数で指定する。
// .value		現在の値。0以上span未満の範囲で周回する。
// .ratio		spanに対するvalueの割合。0以上1未満の値になる。
// .lastvalue	add()する直前のvalue。
// .add(n)		valueに整数nを加える。nはマイナス値でもよい。
// .degree()	(360*ratio)を、整数3桁+小数点+小数1桁で表記。
//
function create_cyclic_adder(span) {

	// オブジェクトごとのローカル変数
	const my_span = Math.max(1, Math.floor(span));
	let my_value = 0;
	let my_ratio = 0;
	let my_lastvalue = 0;

	// my_valueにnを加算する
	function add(n)
	{
		// 旧データを保存する
		my_lastvalue = my_value;

		// 新データを計算する： (n<0)の場合にも対応
		my_value = (my_value + Math.floor(n)) % my_span;
		if (my_value < 0) { my_value += my_span; }
		my_ratio = my_value / my_span;
	}

	// (360 * my_ratio)を、整数3桁+小数点+小数1桁、全体5桁で表記する
	function degree()
	{
		return (360 * this.ratio).toFixed(1).padStart(5, '0');
	}
	
	// 周回加算器のオブジェクトを作って返す
	return {
		// ゲッター
		get span() { return my_span; },
		get value() { return my_value; },
		get ratio() { return my_ratio; },
		get lastvalue() { return my_lastvalue; },
		// メソッド
		add: add,
		degree: degree,
	};
}

//=====================================================================
// イメージリストを作るファクトリ関数
//
// イメージリストの機能
//	イメージリストは、ようするにImageの配列である。
//	基本的な配列の機能に加え、次のメソッドを追加してある。
//
// .load(urls, job)
//	urls[]で指定したすべての画像を読み込む。
//	このメソッド自体は読み込み完了を待たずに終了する。
//	すべての読み込みが完了した時点でjob()が実行される。
//	以前のload()が進行中なら、何もせず、100ミリ後に自分を再実行する。
//
// .get(url)
//	配列中のImageをurlで検索する。
//	urlが見つからなければundefinedを返す。
//
// .clear()
//	データをクリアする
//	以前のload()が進行中なら、何もせず、100ミリ後に自分を再実行する。
//
function create_image_list() {

	// Imageの配列
	const my_images = [];

	// urlとImageの対応を記録
	const my_map = new Map();

	// ロード中なら1以上になる
	let my_loading = 0;

	// urls[]で指定した画像の読み込みを開始し、完了時のjob()を設定する
	function load_images(urls, job)
	{
		// すでにロード中なら何もせず、100ミリ秒後に自分を再実行する
		if (++my_loading >= 2) {
			window.setTimeout(load_images, 100, urls, job);
			--my_loading;
			return;
		}

		// 引数のチェック
		urls ??= [];
		job ??= function() {};

		// urls[]が空ならjob()を実行して終了
		if (urls.length == 0) {
			job();
			--my_loading;
			return;
		}

		// 画像読み込み終了時のハンドラを作る
		//	img.onload、img.onerror に割り当てて利用する
		//
		// メモ：
		//	JavaScriptのfunctionは「クロージャ」なので、このchekcer()も
		//	作成時のローカル変数（ここではn, urls, job) への参照を保持している。
		//	したがってload_images()を抜けても、個々のimg.onload等は仕事ができる。
		//
		let n = 0;
		function checker() {
			if (++n >= urls.length) {
				job();
				--my_loading;
			}
		}

		// urls[]で指定された画像の読み込みを開始する
		//
		// メモ：
		//	読み込み成功でimg.onload、失敗でimg.onerrorを実行する。
		//	一部のブラウザでは、常に実行されるimg.onloadendというものもあるが、
		//	まだ一般的ではない。
		//
		for (let url of urls) {
			const img = new Image();
			my_images.push(img);
			my_map.set(url, img);
			img.onload = checker;
			img.onerror = checker;
			img.src = url;
		}
	}
	
	// データをクリアする
	function clear()
	{
		// ロード中なら何もせず、100ミリ秒後に自分を再実行する
		if (++my_loading >= 2) {
			window.setTimeout(clear, 100);
			--my_loading;
		}
		else {
			 my_images.length = 0;
			 my_map.clear();
			--my_loading;
		}
	}

	// my_images に load() メソッドを追加
	my_images.load = load_images;

	// my_images に get() メソッドを追加
	my_images.get = function(url) { return my_map.get(url); }

	// my_images に clear() メソッドを追加
	my_images.clear = clear;

	// my_imagesを返す
	return my_images;

	//------------------------------------------------
	// 2つのload()を実行すると、逐次処理される。
	//
	// たとえば次の例で job_1 と job_2 は、この順に処理される。
	// 
	//	imglist.load(list_1, function() {
	//		job_1();
	//	});
	//	imglist.load(list_2, function() {
	//		job_2();
	//	});
	//
	//------------------------------------------------
	// 3つ以上のload()を実行すると、2番目以降の順番は不確定である。
	// 待機中のload()のどれが実行されるかは、先行load()の終了タイミングによる。
	//
	// たとえば以下の例で job_1 は最初に実行されるが、
	// 次は job_2 かもしれないし、job_3 かもしれない。
	// 
	//	imglist.load(list_1, function() {
	//		job_1();
	//	});
	//	imglist.load(list_2, function() {
	//		job_2();
	//	});
	//	imglist.load(list_3, function() {
	//		job_3();
	//	});
	//
	//------------------------------------------------
	// 複数の load() を確実に逐次処理させたければ次のように書く。
	//
	//	imglist.load(list_1, function() {
	//		job_1();
	//		imglist.load(list_2, function() {
	//			job_2();
	//			imglist.load(list_3, function() {
	//				job_3();
	//				imglist.load(list_4, function() {
	//					// 以下同様
	//				});
	//			});
	//		});
	//	});
	//
	// 最初に実行したload()が最初に処理されることだけは
	// 保証されているので、次の書き方でもよい。
	//
	//	imglist.load(list_1, function() {
	//		job_1();
	//	});
	//	imglist.load(list_2, function() {
	//		job_2();
	//		imglist.load(list_3, function() {
	//			job_3();
	//			imglist.load(list_4, function() {
	//				// 以下同様
	//			});
	//		});
	//	});

}

//=============================================================
// アニメ実行中フラグを制御するANIオブジェクト
//
// ANI.start()	 実行中フラグを反転し、その値を返す
// ANI.stop()	 実行中フラグをfalseにする
// ANI.working() 実行中ならtrueを返す
//
const ANI = (function() {

	// 実行中フラグ
	let my_alive = false;

	// ANIオブジェクトの本体
	return {
		start:	 function() { return my_alive = !my_alive; },
		stop:	 function() { my_alive = false; },
		working: function() { return my_alive; },
	};

})();

//=============================================================
// テキスト表示用のTXTオブジェクト
//
// TXT.attach(id)  出力先の<input>要素のidを指定する
// TXT.print(str)  文字列strを表示する
// TXT.clear()	   テキスト表示をクリアする
//
const TXT = (function() {

	// 出力先の<input>要素
	let my_obj = null;

	// my_objの存在チェック
	function check()
	{
		if (!my_obj) { alert('出力先の<input>要素がありません。'); }
	}

	// TXTオブジェクトの本体
	return {
		attach: function(id) { my_obj = document.querySelector('input#' + id); },
		print:	function(str) { check(); my_obj.value = str; },
		clear:	function() { check(); my_obj.value = ''; },
	};

})();

//=============================================================
// その他

// 引数が2のべき乗ならtrueを返す
function is_power_of_2(value) {
	return (value & (value - 1)) == 0;
}

// HTML要素のアスペクト比を得る
// 参考： https://developer.mozilla.org/ja/docs/Web/API/Element/clientWidth
function get_aspect(e) {
	return e.clientWidth / e.clientHeight;
}

//=============================================================
// テクスチャ用の画像のURL

const IMAGE_URLS = [
	'../../img/ukareru1.png',
];

//=============================================================
// body.onload で実行する初期化処理

function init() {

	// 3D描画をクリア
	const gl = init_context('img'); // <canvas>要素のid
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// テキストをクリア
	TXT.attach('tbox'); // 出力先の<input>要素のid
	TXT.clear();

	// テクスチャ用の画像を一度読み込んでおく。
	// ブラウザにキャッシュさせ、本番のテクスチャ作成を高速化する目的。
	const imglist = create_image_list();
	imglist.load(IMAGE_URLS, function() {
		// 完了したらボタンを有効化する。
		for (let btn of document.querySelectorAll('button')) {
			btn.disabled = false;
		}
        // メモリ節約のためimglistを明示的にクリアする。
		// まあ放置してもそのうちガベコレで破棄される。
        imglist.clear();
	});

}
