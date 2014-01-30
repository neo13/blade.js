global.__TESTING = true;

var 
expect = require("chai").expect,
blade = require("../blade.js"),
btc = blade.__PRIVATE.BTC,
dsc = describe,
btfm = new blade.__PRIVATE.BTFM("template_dir");

dsc("Blade.js Template Compiler", function () {

	it("if template is vanilla html it should pass it", function() {
		var src = btfm.readTemplate('footer'),
			cmp = btc(src, btfm),
			fn = new Function(cmp);
		expect(fn()).to.be.equal('<div class="footer">\r\n	<p>This is Footer</p>\r\n</div>');
	});

	it("should resolve multiple `include` statement", function () {
		var src = btfm.readTemplate('base'),
			cmp = btc(src, btfm),
			fn = new Function(cmp);
		expect(fn()).to.be.equal('<html>\r\n<head>\r\n	<title>This is a template test</title>\r\n</head>\r\n<body>\r\n	<div class="header">This is the header!</div>\r\n	<div class="contents"></div>\r\n	<div class="footer">\r\n	<p>This is Footer</p>\r\n</div>\r\n</body>\r\n</html>');
	});

});