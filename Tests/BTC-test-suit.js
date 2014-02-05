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

	dsc("`if` statement", function () {
		it("should work if the `if` condition is true", function () {
			var src = "@if(c) IF OK @elseif(d) ElseIf OK @else Else OK @endif",
				cmp = btc(src, btfm),
				injection = [
					"var c=true, d=false;",
					"var c=true, d=true;",
				];				
			for (i in injection) {
				fn = new Function(injection[i]+cmp);
				expect(fn()).to.be.equal(' IF OK ');
			}
		});

		it('should work if `if` condition is not true but the `elseif` condition is true', function () {
			var src = "@if(c) IF OK @elseif(d) ElseIf OK @else Else OK @endif",
				cmp = btc(src, btfm),
				injection = "var c=false, d=true;",
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal(' ElseIf OK ');
		});
		
		it('should work if `if` condition is not true and the `elseif` condition is not true either', function () {
			var src = "@if(c) IF OK @elseif(d) ElseIf OK @else Else OK @endif",
				cmp = btc(src, btfm),
				injection = "var c=false, d=false;",
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal(' Else OK ');
		});
	});

	dsc("`unless` statement", function () {
		it("should replace `unless` containments if the condition have been meet", function () {
			var src = "@unless(c) Unless OK @endunless",
				cmp = btc(src, btfm),
				injection = "var c=true;";
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal(' Unless OK ');
		});

		it("should not replace `unless` containments if the condition is not true", function () {
			var src = "@unless(c) Unless OK @endunless",
				cmp = btc(src, btfm),
				injection = "var c=false;",
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal('');
		});
	});

	it("should compile `for` statement clearly", function () {
		var src = "@for(i=0; i<5; i=i+1) For OK @endfor",
			cmp = btc(src, btfm),
			fn = new Function(cmp);
		expect(fn()).to.be.equal(' For OK  For OK  For OK  For OK  For OK ');
	});

	dsc("`foreach` statement", function () {
		it("should compile when using Lists", function () {
			var src = "@foreach( users as user )	@if(user.status === 'admin')		welcome admin, {{ user.name }}	@elseif (user.status === 'reseller' )		welcome reseller, {{user.name}}	@else		welcome user, {{user.name }}@endif @endforeach",
				cmp = btc(src, btfm),
				injection = "var users = [ { 'name': 'ali' }, { 'name': 'hasan' }, { 'name': 'taghi' }];";
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal('\t\t\twelcome user, ali \t\t\twelcome user, hasan \t\t\twelcome user, taghi ');
		});
		
		it("should compile when using Objects", function () {
			var src = "@foreach( users as user )	@if(user.status === 'admin')		welcome admin, {{ user.name }}	@elseif (user.status === 'reseller' )		welcome reseller, {{user.name}}	@else		welcome user, {{user.name }}@endif @endforeach",
				cmp = btc(src, btfm),
				injection = "var users = { 'ali':{ 'name': 'ali' }, 'hasan':{ 'name': 'hasan' }, 'taghi':{ 'name': 'taghi' }};";
				fn = new Function(injection+cmp);
			expect(fn()).to.be.equal('\t\t\twelcome user, ali \t\t\twelcome user, hasan \t\t\twelcome user, taghi ');
		});
	});

	it("should compile `while` statement clearly", function () {
		var src = "@while(c) @{{c-=1;}}While OK @endfor",
			cmp = btc(src, btfm),
			fn = new Function("var c=5;"+cmp);
		expect(fn()).to.be.equal(' While OK  While OK  While OK  While OK  While OK ');
	});

	dsc("substitution", function () {
		it("should echo", function () {
			var src = "{{c}}",
				cmp = btc(src, btfm),
				fn = new Function("var c='this is a test';"+cmp);
			expect(fn()).to.be.equal('this is a test');
		});

		it("should purify", function () {
			var src = "{{{c}}}",
				cmp = btc(src, btfm),
				fn = new Function("var c='<html>';"+cmp);
			expect(fn()).to.be.equal('&lt;html&gt;');
		});
	});
});