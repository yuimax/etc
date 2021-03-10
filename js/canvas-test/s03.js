// s02.js

var s03 = (function() {

//=====================================================================
// 画像の表示
function draw()
{
	///////////////////////////////////////////////
    // 描画コンテキストの取得
	const g = get_canvas_context("img");

	// 画面クリア
    clear_canvas(g, "#fafafa");
	const cx = g.canvas.clientWidth / 2;
	const cy = g.canvas.clientHeight / 2;

	const img1 = my_imglist[0];
	const img2 = my_imglist[1];
	const options = {
		color: "red",
		align: "center",
		font: 'bold 36pt "BIZ UDPゴシック"',
	};
	options.color = "red";
	options.align = "center";
	drawText(g, cx, cy, "Loading Now ...", options);
}

// draw() を s01.draw() という名前で公開
return { draw: draw }

})();
