//	BTFM Test Suit
global.__TESTING = true;

var 
expect = require("chai").expect,
blade = require("../blade.js"),
btfm = new blade.__PRIVATE.BTFM("template_dir");

describe("Blade.js Template File Manager", function () {

	/*describe("resolveTemplateTagName(template_name)", function () {

		it("shall return a valid css selector query to pas through `document.querySelector()`", function (){
			expect(btfm.resolveTemplateTagName("template_name")).to.be.equal("div#template_dir > div.template_name");
			expect(btfm.resolveTemplateTagName("site.template_name")).to.be.equal("div#template_dir > div#site > div.template_name");
			expect(btfm.resolveTemplateTagName("site.pages.template_name")).to.be.equal("div#template_dir > div#site > div#pages > div.template_name");
		});
		
	});


	describe("resolveTemplateURL(template_name)", function () {

		it("shall return a valid and encoded url of templates", function (){
			expect(btfm.resolveTemplateURL("template_name")).to.be.equal("template_dir%2Ftemplate_name");
			expect(btfm.resolveTemplateURL("site.template_name")).to.be.equal("template_dir%2Fsite%2Ftemplate_name");
			expect(btfm.resolveTemplateURL("site.pages.template_name")).to.be.equal("template_dir%2Fsite%2Fpages%2Ftemplate_name");
		});
		
	});*/

	describe("readTemplate", function () {
		describe("Loading from file system", function () {
			it("Shall read and return the legitimate template", function () {
				//template with name `template_name` contains `template_name`
				expect(btfm.readTemplate("template_name'")).to.be.equal("template_dir/template_name.blade.js");
				expect(btfm.readTemplate("template_name\"")).to.be.equal("template_dir/template_name.blade.js");
				expect(btfm.readTemplate("  template_name'")).to.be.equal("template_dir/template_name.blade.js");
				expect(btfm.readTemplate("(template_name")).to.be.equal("template_dir/template_name.blade.js");
				expect(btfm.readTemplate("'template_name')")).to.be.equal("template_dir/template_name.blade.js");
				expect(btfm.readTemplate("\"template_name')")).to.be.equal("template_dir/template_name.blade.js");
				//template with address `./site/template_name.blade.js` contains `site.template_name`
				expect(btfm.readTemplate("site.template_name'")).to.be.equal("template_dir/site/template_name.blade.js");
				expect(btfm.readTemplate("site.template_name\"")).to.be.equal("template_dir/site/template_name.blade.js");
				expect(btfm.readTemplate("  site.template_name'")).to.be.equal("template_dir/site/template_name.blade.js");
				expect(btfm.readTemplate("(site.template_name")).to.be.equal("template_dir/site/template_name.blade.js");
				expect(btfm.readTemplate("'site.template_name')")).to.be.equal("template_dir/site/template_name.blade.js");
				expect(btfm.readTemplate("\"site.template_name')")).to.be.equal("template_dir/site/template_name.blade.js");
				//template with name `./site/admin/template_name.blade.js` contains `site.admin.template_name`
				expect(btfm.readTemplate("site.admin.template_name'")).to.be.equal("template_dir/site/admin/template_name.blade.js");
				expect(btfm.readTemplate("site.admin.template_name\"")).to.be.equal("template_dir/site/admin/template_name.blade.js");
				expect(btfm.readTemplate("  site.admin.template_name'")).to.be.equal("template_dir/site/admin/template_name.blade.js");
				expect(btfm.readTemplate("(site.admin.template_name")).to.be.equal("template_dir/site/admin/template_name.blade.js");
				expect(btfm.readTemplate("'site.admin.template_name')")).to.be.equal("template_dir/site/admin/template_name.blade.js");
				expect(btfm.readTemplate("\"site.admin.template_name')")).to.be.equal("template_dir/site/admin/template_name.blade.js");
			});

			it("shall return an exception if the template dose not exist", function () {
				var exception;
				try {
					btfm.readTemplate("fake_template_name");
				}
				catch (e) {
					exception = e;
				}
				expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
					  .and.to.have.deep.property('err.message', "Template does not exist: template_dir/fake_template_name.blade.js");
			});

			it("shall return an exception if the template is not readable", function () {
				console.log('#make sure that the `template_dir/no_perrmision_template_name.blade.js` is unreadable to test or comment this test.');
				var exception;
				try {
					btfm.readTemplate("no_perrmision_template_name");
				}
				catch (e) {
					exception = e;
				}
				expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH);
			});

			it("shall return an exception if the template is empty", function () {
				var exception;
				try {
					btfm.readTemplate("empty_template_name");
				}
				catch (e) {
					exception = e;
				}
				expect(exception).to.be.an.instanceof(blade.__PRIVATE.BEH)
					  .and.to.have.deep.property('err.message', "Empty Template: template_dir/empty_template_name.blade.js");
			});
		});

	});

});