/**
 *  テキストを要素内に表示する
 *  @param {string} id - 要素のid
 *  @param {string} text - 任意のテキスト
 */
function print(id, text) {
	const e = document.getElementById(id);
	if ('value' in e) e.value = text; else e.innerHTML = text;
}

/**
 *  Webサイトから取得したテキストを要素内に表示する
 *  @param {string} id - 要素のid
 *  @param {string} url - WebサイトのURL
 */
function get_text(id, url) {
	const xhr = new XMLHttpRequest();
	xhr.responseType = 'text';
	xhr.onloadstart = function(e) {};
	xhr.onerror = function(e) { print(id, 'error'); };
	xhr.onabort = function(e) { print(id, 'abort'); };
	xhr.ontimeout = function(e) { print(id, 'timeout'); };
	xhr.onload = function(e) { print(id, this.responseText); };
	xhr.onloadend = function(e) {};
	xhr.open('GET', url, true);
	xhr.send();
}

/**
 *  すべての表示をクリアする
 */
function init()
{
	print('ipv4', '');
	print('ipv6', '');
}

/**
 *  IPアドレスを取得して表示する
 */
function check()
{
	get_text('ipv4', 'https://ipv4.pilikala.net/');
	get_text('ipv6', 'https://ipv6.pilikala.net/');
}
