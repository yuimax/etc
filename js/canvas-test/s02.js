// s02.js

var s02 = (function() {

//=====================================================================
// 画像の表示
function draw()
{
	///////////////////////////////////////////////
    // 描画コンテキストの取得
	const g = get_canvas_context("img");

	// 画面クリア
    clear_canvas(g, "#fafafa");

	const img1 = my_imglist[0];
	const img2 = my_imglist[1];
	drawImage(g, img1, 0, 0);
	drawImage(g, img2, img1.width, 0, { width: 100, height: 200 });
}

// draw() を s01.draw() という名前で公開
return { draw: draw }

})();
