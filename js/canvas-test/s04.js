// s04.js

//=====================================================================
// ライフゲームの世界

function create_world(id)
{
	const canvas = document.querySelector('canvas#' + id);
	if (!canvas) {
		alert('<canvas id="' + id + '"> not found');
		return null;
	}
	const g = canvas.getContext("2d");
	const cellsize = 8;
	const width = Math.floor(g.canvas.clientWidth / cellsize);
	const height = Math.floor(g.canvas.clientHeight / cellsize);
	const size = width * height;
	const cells = new Int8Array(size);
	const count = new Int8Array(size);

	// ランダムに生命を発生させる（発生率=rate）
	function randomize(rate)
	{
		rate = Math.max(0, Math.min(1, rete));
		for (let i = 0; i < size; i++) {
			cells[i] = (Math.random() < rate) ? 1 : 0;
		}
	}
	
	// 現在のワールドを描画する
	function draw()
	{
		g.
		for (let y = 0; y < height; y++) {
			let idx = y * width;
			for (let x = 0; x < width; x++) {
				if (cells[idx + x] 
			}
		}
	}

	return {
		width: width,
		height: height,
		randomize: randomize,
	};

})();



var s04 = (function() {

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
