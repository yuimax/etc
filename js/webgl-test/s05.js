// 課題：3D立体の描画

var s05 = (function() {

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
	// 立方体の頂点データ
	const vertex_positions = new Float32Array([
		// 前面
		-1.0, -1.0,	 1.0,
		 1.0, -1.0,	 1.0,
		 1.0,  1.0,	 1.0,
		-1.0,  1.0,	 1.0,
		// 背面
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		// 上面
		-1.0,  1.0, -1.0,
		-1.0,  1.0,	 1.0,
		 1.0,  1.0,	 1.0,
		 1.0,  1.0, -1.0,
		// 底面
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,	 1.0,
		-1.0, -1.0,	 1.0,
		// 右側面
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,	 1.0,
		 1.0, -1.0,	 1.0,
		// 左側面
		-1.0, -1.0, -1.0,
		-1.0, -1.0,	 1.0,
		-1.0,  1.0,	 1.0,
		-1.0,  1.0, -1.0,
	]);

	// 頂点座標バッファを作り、"aVertexPosition"という名前で属性を設定する
	const vertex_position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW);
	const vpos_loc = gl.getAttribLocation(prog, 'aVertexPosition');
	gl.vertexAttribPointer(
		vpos_loc,	// "aVertexPosition" の属性ロケーション
		3,			// 頂点あたりの要素数
		gl.FLOAT,	// 要素のデータ型（g.FLOATは32ビット浮動小数点数）
		false,		// 正規化するか（gl.FLOATの場合は無意味）
		0,			// 頂点ごとのバイトサイズ、0だと要素のデータ型と同サイズ
		0			// 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(vpos_loc);

	//------------------------------------------------
	// 頂点ごとの色データ
	const vertex_colors = new Float32Array([
		// 前面：白
		1.0,  1.0,	1.0,  1.0,
		1.0,  1.0,	1.0,  1.0,
		1.0,  1.0,	1.0,  1.0,
		1.0,  1.0,	1.0,  1.0,
		// 背面：赤
		1.0,  0.0,	0.0,  1.0,
		1.0,  0.0,	0.0,  1.0,
		1.0,  0.0,	0.0,  1.0,
		1.0,  0.0,	0.0,  1.0,
		// 上面：緑
		0.0,  1.0,	0.0,  1.0,
		0.0,  1.0,	0.0,  1.0,
		0.0,  1.0,	0.0,  1.0,
		0.0,  1.0,	0.0,  1.0,
		// 底面：青
		0.0,  0.0,	1.0,  1.0,
		0.0,  0.0,	1.0,  1.0,
		0.0,  0.0,	1.0,  1.0,
		0.0,  0.0,	1.0,  1.0,
		// 右側面：黄
		1.0,  1.0,	0.0,  1.0,
		1.0,  1.0,	0.0,  1.0,
		1.0,  1.0,	0.0,  1.0,
		1.0,  1.0,	0.0,  1.0,
		// 左側面：紫
		1.0,  0.0,	1.0,  1.0,
		1.0,  0.0,	1.0,  1.0,
		1.0,  0.0,	1.0,  1.0,
		1.0,  0.0,	1.0,  1.0,
	]);

	// 頂点色バッファを作り、"aVertexColor"という名で属性を設定する
	const vertex_color_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_colors, gl.STATIC_DRAW);
	const vcol_loc = gl.getAttribLocation(prog, 'aVertexColor');
	gl.vertexAttribPointer(
		vcol_loc,	// "aVertexPosition" の属性ロケーション
		4,			// 頂点あたりの要素数
		gl.FLOAT,	// 要素のデータ型
		false,		// 正規化するか
		0,			// 要素のバイトサイズ
		0			// 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(vcol_loc);

	//------------------------------------------------
	// 頂点のインデクスの配列
	// 頂点3つで三角形、三角形2つで立方体の面を作る。
	// メモ： indices は index の複数形
	const vertex_indices = new Uint16Array([
		0,	1,	2,		0,	2,	3,	  // 前面
		4,	5,	6,		4,	6,	7,	  // 背面
		8,	9,	10,		8,	10, 11,	  // 上面
		12, 13, 14,		12, 14, 15,	  // 底面
		16, 17, 18,		16, 18, 19,	  // 右側面
		20, 21, 22,		20, 22, 23,	  // 左側面
	]);

	// 頂点インデクスバッファを作る
	const vertex_index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertex_indices, gl.STATIC_DRAW);
}

// カメラ視野角の設定
function set_projection(gl, prog)
{
	const projection_matrix = mat4.create();

	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	mat4.perspective(
		projection_matrix,
		45 * Math.PI / 180,		// fieldOfView
		aspect,					// aspect
		0.1,					// zNear
		100.0					// zFar
		);

	let loc = gl.getUniformLocation(prog, 'uProjectionMatrix');
	gl.uniformMatrix4fv(loc, false, projection_matrix);
}

// モデルビューの設定
function set_modelview(gl, prog, x_ratio, y_ratio, z_ratio)
{
	const modelview_matrix = mat4.create();

	// 平行移動
	mat4.translate(
		modelview_matrix,
		modelview_matrix,
		[0.0, 0.0, -5.0]
		);

	// X軸回転
	mat4.rotate(
		modelview_matrix,
		modelview_matrix,
		Math.PI * 2 * x_ratio,
		[1.0, 0.0, 0.0]
		);

	// Y軸回転
	mat4.rotate(
		modelview_matrix,
		modelview_matrix,
		Math.PI * 2 * y_ratio,
		[0.0, 1.0, 0.0]
		);

	// Z軸回転
	mat4.rotate(
		modelview_matrix,
		modelview_matrix,
		Math.PI * 2 * z_ratio,
		[0.0, 0.0, 1.0]
		);
		
	let loc = gl.getUniformLocation(prog, 'uModelViewMatrix');
	gl.uniformMatrix4fv(loc, false, modelview_matrix);
}

// アニメーション制御用
const c4 = create_cyclic_adder(4000); // 周期4000の周回加算器
const c5 = create_cyclic_adder(5000); // 周期5000の周回加算器
const c6 = create_cyclic_adder(6000); // 周期6000の周回加算器

// 描画の実行
function animate_cube()
{
	// 描画の準備
	const gl = init_context('img');	// WebGLコンテキストを初期化
	const prog = init_prog(gl);		// シェーダの作成
	set_buffers(gl, prog);			// 図形データ（座標＋色）
	set_projection(gl, prog);		// カメラ視野角

	//-------------------------------------------
	// ループ処理

	// 現在の時刻（1970/1/1から経過したミリ秒）
	let time = Math.floor(Date.now());
	
	// ループ本体
	function worker()
	{
		// アニメーション実行中でなければすぐ終了
		if (!ANI.working()) {
			return;
		}
		
		// 前回からの経過時間（ミリ秒）を得る
		let dt = Math.floor(Date.now()) - time;
		time += dt;

		// 進行度を進める（全体として60秒で周回）
		c4.add(dt);	 // 4秒で周回
		c5.add(dt);	 // 5秒で周回
		c6.add(dt);	 // 6秒で周回
		
		// 進行度を角度として表示する
		TXT.print(
			' Rx=' + c4.degree() +
			' Ry=' + c5.degree() +
			' Rz=' + c6.degree()
			);

		// モデルを回転させる
		set_modelview(gl, prog, c4.ratio, c5.ratio, c6.ratio);

		// 画面クリア
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// 描画を実行する： 立体なので drawElements() を使う
		gl.drawElements(
			gl.TRIANGLES,		// mode
			36,					// vertexCount
			gl.UNSIGNED_SHORT,	// type
			0					// offset
			);

		// 次回のトリガー
		window.requestAnimationFrame(worker);
	}

	// worker()を開始する
	if (ANI.start()) {
		window.requestAnimationFrame(worker);
	}
}

// animate_cube() を s05.draw() という名前で公開する
return { draw: animate_cube };

})();
