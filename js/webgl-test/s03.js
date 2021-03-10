// 課題：シェーダによる色の指定

var s03 = (function() {

// シェーダの初期化
function init_prog(gl)
{
	// 頂点シェーダのソースコード
	//
	// ここでは次の変数を参照している。
	//  vec4 aVertexPosition   // 頂点の座標
	//  vec4 aVertexColor      // 頂点の色
	//  mat4 uModelViewMatrix  // モデル座標への変換マトリクス
	//  mat4 uProjectionMAtrix // ビュー座標への変換マトリクス
	//  vec4 vColor            // varying変数はフラグメントシェーダに渡される
	//
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec4 aVertexColor;
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		varying lowp vec4 vColor;
		void main(void) {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vColor = aVertexColor;
		}
	`;

	// フラグメントシェーダのソースコード
	//
	// ここでは次の変数を参照している。
	//  vec4 vColor  // varying変数の値は頂点シェーダから渡されてくる
	//
	const fsSource = `
		varying lowp vec4 vColor;
		void main(void) {
			gl_FragColor = vColor;
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
	const vertex_positions = new Float32Array([
		 1.0,  1.0,	// 頂点0（右上）
		-1.0,  1.0,	// 頂点1（左上）
		 1.0, -1.0,	// 頂点2（右下）
		-1.0, -1.0,	// 頂点3（左下）
	]);

	// 頂点座標バッファを作り、"aVertexPosition"という名前で属性を設定する
	const vertex_position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW);
	const vpos_loc = gl.getAttribLocation(prog, 'aVertexPosition');
	gl.vertexAttribPointer(
		vpos_loc,	// "aVertexPosition" の属性ロケーション
		2,			// 頂点あたりの要素数
		gl.FLOAT,	// 要素のデータ型（g.FLOATは32ビット浮動小数点数）
		false,		// 正規化するか（gl.FLOATの場合は無意味）
		0,			// 頂点ごとのバイトサイズ、0だと要素のデータ型と同サイズ
		0			// 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(vpos_loc);

	//------------------------------------------------
	// 頂点ごとの色データ
	const vertex_colors = new Float32Array([
		1.0,  1.0,	1.0,  1.0,	// 白：頂点0（右上）
		1.0,  0.0,	0.0,  1.0,	// 赤：頂点1（左上）
		0.0,  1.0,	0.0,  1.0,	// 緑：頂点2（右下）
		0.0,  0.0,	1.0,  1.0,	// 青：頂点3（左下）
	]);

	// 頂点色バッファを作り、"aVertexColor"という名で属性を設定する
	const vertex_color_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_colors, gl.STATIC_DRAW);
	const vcol_loc = gl.getAttribLocation(prog, 'aVertexColor');
	gl.vertexAttribPointer(
		vcol_loc,	// "aVertexColor" のロケーション
		4,			// 頂点あたりの要素数
		gl.FLOAT,	// 要素のデータ型
		false,		// データを正規化するかどうか
		0,			// 要素のバイトサイズ、0は要素のデータ型と同サイズ
		0			// 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(vcol_loc);
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

	const loc = gl.getUniformLocation(prog, 'uProjectionMatrix');
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
function draw_color_square()
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
		gl.TRIANGLE_STRIP,  // mode
		0,                  // offset
		4                   // vertexCount
		);
}

// draw_color_square() を s03.draw() という名前で公開する
return { draw: draw_color_square };

})();
