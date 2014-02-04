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

	var 
	blade_p = blade.prototype,
	impurities = /[\s\(\)\'\"]+/g,
	UID = function () { return Math.round(Math.random() * 10000000000000000) };

	String.prototype.clean = String.prototype.replace,

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

		var
		__ROOT = this.__ROOT = document_root || "./templates",

		//	[todo]: Other type of storages 
		__STORAGE = this.__STORAGE = "FileSystem",

		refineTemplateName = function (template_name) {
			return template_name.clean(impurities, '');
		},

		resolveTemplateFileName = function (template_name) {
			return __ROOT + '/' + template_name.split('.').join("/") + '.blade.js';
		},

		resolveTemplateTagName = function (template_name) {
			//	the way this works is to let users create meaningfull nested templates using in thier html files
			//	users shall use `<div id="[document_root]"></div>` tag name to specify the root of templates
			//	for nested templates just a div#template_directory
			//	for the actual template a div.template_name
			//	[todo]: custom tag names
			template_name = template_name.split('.');
			if (template_name.length > 1) {
				return "div#" + __ROOT + " > div#" + template_name.slice(0,template_name.length-1).join(" > div#") + " > div." + template_name[template_name.length-1];
			}
			else {
			return "div#" + __ROOT + " > div." + template_name[template_name.length-1];	
			}
		},

		resolveTemplateURL = function (template_name) {
			//	this is used for when a template is supposed load from a url
			//	[todo]: http/https
			return encodeURIComponent(__ROOT + '/' + template_name.split('.').join("/"));
			
		},

		loadTemplateFile = function (file_name) {
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
						throw new Error("Empty Template: " + file_name);
					}
				}
				catch (e) {
					throw new BEH(e);
				}
			}
			else {
				throw new BEH(new Error("Template does not exist: " + file_name));
			}

		},

		loadTemplateTag = function (tag_name) {
			return document.querySelector(tag_name).innerHtml;
		},

		getTemplate = function (template_url) {

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
				throw new BEH(e);
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

	}


	//
	//	Template Catch System
	//
	function TC () {

	}

	//
	//	Blade Template Compiler Class (BTC)
	//		BTC is a template compiler that compiles a blade template file to pure `javascript` statements. BTC is
	//		the core of Blade.js library and its performance is vital for the library.
	//		[todo]: needs reviews and speed up  
	//
	function BTC (source, file_manager) {

		var 
		__FM = file_manager,

		raw_text_map,

		//purify function is copied from mustache.js(c)
		compiled_src = "var _r='',_p=function(v){var _m={'&': '&amp;','<': '&lt;','>': '&gt;','\"': '&quot;',\"\'\": '&#39;','/': '&#x2F;'};return v.replace(/[&<>\"\'\/]/g,function(s){return _m[s];});};",

		//	Pre-Compiler Function
		//		PreCompiler is used to resolve inheritance related regulations like `extends` and `include`. However
		//		`include` is not quite related to other inheritance-based terms. 
		//
		preCompiler = function (source) {

			var
			precompiled_base_template_src,

			included_template_src,

			sections,

			extend = function (source) {

				var match = source.match(/@extends/g),

					base_template_src,

					precompiled_base_template_src;

				if ( match && match.length > 1 ) {
					throw new BEH(new Error("Template Error: Can't Inheritance from more that one template"), "BTC.precompiler.extend");
				}
				else if ( !match ) {
					return false;
				}
				else {

					base_template_src = __FM.readTemplate(/@extends([\s\S]+?)\)/g.exec(source)[1]);

					if ( base_template_src === source ) {
						throw new BEH(new Error("Inheritance Logic Error: Can't extend a template inside itself!"/*you noob!*/));
					}

					precompiled_base_template_src = preCompiler(base_template_src);

					return precompiled_base_template_src;
				}

			},

			include = function (source) {

				var modified_src = source,

					included_template_src,

					precompiled_included_template_src;

				modified_src = modified_src.replace(/@include([\s\S]+?)\)/g, function (match, template_name, offset, string) {

					included_template_src = __FM.readTemplate(template_name);

					precompiled_included_template_src = preCompiler(included_template_src);

					return precompiled_included_template_src;
				
				});

				return modified_src;
				
			},

			getSections = function (source) {
				var
				sections = {};

				source.replace(/@section([\s\S]+?)\)([\s\S]+?)@stop/g, function (match, section_name, section_content, offset, string) {
					
					section_name = section_name.clean(impurities, "");

					if( sections[section_name] ){
						throw new BEH(new Error("Template Logical Error: More than one `@section` with the same id.\n*Notice* id shall be unique."));
					}
					
					sections[section_name] = section_content;

				});
				return sections;
			},

			replaceYields = function (source, sections) {
				source = source.replace(/@yield([\s\S]+?)\)/g, function (match, yield_name, offset, string) {
					yield_name = yield_name.clean(impurities, "");

					if ( sections[yield_name] ) {
						return sections[yield_name];
					}
					else {
						return match;
					}
				});

				return source;

			};

			return (function (source) {

				precompiled_base_template_src = extend(source);

				included_template_src = include(source);

				if ( precompiled_base_template_src ) {

					sections = getSections(source);

					return replaceYields(precompiled_base_template_src, sections);

				}
				else {
					return included_template_src;
				}

			})(source);

		},

		mapper = function (source) {

			var
			preMapper = function (source) {
				var
				form_builder = function () {

				},

				asset_manager = function () {

				};
				//...

				return (function (source) {
					//map the functionality here
					return source;
				})(source);
				
			},

			

			mapConditions = function (source) {
				var
				conditions = new RegExp([
							"@if([\\s\\S]+?)\\)",
							"@else(?!if)",
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
				].join("|"), "g");

				source = source.replace(conditions, function (match, _if, _elseif, _unless, _for, _foreach, _while, offset, string) {

					if (match === "@else") {
						return "';}else{_r=_r+'";
					}
					else if (match === "@endif" || match === "@endunless" || match === "@endfor" || match === "@endforeach" || match === "@endwhile") {
						return "';}_r=_r+'";
					}
					else if ( _elseif ){
						return "';}else if("+_elseif.clean(/\(/, "")+"){_r=_r+'";	
					}
					else if ( _if || _for || _while) {
						return "';"+match.slice(1,match.length)+"{_r=_r+'";
					}
					else if ( _unless ) {
						return "';if("+_unless.clean(/\(/, "")+"){_r=_r+'";
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
				return source;
			};

			return (function (source) {
				source = source.clean(/@yield([\s\S]+?)\)/, "");
				source = source.replace(/\'/g, "\\\'");
				source = preMapper(source);				
				source = mapConditions(source);
				return source;
			})(source);

		},

		extractRawText = function (source, map) {
			
			var
			text_id;

			source = source.replace(/@{{([\s\S]+?)}}/g, function(match, raw_text, offset, string) {

				text_id = UID();

				raw_text_map[text_id] = raw_text;

				return "${${"+text_id+"}$}$";

			});

			return source;

		},


		mapRawText = function (source, map) {

			for (var raw_text in map) {
				source = source.replace("${${"+raw_text+"}$}$", map[raw_text]);
			}

			return source;

		};

		return (function (source) {

			source = extractRawText(source, raw_text_map);

			source = source.clean(/{{--([\s\S]+?)--}}/g, "");

			source = preCompiler(source);	

			source = mapper(source);
				
			var ptr = 0;
			source.replace(/{{{([\s\S]+?)}}}|{{([\s\S]+?)}}/g, function (match, purified, echo, offset, string) {

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

			compiled_src = compiled_src + "_r=_r+'" + source.slice(ptr,source.length) + "';";

			compiled_src = mapRawText(compiled_src, raw_text_map);
			
			compiled_src = compiled_src + "return _r;"

			compiled_src = compiled_src.replace(/\r+/g, "\\r");

			compiled_src = compiled_src.replace(/\n+/g, "\\n");
			
			return compiled_src;

		})(source);

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