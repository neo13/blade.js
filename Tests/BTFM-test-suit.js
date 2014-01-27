//	BTFM Test Suit
global.__TESTING = true;

var 
expect = require("chai").expect,
blade = require("../blade.js"),
btfm = new blade.__PRIVATE.BTFM("template_dir");

describe("Blade.js Template File Manager", function () {

	describe("refineTemplateName(template_name)", function () {

		it("Shall return if the template name have no problem", function () {
			expect(btfm.refineTemplateName("template_name")).to.be.equal("template_name");
		});

		it("Shall return the clean name", function () {
			expect(btfm.refineTemplateName("template_name'")).to.be.equal("template_name");
			expect(btfm.refineTemplateName("template_name\"")).to.be.equal("template_name");
			expect(btfm.refineTemplateName("  template_name'")).to.be.equal("template_name");
			expect(btfm.refineTemplateName("(template_name")).to.be.equal("template_name");
			expect(btfm.refineTemplateName("'template_name')")).to.be.equal("template_name");
			expect(btfm.refineTemplateName("\"template_name')")).to.be.equal("template_name");
		});

		it("Shall return clean nested name", function () {
			expect(btfm.refineTemplateName("'site.template_name')")).to.be.equal("site.template_name");
		})

	});

	describe("resolveTemplateFileName(template_name)", function () {
		//	we assume that the template name passed to this function is a valid function
		it("Shall return template address if the template is in main template directory", function () {
			expect(btfm.resolveTemplateFileName("template_name")).to.be.equal("template_dir/template_name.blade.js");
		});

		it("Shall return nested template addresses", function () {
			expect(btfm.resolveTemplateFileName("site.template_name")).to.be.equal("template_dir/site/template_name.blade.js");
			expect(btfm.resolveTemplateFileName("site.pages.template_name")).to.be.equal("template_dir/site/pages/template_name.blade.js");
		});
	});

	describe("resolveTemplateTagName(template_name)", function () {

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
		
	});

	describe("loadTemplateFile(file_name)", function (){

		it("shall read and return files that exsits and are valid", function () {
			expect(btfm.loadTemplateFile("template_dir/template_name.blade.js")).to.be.equal("template_dir/template_name.blade.js");
			expect(btfm.loadTemplateFile("template_dir/site/template_name.blade.js")).to.be.equal("template_dir/site/template_name.blade.js");
			expect(btfm.loadTemplateFile("template_dir/site/admin/template_name.blade.js")).to.be.equal("template_dir/site/admin/template_name.blade.js");
		});

		it("shall return an exception if the file is not exsits", function () {
			expect(btfm.loadTemplateFile("template_dir/no_template_name.blade.js"))
				  .to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Template does not existes: template_dir/no_template_name.blade.js");
		});

		it("shall return an exception if the file is not readable or empty", function () {
			expect(btfm.loadTemplateFile("template_dir/no_perrmision_template_name.blade.js"))
				  .to.be.an.instanceof(blade.__PRIVATE.BEH);

			expect(btfm.loadTemplateFile("template_dir/empty_template_name.blade.js"))
				  .to.be.an.instanceof(blade.__PRIVATE.BEH)
				  .and.to.have.deep.property('err.message', "Empty Template: template_dir/empty_template_name.blade.js");
		});
		
	});

});


