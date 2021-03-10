//-------------------------------------
//  urlからのダウンロードを開始する。
//  完了を待たずにすぐ戻る。
//  ダウンロード完了時に、次のどちらかが実行される。
//    正常終了したとき - ok(mega_bps) 
//    エラー終了したとき - ng(error_message)
function download(url, ok, ng)
{
	let start_time = Date.now();
	let next_sec = 0;

	// データ取得開始時に実行
	function on_load_start(e) {
		progress.value = '';
		time.value = '';
		stat.value = '読み出し中';
	}

	// データ取得中、定期的に実行
	function on_progress(e) {
		let sec = (Date.now() - start_time) / 1000;
		if (sec >= next_sec) {
			progress.value = e.loaded + '/' + e.total;
			time.value = sec.toFixed(3) + ' [sec]';
			next_sec += 0.25;
		}
	}

	// 正常終了でも異常終了でも必ず実行
	function on_load_end(e) {
		// 経過時間を得る
		let sec = (Date.now() - start_time) / 1000;
		progress.value = e.loaded + '/' + e.total;
		time.value = sec.toFixed(3) + ' [sec]';

		// 終了ステータスを得る（取得できなれけば単に'error'とする）
		let xhr = e.target;
		let st = (xhr.status != 0) ? (xhr.status + ' ' + xhr.statusText) : 'error';
		stat.value = st;

		// 正常終了ならok()を実行、エラー終了ならng()を実行
		if (xhr.status == 200) {
			let megabps = e.loaded * 8 / sec / (1024 * 1024);
			ok(megabps);
		}
		else {
			ng(st);
		}
	}

	// XMLHttpRequestオブジェクトを作成
	const xhr = new XMLHttpRequest();
	xhr.responseType = 'arraybuffer';   // データ形式はバイト配列
	xhr.onloadstart = on_load_start;    // データ取得開始時に実行
	xhr.onprogress = on_progress;       // データ取得中、定期的に実行
	xhr.onloadend = on_load_end;        // 正常終了でも異常終了でも必ず実行

	xhr.open('GET', url, true);
	xhr.setRequestHeader('Pragma', 'no-cache');         // HTTP/1.0
	xhr.setRequestHeader('Cache-Control', 'no-cache');  // HTTP/1.1
	xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT'); // IE対応
	xhr.send(null);
}

//-------------------------------------
//  テスト
async function test()
{
	bstart.disabled = true;
	log.value = '';

	let name = (location.hostname == 'acax.web.fc2.com') ? 'Mandrill.png' : 'toxic.mp4';
	let url = '../../img/' + name;
	log.value += url + '\n';

	const result = [];
	for (let i = 0; i < 10; i++) {
		await new Promise((ok, ng) => {
			download(url, ok, ng);
		})
		.then((megabps) => {
			log.value += megabps.toFixed(3) + ' [Mbps]\n';
			result.push(megabps);
		})
		.catch((error_message) => {
			log.value += error_message + '\n';
		});
	}

	log.value += '-'.repeat(20) + '\n';
	result.sort();
	if (result.length >= 3) {
		result.pop();
		result.shift();
		log.value += '最大と最小を除く\n';
	}
	if (result.length > 0) {
		let ave = result.reduce((x, y) => x + y) / result.length;
		log.value += '平均=' + ave.toFixed(3) + ' [Mbps]\n';
	}

	bstart.disabled = false;
}

//-------------------------------------
//  すべての表示をクリアする
function init()
{
	log.value = '';
	progress.value = '';
	time.value = '';
	stat.value = '';
	bstart.disabled = false;
}
