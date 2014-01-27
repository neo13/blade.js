//			Blade.js ->-- under construction
//			http://bladejs.org
//			(C) 2014 neo13 (Ahmad Derakhshan) http://github.com/neo13
//			Under MIT license

(function () {

	"use strict";

	//	default environment is node.js
	//	supporting environments are node.js, browser, [todo]:phonegap 
	var __ENV = "nodejs",

	//	default template root for node.js is templates
	//	users can pass template roots as arguments to blade objects
		__ROOT = "./templates";

	//	
	//	Blade Main Object
	//		The main object that contains users accessible methods and objects
	//		If the script is running under node.js environment the Blade will stick itself to `exports` object
	//		or to `module.exports` object for the sake of legacy `require()` function. If the program is running
	//		under browser environment the Blade will stick itself to `window` global object.
	//		[todo]: Choose what kind of storage is used for reading template files. for node.js the default storage
	//		is file and for browser its DOM, How ever AJAX and pure text must be considered too.
	//		[issue][todo]: Syncron useage
	//	
	var blade = function (template_root) {
		
		if (typeof template_root === "string") {
			this.__ROOT = __ROOT = template_root;
		}

		//	This part of code is inspired by underscore.js (C) approach
		//	[todo]: Browser support is not implemented yet
		else if (typeof exports !== "undefined") {
			this.__ROOT = "./templates"; 
		}
		else {
			this.__ROOT = __ROOT = "#templates"
		}
	};

	//	This part of code is inspired by underscore.js (C) approach
	if (typeof exports !== "undefined") {
		if (typeof module !== "undefined" && module.exports) {
			exports = module.exports = blade;
		}
		exports.blade = blade;
	}
	else {
		//support for browsers
		window.blade = balde;
		__ENV = "browser";
	}

	var blade_p = blade.prototype;

	blade_p.__VERSION = "under construction";
	blade_p.__ENV = __ENV;

	//
	//	Blade Exception Handler Object (BEH)
	//		BEHO is created to handle exceptions that take place all over the library and pass them to user as a
	//		clear and understandable message, template or guide.
	//		[todo]: needs implementation 
	//		[todo]: all perivous BEH must be renewed 
	//
	function BEH (exception) {

		this.err = exception;

		this.trace = function () {
			//helps trace an error to its origin
		}

		this.render = function () {
			return this.err;
		}
	}

	//
	//	Blade Template Primitive Instance
	//		The main Template Object. The Template objects are created after a successful Compile of passed template
	//		in Template Making Process.
	//		Template objects contain a compiled source of template, variable injection tools, and template rendering
	//		functions. 
	//		[issue][need_test]: injecting functions to source?
	//
	function Template () {
		this.__injected = false;
		this.with = function (vars, values) {
			console.log(typeof vars);
			if ( typeof vars === "object") {
				for(var _v in vars) {
					if( vars[_v] instanceof Function) {
						this.src = "var "+_v+"="+vars[_v].toString()+";" + this.src;
					}
					else {
						this.src = "var "+_v+"="+JSON.stringify(vars[_v])+";" + this.src;
					}
				}
			}
			else if (typeof vars === "string") {
				if( values instanceof Function) {
						this.src = "var "+vars+"="+values.toString()+";" + this.src;
				}
				else {
					this.src = "var "+vars+"="+JSON.stringify(values)+";" + this.src;							
				}
			}
			else {
				return new BEH(new Error("Template Error: Invalid argument passed: `"+JSON.stringify(vars)+"`!"));
			}

			return this;
		};
		this.src = "";
		this.render = function() {
			try {
				var _fn = new Function(this.src);
			}
			catch (e) {
				//after test we shall now whats going wrong here and why
				return false;
			};

			return _fn();
		};
		return this;
	}

	//
	//	Blade Template File Manager (BTFM)
	//		This class is used to manage loading of raw template instances. If the script is running under node.js
	//		the default storage is FileSystem and for browser environment it is DOM. However the AJAX, cloud storage
	//		and etc. shall be considered to.
	//
	function BTFM (document_root, storage_type) {

		this.refineTemplateName = function (template_name) {
			return template_name.replace(/[\s\(\)\'\"]+/g, '');
		};

		this.resolveTemplateFileName = function (template_name) {
			return this.__ROOT + '/' + template_name.split('.').join("/") + '.blade.js';
		};

		this.resolveTemplateTagName = function (template_name) {
			//	the way this works is to let users create meaningfull nested templates using in thier html files
			//	users shall use `<div id="[document_root]"></div>` tag name to specify the root of templates
			//	for nested templates just a div#template_directory
			//	for the actual template a div.template_name
			//	[todo]: custom tag names
			template_name = template_name.split('.');
			if (template_name.length > 1) {
				return "div#" + this.__ROOT + " > div#" + template_name.slice(0,template_name.length-1).join(" > div#") + " > div." + template_name[template_name.length-1];
			}
			else {
			return "div#" + this.__ROOT + " > div." + template_name[template_name.length-1];	
			}
		};

		this.resolveTemplateURL = function (template_name) {
			//	this is used for when a template is supposed load from a url
			//	[todo]: http/https
			return encodeURIComponent(this.__ROOT + '/' + template_name.split('.').join("/"));
			
		};

		this.loadTemplateFile = function (file_name) {
			//	[todo]: browser based load and catch template file
			//	[todo]: phone gap based
			var fs = require('fs');

			if ( fs.existsSync(file_name) ) {
				try {
					var result = fs.readFileSync(file_name, 'utf-8');

					if( result ) {
						return result;
					}
					else {
						return new BEH(new Error("Empty Template: " + file_name));
					}
				}
				catch (e) {
					return new BEH(e);
				}
			}
			else {
				return new BEH(new Error("Template does not existes: " + file_name));
			}

		};

		this.loadTemplateTag = function (tag_name) {
			return document.querySelector(tag_name).innerHtml;
		},

		this.getTemplate = function (template_url) {

			if( XMLHttpRequest ){
				var xhr = new XMLHttpRequest();
			}
			else {
				try {
					var xhr = new ActiveXObject("Msxml2.XMLHTTP");
				}
				catch (e) {
					try {
						var xhr = new ActiveXObject("Microsoft.XMLHTTP");	
					}
					catch (e) {
						return new BEH(new Error("Blade Template File Manager Error: Your platform does not support Ajax requests."));
					}
				}
			}

			xhr.open("GET", template_url, false);

			try {
				xhr.send(null);
			}
			catch (e) {
				return new BEH(e);
			}

			if( xhr.readyState === 4) {
				return xhr.responseText;	
			}
		};

		this.readTemplate = function (template_name) {

			template_name = refineTemplateName(template_name);

			if ( this.__STORAGE === "FileSystem" ) {
				return loadTemplateFile(resolveTemplateFileName(template_name));
			}
			else if ( this.__STORAGE === "DOM") {
				return loadTemplateTag(resolveTemplateTagName(template_name));
			}
			else {
				return getTemplate(resolveTemplateURL(template_name));
			}

		}

		this.__ROOT = document_root || "./templates";
		//	[todo]: Other type of storages 
		this.__STORAGE = "FileSystem";

	}

	//
	//	Blade Template Compiler Class (BTC)
	//		BTC is a template compiler that compiles a blade template file to pure `javascript` statements. BTC is
	//		the core of Blade.js library and its performance is vital for the library.
	//		[todo]: needs reviews and speed up  
	//
	function BTC (template_name, file_manager) {

		var 
		__FM = file_manager,

		conditional_syntax = new RegExp([
			"@if([\\s\\S]+?)\\)",
			"@else",
			"@elseif([\\s\\S]+?)\\)",
			"@endif",
			"@unless([\\s\\S]+?)\\)",
			"@endunless",
			"@for([\\s\\S]+?)\\)",
			"@endfor",
			"@foreach([\\s\\S]+?)\\)",
			"@endforeach",
			"@while([\\s\\S]+?)\\)",
			"@endwhile"
		].join("|"), "g"),

		//purify function is copied from mustache.js(c)
		compiled_src = "var _r='',_p=function(v){var _m={'&': '&amp;','<': '&lt;','>': '&gt;','\"': '&quot;',\"\'\": '&#39;','/': '&#x2F;'};return v.replace(/[&<>\"\'\/]/g,function(s){return _m[s];});};";

		var
		validateTemplate = function (features) {
			//invalid template:

			if ( features['extends'] && features['extends'].length > 1 ) {
				//err: more than one extends
			}

			if ( (features['extends'] && !features['extends'].length && features['section'] && features['section'].length) || ( !features['extends'] && features['section'] && features['section'].length) ) {
				//have no extends but have section
				return new BEH(new Error("Template Logical Error: No need to use section when don't use inheritance.\n*Notice* Maybe you forgot to use `@extends`"));	
			}

			if ( features["yield"] && features["yield"].length ) {
				//	more than one yield with the same name
				for (var ye_cnt_vt=0; ye_cnt_vt<features["yield"].length ; ye_cnt_vt=ye_cnt_vt+1) {
					var first_instance_name = features["yield"][ye_cnt_vt].placement.replace(/\s+/g, '');

					if (first_instance_name[0] === "'" || first_instance_name[0] === '"') {
						first_instance_name = first_instance_name.substr(1, first_instance_name.length-2);
					}

					for(var ye_cnt2_vt=ye_cnt_vt+1; ye_cnt2_vt<features["yield"].length; ye_cnt2_vt=ye_cnt2_vt+1) {
						var second_instance_name = features["yield"][ye_cnt2_vt].placement.replace(/\s+/g, '');

						if (second_instance_name[0] === "'" || second_instance_name[0] === '"') {
							second_instance_name = second_instance_name.substr(1, second_instance_name.length-2);
						}

						if ( first_instance_name === second_instance_name) {
							return new BEH(new Error("Template Logical Error: More than one `@yield` with the same id.\n*Notice* id shall be unique."));	
						}
					}

				}
			}

			if ( features["section"] && features["section"].length ) {
				//	more than one section with the same name
				for (var se_cnt_vt=0; se_cnt_vt<features["section"].length ; se_cnt_vt=se_cnt_vt+1) {
					
					var section_syntax = new RegExp("@section\\(([\\s\\S]+?)\\)([\\s\\S]+?)@stop", "g"),

						section_features = section_syntax.exec(inheritance_features['section'][se_cnt_ri].match);

					if ( !section_features ) {
						return new BEH(new Error("Template Syntax Error: section syntax violation.\nUsage: @section([secton_name]) [section_contents] @stop."))
					}

					var first_instance_name = section_features[1].replace(/\s+/g, '');

					if (first_instance_name[0] === "'" || first_instance_name[0] === '"') {
						first_instance_name = first_instance_name.substr(1, first_instance_name.length-2);
					}

					for(var se_cnt2_vt=se_cnt_vt+1; se_cnt2_vt<features["section"].length; se_cnt2_vt=se_cnt2_vt+1) {

						var section_syntax = new RegExp("@section\\(([\\s\\S]+?)\\)([\\s\\S]+?)@stop", "g"),

							section_features = section_syntax.exec(inheritance_features['section'][se_cnt_ri].match);

						if ( !section_features ) {
							return new BEH(new Error("Syntax Error: section syntax violation.\n Usage: @section([secton_name]) [section_contents] @stop."))
						}

						var second_instance_name = section_features[1].replace(/\s+/g, '');

						if (second_instance_name[0] === "'" || second_instance_name[0] === '"') {
							second_instance_name = second_instance_name.substr(1, second_instance_name.length-2);
						}

						if ( first_instance_name === second_instance_name) {
							return new BEH(new Error("Template Logical Error: More than one `@section` with the same id.\n*Notice* id shall be unique."));	
						}
					}

				}
			}

			return true;

		},

		//	Pre-Compiler Function
		//		PreCompiler is used to resolve inheritance related regulations like `extends` and `include`. However
		//		`include` is not quite related to other inheritance-based terms. 
		//
		preCompiler = function (source) {

			var
			extend = function (source) {

				//[issue]: is it logical to not let extend more than one template?
				var extend_count = source.match(/@extends([\s\S]+?)\)/g).length;

				if ( extend_count > 1 ) {
					return new BEH(new Error("Template Error: Can't Inheritance from more that one template"), "BTC.precompiler.extend");
				}
				else if ( extend_count === 0) {
					return false;
				}
				else {
					var base_template_src = __FM.readTemplate(/@extends([\s\S]+?)\)/g.exec(source)[1]);

					if ( base_template_src === source ) {
						return new BEH(new Error("Inheritance Logic Error: Can't extend a template inside itself!"/*you noob!*/));
					}

					if ( base_template_src instanceof BEH ) {
						base_template_src.trace("BTC.precompiler.extend");
						return base_template_src;
					}

					var precompiled_base_template_src = precompiler(base_template_src);

					return precompiled_base_template_src;
				}

			},

			include = function (source) {

				var modified_src = source;

				modified_src = modified_src.replace(/@include([\s\S]+?)\)/g, function (match, template_name, offset, string) {

					var included_template_src = __FM.readTemplate(template_name);

					if ( included_template_src instanceof BEH ) {
						included_template_src.trace("BTC.precompiler.include");
						return included_template_src;
					}

					var precompiled_included_template_src = precompiler(included_template_src);

					return precompiled_included_template_src;
				
				});

				return modified_src;

			};

			var precompiled_base_template_src = extend(source),

				included_template_src = include(source);

			if ( precompiled_base_template_src ) {

				var sections = {};

				source.replace(/@section([\s\S]+?)\)([\s\S]+?)@stop/g, function (match, section_name, section_content, offset, string) {
					sections[section_name.replace(/[\'\"\)\s]/g, "")] = section_content;
					return "";
				});

				precompiled_base_template_src = precompiled_base_template_src.replace(/@yield([\s\S]+?)\)/g, function (match, yield_name, offset, string) {
					yield_name = yield_name.replace(/[\'\"\)\s]/g, "");
					if ( sections[yield_name] ) {
						return sections[yield_name];
					}
					else {
						return match;
					}
				});

				return precompiled_base_template_src;

			}
			else {

				return included_template_src;

			}

		};

		var source = __FM.readTemplate(template_name),

			pre_compiled_src = preCompiler(source);

		//so first we need to make sure that raw_text won't be affected at any way
		//what we want to do is to produce a very random number to place for each raw_text instance and then after processing end return them
		var raw_text_map = {};
		pre_compiled_src = pre_compiled_src.replace(/@{{([\s\S]+?)}}/g, function(match, raw_text, offset, string) {
			var sign = Math.round(Math.random() * 10000000000000000);
			raw_text_map[sign] = raw_text;
			return "${${"+sign+"}$}$";
		});

		//then we need to strip off the comments
		pre_compiled_src = pre_compiled_src.replace(/{{--([\s\S]+?)--}}/g, "");

		//after that we will consider conditional_syntax
		pre_compiled_src = pre_compiled_src.replace(conditional_syntax, function (match, _if, _elseif, _unless, _for, _foreach, _while, offset, string) {

			if (match === "@else") {
				console.log('test');
				return "';}else{_r=_r+'";
			}
			else if (match === "@endif" || match === "@endunless" || match === "@endfor" || match === "@endforeach" || match === "@endwhile") {
				return "';}_r=_r+'";
			}
			else if ( _elseif ){
				return "';}"+match.slice(1,match.length)+"{_r=_r+'";	
			}
			else if ( _if || _for || _while) {
				return "';"+match.slice(1,match.length)+"{_r=_r+'";
			}
			else if ( _unless ) {
				return "';if("+_unless.replace(/\(/, "")+"){_r=_r+'";
			}
			else{
				var condition = _foreach.replace(/\(/, ""),
					object = condition.split(" as ")[0].replace(/\s+/g, ""),
					variable = condition.split(" as ")[1].replace(/\s+/g, ""),
					loop_variable_name = "v"+ Math.round(Math.random() * 100000);

				//[issue]: its been said that for in loop is not good for Array
				return "';for(var "+loop_variable_name+" in "+ object + "){var "+ variable + "="+ object + "[" + loop_variable_name + "];_r=_r+'";
			}

		});
			
		var ptr = 0;
		//now it's time to do echo and purified echo and also to compile the pre_compiled source
		pre_compiled_src.replace(/{{{([\s\S]+?)}}}|{{([\s\S]+?)}}/g, function (match, purified, echo, offset, string) {

			compiled_src = compiled_src + "_r=_r+'" + string.slice(ptr,offset) + "';";
			ptr = offset + match.length;

			if ( purified ) {
				compiled_src = compiled_src + "_r=_r+_p("+purified+");";
			}
			else{
				compiled_src = compiled_src + "_r=_r+"+echo+";";
			}

			return "";
		});

		compiled_src = compiled_src + "_r=_r+'" + pre_compiled_src.slice(ptr,compiled_src.length) + "';";

		//now that we have compiled the source we have to map the raw_texts
		for (var raw_text in raw_text_map) {
			compiled_src = compiled_src.replace("${${"+raw_text+"}$}$", raw_text_map[raw_text]);
		}

		compiled_src = compiled_src + "return _r;"

		//OK the easiest is here :D
		//to make our job easier we are gonna turn this template to a function like all other template engines do
		//then return this function so who ever calls this function with the vars provided is gonna have the answer

		//secondly we have to consider the conditional syntax but its the second hardest so let us go the easiest for now
		//ok now we have to get to this
		//actually this not so hard (phew!)
		//we compile the damn thing to a function that will return the compiled template
		

		//last thing that we have to do is to make our strings valid
		//so we remove all the return chars that we collected from raw_template
		compiled_src = compiled_src.replace(/\r+/g, "\\r");

		//[issue]: the structure is not 100% preserved
		//then we make sure the new line chars will stay with template to reserve template structure
		compiled_src = compiled_src.replace(/\n+/g, "\\n");
		
		return compiled_src;		

	};

	//this is the main method that gets the name of a template and returns the compiled template as string
	// param: template name [example: "admin.users.create"]
	// returns: String
	blade_p.make = function (template_name, vars) {

		//first thing that happens is that we get the raw template
		var raw_template = loadTemplate(this.__ROOT, template_name);

		if ( raw_template instanceof BEH ) {
			return raw_template.render();
		}

		var compiled_template = compileTemplate(raw_template, this);

		if ( compiled_template instanceof BEH ) {
			return compiled_template.render();
		}

		var res = new template();
		res.src = compiled_template;
		window.template = res;
		return res; 

	}

	//	Testing anonymous function is such a hard thing to do
	//	I used mocha as testing platform
	//	For more information see Tests/README.md
	if ( typeof global === "object" && global.__TESTING ) {
		//	Script is running under test condition
		var __PRIVATE = function () {
				return this;
		}
		__PRIVATE.BEH = BEH;
		__PRIVATE.Template = Template;
		__PRIVATE.BTFM = BTFM;
		__PRIVATE.BTC = BTC;
		
		if ( __ENV === "nodejs" ) {
			exports.__PRIVATE = __PRIVATE;
		}
		else {
			window.__PRIVATE = __PRIVATE;
		}
	}

}).call(this)