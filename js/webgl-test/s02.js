// 課題：平面図形の描画

var s02 = (function() {

// シェーダの初期化
function init_prog(gl)
{
	// 頂点シェーダのソースコード
	//
	// 頂点シェーダの仕事は、特殊変数 gl_Position を算出すること。
	//	vec4 gl_Position   // 描画座標を示す特殊変数
	//
	// ここではシェーダ利用者が設定した次の変数を参照し計算している。
	//	attribute vec4 aVertexPosition	// 元座標（変数名は任意）
	//	uniform mat4 uModelViewMatrix	// モデル座標の変換マトリクス（〃）
	//	uniform mat4 uProjectionMAtrix	// カメラ座標の変換マトリクス（〃）
	//
	// 変数の種類
	//	attribute	値の配列に、配列の属性（要素のサイズなど）を付加したもの
	//	uniform		単独の値
	//
	// 変数の型
	//	vec4		4次元ベクトル [x, y, z, w]
	//	mat4		4x4の行列
	//
	const vsSource = `
		attribute vec4 aVertexPosition;
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		void main() {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		}
	`;

	// フラグメントシェーダのソースコード
	//
	// フラグメントシェーダの仕事は、特殊変数 gl_FragCoｊlor を算出すること。
	//  vec4 gl_FragColor   // ピクセルの色
	// 
	// ここではすべてのピクセルに白色（RGBA=[1,1,1,1]）を設定している。
	//
	const fsSource = `
		void main() {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	`;

	// シェーダをコンパイルする
	const prog = create_prog(gl, vsSource, fsSource);
	gl.useProgram(prog);

	return prog;
}

// データの設定
function set_buffers(gl, prog)
{
	//------------------------------------------------
	// 正方形の頂点データ
	//
	// 今回はTRIANGLE_STRIP形式で描画する。
	// この方式では次のような順番で図形を3角形に分割していく。
	//
	// 頂点 0-1-2 で三角形、面の向きは 0→1→2
	// 頂点 1-2-3 で三角形、面の向きは 2→1→3 （1と2が逆順)
	// 頂点 2-3-4 で三角形、面の向きは 2→3→4
	// 頂点 3-4-5 で三角形、面の向きは 4→3→5 （3と4が逆順)
	// ：
	//
	const vertex_positions = new Float32Array([
		-1.0,  1.0,	// 頂点0（左上）
		 1.0,  1.0,	// 頂点1（右上）
		-1.0, -1.0,	// 頂点2（左下）
		 1.0, -1.0,	// 頂点3（右下）
	]);

	// バッファを確保する。バッファとはGPU側のメモリ領域である。
	const vertex_position_buffer = gl.createBuffer();

	// バッファをバインドする（つまり以下の操作の対象とする）。
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);

	// 用意した座標データをバッファに書き込む。
	gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW);

	// バッファをシェーダ側の変数 "aVertexPosition" と紐づける。
	let vpos_loc = gl.getAttribLocation(prog, 'aVertexPosition');

	// バッファの属性を設定する。
	gl.vertexAttribPointer(
		vpos_loc,	// "aVertexPosition" の属性ロケーション
		2,			// 頂点あたりの要素数
		gl.FLOAT,	// 要素のデータ型（g.FLOATは32ビット浮動小数点数）
		false,		// 整数データを正規化するか（gl.FLOATの場合は無意味）
		0,			// 頂点ごとのバイトサイズ、0だと要素のデータ型と同サイズ
		0			// 最初の頂点のバイト位置
		);

	// バッファの属性を有効にする。
	gl.enableVertexAttribArray(vpos_loc);
}

// カメラ視野角の設定
function set_projection(gl, prog)
{
	const projection_matrix = mat4.create();

	mat4.perspective(
		projection_matrix,
		45 * Math.PI / 180,		// fieldOfView
		get_aspect(gl.canvas),	// aspect
		0.1,					// zNear
		100.0					// zFar
		);

	let loc = gl.getUniformLocation(prog, 'uProjectionMatrix');
	gl.uniformMatrix4fv(loc, false, projection_matrix);
}

// モデルビューの設定
function set_modelview(gl, prog)
{
	// 単位行列
	const modelview_matrix = mat4.create();

	// 平行移動
	mat4.translate(
		modelview_matrix,
		modelview_matrix,
		[0.0, 0.0, -4.0]
		);

	const loc = gl.getUniformLocation(prog, 'uModelViewMatrix');
	gl.uniformMatrix4fv(loc, false, modelview_matrix);
}

// 描画の実行
function draw_square()
{
	// 実行中のアニメーションがあれば停止
	ANI.stop();
	TXT.clear();

	// 描画の準備
	const gl = init_context('img');	// WebGLコンテキストを初期化
	const prog = init_prog(gl);		// シェーダの作成
	set_buffers(gl, prog);			// 図形データ
	set_projection(gl, prog);		// カメラ視野角
	set_modelview(gl, prog);		// モデルビュー

	// 画面クリア
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// 描画を実行する
	gl.drawArrays(
		gl.TRIANGLE_STRIP,	// mode
		0,					// offset
		4					// vertexCount
		);
}

// draw_square() を s02.draw() という名前で公開する
return { draw: draw_square };

})();
