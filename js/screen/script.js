function print(id, text) {
    document.getElementById(id).innerHTML = text;
}

function dp2px(x) {
    return Math.floor(x * window.devicePixelRatio / 2) * 2;
}

function size(width, height) {
    let result = width + ' x ' + height;
    if (window.devicePixelRatio != 1) {
        result += " [dip] (" + dp2px(width) + ' x ' + dp2px(height) + " [px])";
    } else {
        result += " [px]";
    }
    return result;
}

function orientation() {
    return screen.orientation.type + ' (angle=' + screen.orientation.angle + ')' ;
}

function screen_check() {
	print('scr_orie', orientation());
	print('scr_size', size(screen.width, screen.height));
	print('win_size', size(window.innerWidth, window.innerHeight));
	print('scr_orie_type', screen.orientation.type);
	print('scr_orie_angle', screen.orientation.angle);
	print('scr_width', screen.width);
	print('scr_height', screen.height);
	print('win_width', window.innerWidth);
	print('win_height', window.innerHeight);
	print('win_dp_ratio', window.devicePixelRatio);
}

window.onresize = screen_check;

