// test.js

// 関数 hoge(x), fuga(x) を定義する
function hoge(x) { return "HOGE " + x; }
function fuga(x) { return "FUGA " + x; }

// 通常の「名前付きエクスポート」方式で、エクスポートする
export { hoge, fuga };

// ひとつだけ、「デフォルトエクスポート」することが可能
export default hoge;
