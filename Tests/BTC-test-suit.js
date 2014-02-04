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

	dsc("should return exception if `include` statement points to invalid template", function () {
		it("should return exception if template is empty", function () {
			var src = "@include('empty_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Empty Template: template_dir/empty_template_name.blade.js");
		});

		it("should return exception if template dose not exist", function () {
			var src = "@include('fake_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Template does not exist: template_dir/fake_template_name.blade.js");
		});

		it("should return exception if template is not accessible", function () {
			var src = "@include('no_permission_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH);
				  
		});
		
	});
	
	it("should resolve nested `extends` statement", function () {
		var src = btfm.readTemplate('site.admin.admin_extends'),
			cmp = btc(src, btfm),
			fn = new Function(cmp);
			expect(fn()).to.be.equal('<html>\r\n<head>\r\n	<title>This is a template test</title>\r\n</head>\r\n<body>\r\n	<div class="header">This is the header!</div>\r\n	<div class="contents"></div>\r\n	<div class="footer">\r\n	<p>This is Footer</p>\r\n</div>\r\n</body>\r\n</html>');
	});

	dsc("should return exception if `extends` statement points to invalid template", function () {
		it("should return exception if template is empty", function () {
			var src = "@extends('empty_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Empty Template: template_dir/empty_template_name.blade.js");
		});

		it("should return exception if template dose not exist", function () {
			var src = "@extends('fake_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Template does not exist: template_dir/fake_template_name.blade.js");
		});

		it("should return exception if template is not accessible", function () {
			var src = "@extends('no_permission_template_name')",
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH);
				  
		});

		it("should return exception if template is extending itself", function () {
			var src = btfm.readTemplate('extend_itself'),
			exception;
			try {
				btc(src, btfm);
			}
			catch (e) {
				exception = e;
			}
			expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
			.and.to.have.deep.property('err.message', "Inheritance Logic Error: Can't extend a template inside itself!");  
		});
	});

	it("should return exception when multiple `extends` is used", function () {
		var src = "@extends('base')\n @extends(footer)",
		exception;
		try {
			btc(src, btfm);
		}
		catch (e) {
			exception = e;
		}
		expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
			  .and.to.have.deep.property('err.message', "Template Error: Can't Inheritance from more that one template");
	});

	it("should resolve `yield` and `section` properly", function () {
		var src = btfm.readTemplate('site.admin.index'),
			cmp = btc(src, btfm),
			fn = new Function(cmp);
		expect(fn()).to.be.equal('<html>\r\n<head>\r\n	<title>This is a template test</title>\r\n</head>\r\n<body>\r\n	<div class="header">This is the header!</div>\r\n	<div class="contents">\r\n	this is site.base\r\n\t\r\n	this is site.admin.index header\r\n\r\n\t\r\n	this is site.admin.index footer\r\n\r\n\t\r\n	this is the copyright\r\n\r\n</div>\r\n	<div class="footer">\r\n	<p>This is Footer</p>\r\n</div>\r\n</body>\r\n</html>');
	});

	it("should return exception when using two `section` pointing to one `yield`", function () {
		var src = btfm.readTemplate('site.admin.two_section'),
		exception;
		try {
			btc(src, btfm);
		}
		catch (e) {
			exception = e;
		}
		expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
			  .and.to.have.deep.property('err.message', "Template Logical Error: More than one `@section` with the same id.\n*Notice* id shall be unique.");
	});

	it("should compile `if` statement", function () {
		var src = "@if(c) IF OK @elseif(d) ElseIf OK @else Else OK @endif",
			cmp = btc(src, btfm),
			injection = "var c=true, d=false;",
			fn = new Function(injection+cmp);
		expect(fn()).to.be.equal(' IF OK ');
		injection = "var c=false, d=true;",
		fn = new Function(injection+cmp);
		expect(fn()).to.be.equal(' ElseIf OK ');
		injection = "var c=false, d=false;",
		fn = new Function(injection+cmp);
		expect(fn()).to.be.equal(' Else OK ');
	});

	
});