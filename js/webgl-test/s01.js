// 課題：3D描画の準備

var s01 = (function() {

function clear_image()
{
	// 実行中のアニメーションがあれば停止
	ANI.stop();
	TXT.clear();

	// WebGLコンテキストの取得
    const gl = init_context('img');

	// 画面クリア
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// clear_image() を s01.draw() という名前で公開する
return { draw: clear_image };

})();
