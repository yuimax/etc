//-----------------------------------------
// ●ユーティリティ

// ソース出力
function src(text) {
	srcarea.value = text + '\n';
}

// ログ出力
function log(text) {
	function pad_zero(len, num) {
		return num.toString().padStart(len, '0');
	}
	const dt = new Date(); // 現在の時刻
	const hour = pad_zero(2, dt.getHours());
	const min  = pad_zero(2, dt.getMinutes());
	const sec  = pad_zero(2, dt.getSeconds());
	const msec = pad_zero(3, dt.getMilliseconds());
	logarea.value += `[${hour}:${min}:${sec}.${msec}] ${text}\n`;
}

// ソースとログをクリア
function clear() {
	srcarea.value = '';
	logarea.value = '';
}

//-----------------------------------------
// ●コールバックの連鎖
function test_01()
{
	const code = `
function slowjob(msec, callback) {
  setTimeout(callback, msec);
}
log('start');
slowjob(1000, function() {
  log('1/3');
  slowjob(1000, function() {
    log('2/3');
    slowjob(1000, function() {
      log('3/3');
      log('end');
    });
  });
});`;

	clear();
	src('●コールバックの連鎖' + code);
	eval(code);
}

//-----------------------------------------
// ●Promiseの利用
function test_02()
{
	const code = `
function slowjob(msec, func, arg) {
  return new Promise((ok, ng) => {
    setTimeout(() => { func(arg); ok(); }, msec);
  });
}
Promise.resolve()
.then(() => log('start'))
.then(() => slowjob(1000, log, '1/3'))
.then(() => slowjob(1000, log, '2/3'))
.then(() => slowjob(1000, log, '3/3'))
.then(() => log('end'))
;`;

	clear();
	src('●Promiseの利用' + code);
	eval(code);
}

//-----------------------------------------
// ●awaitの利用
function test_03()
{
	const code = `
function slowjob(msec, func, arg) {
  return new Promise((ok, ng) => {
    setTimeout(() => { func(arg); ok(); }, msec);
  });
}
async function asyncJob() {
  log('start');
  await slowjob(1000, log, '1/3');
  await slowjob(1000, log, '2/3');
  await slowjob(1000, log, '3/3');
  log('end');
}
asyncJob();`;

	clear();
	src('●awaitの利用' + code);
	eval(code);
}

//-----------------------------------------
// ●どこで失敗してもcatch()へ
let counter = 0;
function test_04()
{
	++counter;
	const code = `
function trial(id) {
  return new Promise((ok, ng) => {
    if (counter % 4 != id) {
      log('trial ' + id + ' = ok'); ok();
    } else {
      log('trial ' + id + ' = NG'); ng(id);
    }
  });
}
Promise.resolve()
.then(() => trial(1))
.then(() => trial(2))
.then(() => trial(3))
.catch((id) => log('catch ' + id));`;

	clear();
	src('●どこで失敗してもcatch()へ' + code);
	eval(code);
}
