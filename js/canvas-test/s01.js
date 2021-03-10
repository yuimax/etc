// s01.js

var s01 = (function() {

//=====================================================================
// 基本図形の描画
function draw_image()
{
	///////////////////////////////////////////////
    // 描画コンテキストの取得
	const g = get_canvas_context("img");

	// 画面クリア
    clear_canvas(g, "#fafafa");

	// 普通のフォントと、ちょっと大きいフォント
    g.font = '12pt sans-serif';
    const big_font = '15pt sans-serif';

	///////////////////////////////////////////////
    // 左側の円の中心位置
	let [x, y] = [160, 210];

	// 円と、0度の直線
    drawCircle(g, x, y, 90, { width: 1.5, color: "#006000" });
    drawLine(g, x, y, x, y - 90, { width: 1.5, color: "#006000" });

    // -45度の直線と、説明文
	let [dx, dy] = getOffset(-45, 110);
    drawLine(g, x, y, x + dx, y + dy, { width: 3, color: "#404040" });
    drawText(g, x + dx - 60, y + dy - 10, "影の向き\n-45度");

    // -5度の直線と、説明文
	[dx, dy] = getOffset(-5, 110);
    drawLine(g, x, y, x + dx, y + dy, { width: 3, color: "#f08080" });
    drawText(g, x + dx - 30, y + dy - 30, "太陽の位置\n-5度");

    // 全体説明文
    drawText(g, x, 30, "初期位置 (Ry=0)", { font: big_font, align: "center" });

	///////////////////////////////////////////////
    // 右側の円の中心位置
	[x, y] = [390, 210];
	
	// 円と、0度の直線
    drawCircle(g, x, y, 90, { width: 1.5, color: "#006000" });
    drawLine(g, x, y, x, y - 90, { width: 1.5, color: "#006000" });

    // -45度の直線と、説明文
	[dx, dy] = getOffset(-45, 110);
    drawLine(g, x, y, x + dx, y + dy, { width: 3, color: "#404040" });
    drawText(g, x + dx - 60, y + dy - 10, "影の向き\n-45度");

    // 135度の直線と、説明文
	[dx, dy] = getOffset(135, 110);
    drawLine(g, x, y, x + dx, y + dy, { width: 3, color: "#f08080" });
    drawText(g, x + dx + 10, y + dy - 10, "太陽の位置\n135度");

    // 全体説明文
    drawText(g, x, 30, "回転後 (Ry=140)", { font: big_font, align: "center" });
}

// draw_image() を s01.draw() という名前で公開
return { draw: draw_image }

})();
