// 課題：照明

var s07 = (function() {

// シェーダの初期化
function init_prog(gl)
{
	// 頂点シェーダのソースコード
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		varying highp vec2 vTextureCoord;
		void main(void) {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vTextureCoord = aTextureCoord;
		}
	`;

	// フラグメントシェーダのソースコード
	const fsSource = `
		varying highp vec2 vTextureCoord;
		uniform sampler2D uSampler;
		void main(void) {
			gl_FragColor = texture2D(uSampler, vTextureCoord);
		}
	`;

	// シェーダをコンパイルする
	const prog = create_prog(gl, vsSource, fsSource);
	gl.useProgram(prog);

	return prog;
}

// テクスチャ
var my_texture = null;

// テクスチャを作り画像を読み込む
function load_texture(gl)
{
	// 作成済みならそれを返す
	if (gl.isTexture(my_texture)) {
		return my_texture;
	}

	// 新規作成
	my_texture = gl.createTexture();

	// とりあえずダミーの画像を割り当てる
	const dummy_data = new Uint8Array([0, 0, 255, 255]); // 青の1ピクセル
	gl.bindTexture(gl.TEXTURE_2D, my_texture);
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // level
		gl.RGBA,            // internalFormat
		1,                  // width
		1,                  // height
		0,                  // border
		gl.RGBA,            // srcFormat
		gl.UNSIGNED_BYTE,   // srcType
		dummy_data          // pixels
		);

	// 画像をロードする
	const image_url = "banzai.png";
	const img = new Image();
	img.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, my_texture);
		gl.texImage2D(
			gl.TEXTURE_2D,      // target
			0,                  // level
			gl.RGBA,            // internalformal
			gl.RGBA,            // format
			gl.UNSIGNED_BYTE,   // type
			img                 // ImageData
			);
		if (is_power_of_2(img.width) && is_power_of_2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	img.src = image_url;

	return my_texture;
}

// データの設定
function set_buffers(gl, prog)
{
	//------------------------------------------------
	// 立方体の頂点データ
	const vertex_positions = new Float32Array([
		// 前面
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		// 背面
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		// 上面
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		// 底面
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		// 右側面
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		// 左側面
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	]);

	// 頂点座標バッファを作る
	const vertex_position_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW);

	// 頂点座標バッファの属性を設定する
	// gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
	let i = gl.getAttribLocation(prog, 'aVertexPosition');
	gl.vertexAttribPointer(
		i,          // 「頂点座標バッファ」のロケーション
		3,          // 頂点あたりの要素数（★立体なので3）
		gl.FLOAT,   // 要素のデータ型（g.FLOATは32ビット浮動小数点数）
		false,      // 正規化するか（gl.FLOATの場合は無意味）
		0,          // 頂点ごとのバイトサイズ、0だと要素のデータ型と同サイズ
		0           // 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(i);

	//------------------------------------------------
	// 面データ（頂点3つで、三角形を定義する）
	// メモ： indices は index の複数形
	const indices = new Uint16Array([
		0,  1,  2,      0,  2,  3,    // 前面
		4,  5,  6,      4,  6,  7,    // 背面
		8,  9,  10,     8,  10, 11,   // 上面
		12, 13, 14,     12, 14, 15,   // 底面
		16, 17, 18,     16, 18, 19,   // 右側面
		20, 21, 22,     20, 22, 23    // 左側面
	]);

	// 面バッファを作る
	const index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	//------------------------------------------------
	// テクスチャの読み込み
	const texture = load_texture(gl);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	i = gl.getUniformLocation(prog, 'uSampler');
	gl.uniform1i(i, 0);
	
	//------------------------------------------------
	// テクスチャの座標データ
	const texture_coords = new Float32Array([
		// 前面
		1.0,  1.0,
		0.0,  1.0,
		0.0,  0.0,
		1.0,  0.0,
		// 背面
		0.0,  1.0,
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		// 上面
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// 底面
		0.0,  1.0,
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		// 右側面
		1.0,  1.0,
		0.0,  1.0,
		0.0,  0.0,
		1.0,  0.0,
		// 左側面
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		0.0,  0.0,
	]);

	const texture_coord_buffer =  gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, texture_coords, gl.STATIC_DRAW);

	i = gl.getAttribLocation(prog, "aTextureCoord");
	gl.vertexAttribPointer(
		i,          // 「テクスチャ座標バッファ」のロケーション
		2,          // 頂点あたりの要素数
		gl.FLOAT,   // 要素のデータ型（g.FLOATは32ビット浮動小数点数）
		false,      // 正規化するか（gl.FLOATの場合は無意味）
		0,          // 頂点ごとのバイトサイズ、0だと要素のデータ型と同サイズ
		0           // 最初の頂点のバイト位置
		);
	gl.enableVertexAttribArray(i);
}

// カメラ視野角の設定
function set_projection(gl, prog)
{
	const projection_matrix = mat4.create();

	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	mat4.perspective(
		projection_matrix,
		45 * Math.PI / 180,     // fieldOfView
		aspect,                 // aspect
		0.1,                    // zNear
		100.0                   // zFar
		);

	let i = gl.getUniformLocation(prog, 'uProjectionMatrix');
	gl.uniformMatrix4fv(i, false, projection_matrix);
}

// モデルビューの設定
function set_modelview(gl, prog, x_ratio, y_ratio, z_ratio)
{
	const modelview_matrix = mat4.create();

	// 平行移動
	mat4.translate(
		modelview_matrix,
		modelview_matrix,
		[0.0, 0.0, -6.0]
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
		
	let i = gl.getUniformLocation(prog, 'uModelViewMatrix');
	gl.uniformMatrix4fv(i, false, modelview_matrix);
}

// アニメーション制御用
const c4 = create_cyclic_adder(4000); // 周期4000の周回加算器
const c5 = create_cyclic_adder(5000); // 周期5000の周回加算器
const c6 = create_cyclic_adder(6000); // 周期6000の周回加算器

// 描画の実行
function draw_texture()
{
	// 描画の準備
	const gl = init_context('img'); // WebGLコンテキストを初期化
	const prog = init_prog(gl);     // シェーダの作成
	set_buffers(gl, prog);          // 図形データ（座標＋テクスチャ）
	set_projection(gl, prog);       // カメラ視野角

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
		c4.add(dt);  // 4秒で周回
		c5.add(dt);  // 5秒で周回
		c6.add(dt);  // 6秒で周回
		
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
	
		// 描画を実行する
		gl.drawElements(
			gl.TRIANGLES,
			36,                 // vertexCount
			gl.UNSIGNED_SHORT,  // type
			0                   // offset
			);

		// 次回のトリガー
		window.requestAnimationFrame(worker);
	}

	// worker()を開始する
	if (ANI.start()) {
		window.requestAnimationFrame(worker);
	}
}

// draw_texture() を s07.draw() という名前で公開する
return { draw: draw_texture };

})();
