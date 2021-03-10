//=====================================================================
// JavaScriptのcanvasの使い方
// https://bucephalus.org/text/CanvasHandbook/CanvasHandbook.html

//=====================================================================
// 角度degreeに、距離distanceだけ、進んだときのXY座標を得る
// 角度は真上を0度とし、時計回りに+360度、反時計回りに-360度
//
function getOffset(degree, distance)
{
    let t = Math.PI / 180 * degree;
    let x = Math.sin(t) * distance;
    let y = - Math.cos(t) * distance;
    return [x, y];
}

//=====================================================================
// 描画コンテキストを得る
//
// id = canvas要素のid
//
function get_canvas_context(id)
{
	return document.getElementById(id).getContext("2d");
}

//=====================================================================
// 四角形を塗りつぶす
//
// g = 描画コンテキスト
// x = 左上のx座標
// y = 左上のy座標
// width = 四角形の横幅
// height = 四角形の高さ
// color = "色" // "red", "#ff0000"、"rgb(255,0,0)" など
//
function fillRect(g, x, y, width, height, color)
{
    g.save();
    g.fillStyle = color;
    g.fillRect(x, y, width, height);
    g.restore();
}

//=====================================================================
// 円を描く
//
// g = 描画コンテキスト
// x = 中心のx座標
// y = 中心のy座標
// radius = 半径
// options = {
//   color: "色",    // "red", "#ff0000"、"rgb(255,0,0)" など
//   width: 線の幅,  // ピクセル単位
// }
//
function drawCircle(g, x, y, radius, options)
{
    if (options == null) {
        g.beginPath();
        g.arc(x, y, radius, 0, Math.PI * 2, true);
        g.stroke();
    }
    else {
        g.save();
        if ('color' in options) { g.strokeStyle = options.color; }
        if ('width' in options) { g.lineWidth = options.width; }
        g.beginPath();
        g.arc(x, y, radius, 0, Math.PI * 2, true);
        g.stroke();
        g.restore();
    }
}

//=====================================================================
// 線を引く
//
// g = 描画コンテキスト
// x1 = 始点のx座標
// y1 = 始点のy座標
// x2 = 終点のx座標
// y2 = 終点のy座標
// options = {
//   color: "色",    // "red", "#ff0000"、"rgb(255,0,0)" など
//   width: 線の幅,  // ピクセル単位
// }
//
function drawLine(g, x1, y1, x2, y2, options)
{
    if (options == null) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
    }
    else {
        g.save();
        if ('color' in options) { g.strokeStyle = options.color; }
        if ('width' in options) { g.lineWidth = options.width; }
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
        g.restore();
    }
}

//=====================================================================
// 画像を表示
//
// g   = 描画コンテキスト
// img = Image
// x   = 左上のx座標,
// y   = 左上のy座標,
// options = {
//   width: 幅,
//   height: 高さ,
// }
//
function drawImage(g, img, x, y, options)
{
    if (options == null) {
        g.drawImage(img, x, y);
    }
    else {
        let aspect = (img.height == 0) ? 1 : (img.width / img.height);
        if ('width' in options) {
            if ('height' in options) {
                g.drawImage(img, x, y, options.width, options.height);
            } else {
                g.drawImage(img, x, y, options.width, options.width / aspect);
            }
        } else {
            if ('height' in options) {
                g.drawImage(img, x, y, options.height * aspect, options.height);
            } else {
                g.drawImage(img, x, y);
            }
        }
    }
}

//=====================================================================
// テキストを描画する。 "\n"で改行する。
//
// g = 描画コンテキスト
// x = x座標
// y = y座標
// text = テキスト
// options = {
//   font: "フォント",   // "bold 12pt sans-serif" など
//   color: "色",        // "red", "#ff0000"、"rgb(255,0,0)" など
//   align: "位置揃え",  // "left", "center", "right"
//   height: 行の高さ,   // ピクセル単位、デフォルト=20
// }
//
// フォント指定の例：
//   'italic bold 12pt "UD デジタル 教科書体 NK-R", sans-serif'
// 説明：
//   装飾、サイズ、フォント名の順に書く
//   装飾は、"bold", "italic"、"bold italic"、などが指定できる
//   サイズ指定は、ピクセル(16px)、ポイント(12pt)、などが使える
//   フォント名に空白を含む場合は、クォート記号で囲む
//   代替フォントがある場合は、優先度順にカンマで区切る
//
function drawText(g, x, y, text, options)
{
    // テキストを"\n"で分割して複数行に表示するサブルーチン
    function drawLines(g, x, y, text, height = 20)
    {
        g.beginPath();
        for (let str of text.split("\n")) {
            g.fillText(str, x, y);
            y += height;
        }
        g.stroke();
    }

    // メイン処理
    if (options == null) {
        drawLines(g, x, y, text);
    }
    else {
        g.save();
        if ('font' in options) { g.font = options.font; }
        if ('color' in options) { g.fillStyle = options.color; }
        if ('align' in options) { g.textAlign = options.align; }
        drawLines(g, x, y, text, options.height);
        g.restore();
    }
}

/* ================================================================
    フォント名の[P][K]有無の違いは何ですか？
    https://support.bizplus.typesquare.com/hc/ja/articles/115001692632
    
    ■ BIZ UDフォント
    フォント名に[P]なしのフォント：等幅フォント
        BIZ UDゴシック
        BIZ UD明朝
    フォント名に[P]ありのフォント：プロポーショナルフォント（かな・英数）
        BIZ UDPゴシック
        BIZ UDP明朝
    
    ■UDデジタル教科書体
    フォント名に[P]なしのフォント：等幅フォント
        UD デジタル 教科書体 N-R
        UD デジタル 教科書体 N-B
    フォント名に[P]ありのフォント：プロポーショナルフォント（英数のみ）
        UD デジタル 教科書体 NP-R
        UD デジタル 教科書体 NP-B
    フォント名に[K]ありのフォント：プロポーショナルフォント（かな・英数）
        UD デジタル 教科書体 NK-R
        UD デジタル 教科書体 NK-B
*/

//=====================================================================
// キャンバスを塗りつぶす
//
// g = 描画コンテキスト
// color = "色" // "red", "#ff0000"、"rgb(255,0,0)" など
//
function clear_canvas(g, color)
{
    fillRect(g, 0, 0, g.canvas.width, g.canvas.height, color);
}

//=====================================================================
// 画面クリア
//
function clear_image()
{
	const g = get_canvas_context("img");
    clear_canvas(g, "#fafafa");
}

//=====================================================================
// 画像を読み込む
//
var my_images = [];
function load_images(urls, callback)
{
	let count = 0;
	for (let url of urls) {
		let img = new Image();
		img.onload = function() {
			my_images.push(img);
			if (++count >= urls.length) {
				callback();
			}
		}
		img.src = url;
	}
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

//=====================================================================
// すべてのボタンを有効化する
function enable_buttons()
{
	for (let btn of document.querySelectorAll('button')) {
		btn.disabled = false;
	}
}

//=====================================================================
// index.htmlの初期化

const my_image_urls = [
	'../../img/banzai.png',
	'../../img/ukareru1.png',
	'../../img/ukareru2.png',
];
const my_imglist = create_image_list();

function init()
{
	clear_image();

	// 画像データを読み込む。すべて読み込んだらボタンを有効化
	my_imglist.load(my_image_urls, function() {
		for (let btn of document.querySelectorAll('button')) {
			btn.disabled = false;
		}
	});
}
