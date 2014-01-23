//			Blade.js ->-- underconstruction
//			http://bladejs.org
//			(C) 2014 neo13 (Ahmad Derakhshan) http://github.com/neo13
//			Under MIT license

(function () {

	"use strict";

	//default __ENVironment is nodejs
	var __ENV = "nodejs",
		__ROOT = "./templates";

	var blade = function (template_root) {
		
		if (typeof template_root === "string") {
			this.__ROOT = __ROOT = template_root;
		}

		//this part of code is inspired by underscore.js
		//using blade.js in browser is some thing that I considered
		else if (typeof exports !== "undefined") {
			this.__ROOT = "./templates"; 
		}
		else {
			this.__ROOT = __ROOT = "#templates"
		}
	};

	//this part of code is inspired by underscore.js
	if (typeof exports !== "undefined") {
		if (typeof module !== "undefined" && module.exports) {
			//suport for older versions of require()
			exports = module.exports = blade;
		}
		exports.blade = blade;
	}
	else {
		//support for browsers
		window.blade = balde;
		__ENV = "browser";
	}

	//some shortcuts
	var blade_p = blade.prototype;

	blade_p.__VERSION = "underconstruction";
	blade_p.__ENV = __ENV;

	//	for easing job a little i categorized the syntax to 3 major type:
	//	inheritance_syntax: the most hard one
	//	substitutional_syntax: easiest just a substitution
	//	conditional_syntax: second hard
	var inheritance_syntax = new RegExp([
			"@extends\\(([\\s\\S]+?)\\)", //extends
			"@section([\\s\\S]+?)@stop", //section
			"@include\\(([\\s\\S]+?)\\)", //include
			"@yield\\(([\\s\\S]+?)\\)" //yield
		].join("|"), "g");


	//			blade exception handler
	//			this class is used to globaly handel all exceptions in blade template engine and respond accordingly
	function ExceptionHandler (exception) {
		//to do
		this.err = exception;

		this.render = function () {
			return this.err;
		}
	}

	//this function shall load the requested template and return the raw text
	//we load templates from file in node __ENVironment and [todo]: from script tags in browsers
	//[todo]: ajax loading for browsers
	var loadTemplate = function (template_root, template_name) {
		
			if (typeof template_name !== "string" || typeof template_root !== "string") {
				return new ExceptionHandler(new Error("Invalid Template: " + template_root + "/" + template_name));
			}

			if (__ENV === "nodejs") {

				var src = template_root + '/' + template_name.split('.').join("/") + '.blade.js',
					fs = require('fs'),
					raw_template = "";

				if ( fs.existsSync(src) ) {
					raw_template = fs.readFileSync(src, 'utf-8');

					if( raw_template ) {
						return raw_template;
					}
					else {
						return new ExceptionHandler(new Error("Can't read the template or it is empty: " + template_root + "/" + template_name));
					}
				}
				else {
					return new ExceptionHandler(new Error("Template does not existes: " + template_root + "/" + template_name));
				}
			}
			else if (__ENV === "browser") {
				//[todo]
			}
		},

		extractFeatures = function (syntax, identifier, source) {

			//	it contains the feature extracted from source
			var features = {};

			//	for each type of term which passed by identifier we create a list in feature object
			for (var id_cnt_exf=0; id_cnt_exf<identifier.length; id_cnt_exf=id_cnt_exf+1) {
				features[identifier[id_cnt_exf]] = [];
			}

			//	althogh using replace function makes no logical sense but we use it
			source.replace(syntax, function (match) {

				//	replace sends arguments according to the syntax we provided to it
				//	if out sysntax have n capturing group replace passes n+3 arguments
				//	first argument is the matched part of string [example]: `@extends(base)`
				//	next n argument are n capturing group values
				//	[example]: if the extends rule is our second rule of 4 rules then the pased arguments are like this:
				//	undefined, `base`, undefined, undefined
				//	the n+2 st argument is offset of matching accurance
				//	the n+3 st argument is the string it self
				var args = Array.prototype.slice.call(arguments, 1);

				for (var args_cnt_exf=0; args_cnt_exf<args.length-2; args_cnt_exf=args_cnt_exf+1) {
					if ( args[args_cnt_exf] ) {
						features[identifier[args_cnt_exf]].push({
							'match': match,
							'placement': args[args_cnt_exf],
							'offset': args[args.length-2]
						});
						break;
					}
				}

				return "";
			});

			return features;
		},

		validateTemplate = function (features) {
			//invalid template:

			if ( features['extends'] && features['extends'].length > 1 ) {
				//err: more than one extends
				return new ExceptionHandler(new Error("Template Error: Can't Inheritance from more that one template"));
			}

			if ( (features['extends'] && !features['extends'].length && features['section'] && features['section'].length) || ( !features['extends'] && features['section'] && features['section'].length) ) {
				//have no extends but have section
				return new ExceptionHandler(new Error("Template Logical Error: No need to use section when don't use inheritance.\n*Notice* Maybe you forgot to use `@extends`"));	
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
							return new ExceptionHandler(new Error("Template Logical Error: More than one `@yield` with the same id.\n*Notice* id shall be unique."));	
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
						return new ExceptionHandler(new Error("Template Syntax Error: section syntax violation.\nUsage: @section([secton_name]) [section_contents] @stop."))
					}

					var first_instance_name = section_features[1].replace(/\s+/g, '');

					if (first_instance_name[0] === "'" || first_instance_name[0] === '"') {
						first_instance_name = first_instance_name.substr(1, first_instance_name.length-2);
					}

					for(var se_cnt2_vt=se_cnt_vt+1; se_cnt2_vt<features["section"].length; se_cnt2_vt=se_cnt2_vt+1) {

						var section_syntax = new RegExp("@section\\(([\\s\\S]+?)\\)([\\s\\S]+?)@stop", "g"),

							section_features = section_syntax.exec(inheritance_features['section'][se_cnt_ri].match);

						if ( !section_features ) {
							return new ExceptionHandler(new Error("Syntax Error: section syntax violation.\n Usage: @section([secton_name]) [section_contents] @stop."))
						}

						var second_instance_name = section_features[1].replace(/\s+/g, '');

						if (second_instance_name[0] === "'" || second_instance_name[0] === '"') {
							second_instance_name = second_instance_name.substr(1, second_instance_name.length-2);
						}

						if ( first_instance_name === second_instance_name) {
							return new ExceptionHandler(new Error("Template Logical Error: More than one `@section` with the same id.\n*Notice* id shall be unique."));	
						}
					}

				}
			}

			return true;

		},

		resolveInclude = function (source, features) {

			var modified_src = source;

			for (var in_cnt_rin=0; in_cnt_rin<features['include'].length; in_cnt_rin=in_cnt_rin+1) {

				var included_template_name = features["include"][in_cnt_rin].placement.replace(/\s+/g, '');

				if (included_template_name[0] === "'" || included_template_name[0] === '"') {
					included_template_name = included_template_name.substr(1, included_template_name.length-2);
				}

				var included_template_src = loadTemplate(__ROOT, included_template_name);

				if ( included_template_src instanceof ExceptionHandler ) {
					return included_template_src;
				}

				var included_inheritance_features = extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], included_template_src),

					resolved_included_template_src = resolveInheritances(included_template_src, included_inheritance_features);

				modified_src = modified_src.slice(0, inheritance_features["include"][in_cnt_rin].offset) + resolved_included_template_src + modified_src.slice(inheritance_features["include"][in_cnt_rin].offset + inheritance_features["include"][in_cnt_rin].match.length, modified_src.length);
			
			}

			return modified_src;
		},


		/*	this function is used to resolve the in inheritance in template
		**	the problem caused by nested inheritance where template1 inhertance from base and template 2 inheritance from template 1
		**	[param]: 	source				when there is no inheritance it just return the raw_template 
		**										[caution]: the compile function will remove all the inheritance terms from template
		**										after returning from this function
		**				features 				childs inheritance features, used to extract the base name and then to resolve
		**										the sections
		**
		**	[return]: 	ExceptionHandler		if there were any errors or so
		**				resoleved_template		template file that all the inheritance terms are resolved
		**										[caution]: it may still have some un resolved inheritance terms but they will be removed afterward
		**
		**	[example]: 	template2:
		**					@extends(template1)
		**					@section(contents)
		**						this is template2!
		**						@yield(header)
		**					@stop
		**				
		**				template1:
		**					@extends(base)
		**					@section(body)
		**						this is template1!
		**						@yield(contents)
		**						@yield(footer)
		**					@stop
		**				
		**				base:
		**					<html>
		**					<body>
		**						@yield(body)
		**					</body>
		**					</html>
		**
		**				resolveing ...
		**					->template2 features: @extends(template1) => resolve template1
		**					->template1 features: @extends(base) => resolve base
		**					->base features: no extends and no inclued => validate base_src, return base_src
		**					->map template1 sections and base yields => section[body] <-> yield[body]
		**					->replace matches:
		**						<html>
		**						<body>
		**							this is template1!
		**							@yield(contents)
		**							@yield(footer)
		**						</body>
		**						</html>
		**					->validate modified_src
		**					->return the modified_src
		**					->map template2 sections and template2 yields => section[contents] <-> yield[contents]
		**					->replace matches:
		**						<html>
		**						<body>
		**							this is template1!
		**							this is template2!
		**							@yield(header)
		**							@yield(footer)
		**						</body>
		**						</html>
		**					->validate modified_src
		**					->return the modified_src
		**					->delete all the remaining yeilds after this function is over
		**
		**	[issue]: Laravel 4 templating changed a little bit, it provided the ability to map section to section
		**			 but i don't think it's a logical way to do this
		*/
		resolveInheritances = function (source, features) {

			//	we consider the incoming template is valid
			if ( features["extends"].length ) {

				// ye we have a inheritance in our template :(
				// lets load it :D

				// example : @extends( 'master') => @extends('master')
				var base_template_name = features["extends"][0].placement.replace(/\s+/g, '');

				// example : 'master' => master
				// or: master => master
				if (base_template_name[0] === "'" || base_template_name[0] === '"') {
					base_template_name = base_template_name.substr(1, base_template_name.length-2);
				}

				var base_template_src = loadTemplate(__ROOT, base_template_name);

				if ( base_template_src instanceof ExceptionHandler ) {
					return base_template_src;
				}

				//what if some dufess extracts a `template` in `template` it self?
				if ( base_template_src === source ) {
					return new ExceptionHandler(new Error("Inheritance Logic Error: Can't extend a template inside itself!"/*you noob!*/));
				}

				var base_template_validation = validateTemplate(base_template_src);

				if ( validation instanceof ExceptionHandler ) {
					return base_template_src;
				}

				//now that we loaded the base template we have to extract the inheritance_syntax out of it
				var base_inheritance_features = extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], base_template_src),

					resolved_base_template_src = resolveInheritances(base_template_src, base_inheritance_features, inheritance_syntax);

				if ( resolved_base_template_src instanceof ExceptionHandler ) {
					return resolved_base_template_src;
				}

				// now we have to map the `sections` in child to `yeilds` in parents
				// if a `section` or `yeild` in parent don't have a match in child we preserve it
				//[issue]: what if some parts of child are not under the `section`s should we not consider this parts of put theme at the end of template?

				for (var se_cnt_ri=0; se_cnt_ri<features['section'].length; se_cnt_ri=se_cnt_ri+1) {
					
					var section_syntax = new RegExp("@section\\(([\\s\\S]+?)\\)([\\s\\S]+?)@stop", "g"),

						section_features = section_syntax.exec(features['section'][se_cnt_ri].match);

					if ( !section_features ) {
						return new ExceptionHandler(new Error("Syntax Error: section syntax violation.\n Usage: @section([secton_name]) [section_contents] @stop."))
					}

					var section_name = section_features[1].replace(/\s+/g, '');

					if (section_name[0] === "'" || section_name[0] === '"') {
						section_name = section_name.substr(1, section_name.length-2);
					}

					for (var ye_cnt_ri=0; ye_cnt_ri<base_inheritance_features["yield"].length; ye_cnt_ri=ye_cnt_ri+1) {

						var yield_name = base_inheritance_features["yield"][ye_cnt_ri].placement.replace(/\s+/g, '');

						if (yield_name[0] === "'" || yield_name[0] === '"') {
							yield_name = yield_name.substr(1, yield_name.length-2);
						}

						if ( yield_name === section_name ) {
							resolved_base_template_src = resolved_base_template_src.slice(0,base_inheritance_features["yield"][ye_cnt_ri].offset) + section_features[2] + resolved_base_template_src.slice(base_inheritance_features["yield"][ye_cnt_ri].offset + base_inheritance_features["yield"][ye_cnt_ri].match.length, resolved_base_template_src.length);
							break;
						}
						else if ( ye_cnt_ri === base_inheritance_features["yield"].length - 1 ){
							//which means there is not a yield for a section
							return new ExceptionHandler(new Error("Template Logic Error: Section `"+section_name+"` have no matching `@yeild`."));
						}

					}

				}

				var modified_src = resolveInclude(resolved_base_template_src, extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], resolved_base_template_src)),
					
					modified_src_features = extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], resolved_base_template_src),

					validation = validateTemplate(modified_src_features);

				if ( validation instanceof ExceptionHandler ) {
					return base_template_src;
				}

				return resolved_base_template_src;

			}
			else {
				// we don't have any inheritance in our template, yey! :D
				// yet we have to still consider include
				// we have to first load the include then resolve it and put in our src
				// what if we have more than one file included?
				// be ready cuz we looping :D
				
				var modified_src = resolveInclude(source, features),

					modified_src_features = extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], modified_src),

					validation = validateTemplate(modified_src_features);

				if ( validation instanceof ExceptionHandler ) {
					return base_template_src;
				}

				return modified_src;
			}

		},

		compileTemplate = function (raw_template) {
			//purify function is copied from mustache.js(c)
			var compiled_src = "var _r='',_p=function(v){var _m={'&': '&amp;','<': '&lt;','>': '&gt;','\"': '&quot;',\"\'\": '&#39;','/': '&#x2F;'};return v.replace(/[&<>\"\'\/]/g,function(s){return _m[s];});};";

			//fristly we have to consider the inheritance
			//if the inheritance is used we have :
			// 1. load the base template
			// 2. extract the inheritance_syntax of the base template
			// 3. replace the base template sections using section and yield
			// 4. load and replace include templates
			// 5. replace the raw_template with new template
			// what if we have a nested inheritance?
			// i think the best way is to get along with it
			// how?
			// recersiveness

			//OK done :D
			var	conditional_syntax = new RegExp([
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
				].join("|"), "g");

			var inheritance_features = extractFeatures(inheritance_syntax, ["extends", "section", "include", "yield"], raw_template),

				pre_compiled_src = resolveInheritances(raw_template, inheritance_features);

			pre_compiled_src = pre_compiled_src.replace(/'/g, "\\'");

			//so first we need to make sure that raw_text won't be affected at any way
			//what we want to do is to produce a very random number to palce for each raw_text instance and then after proccesing end return them
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
				console.log(match);
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
			//to make our job easier we are gonna turn this template to a function like all other templating engines do
			//then return this function so who ever calls this function with the vars provided is gonna have the answer

			//secondly we have to consider the conditional syntax but its the second hardest so let us go the easiest for now
			//ok now we have to get to this
			//actualy this not so hard (phew!)
			//we compile the damn thing to a function that will return the compiled template
			

			//last thing that we have to do is to make our strings valid
			//so we remove all the return chars that we collected from raw_template
			compiled_src = compiled_src.replace(/\r+/g, "\\r");

			//[issue]: the sturcture is not 100% preserved
			//then we make sure the new line chars will stay with template to reserve template structure
			compiled_src = compiled_src.replace(/\n+/g, "\\n");
			
			return compiled_src;
		};



	//this is the main method that gets the name of a template and returns the compiled template as string
	// param: template name [example: "admin.users.creat"]
	// returns: String
	blade_p.make = function (template_name, vars) {

		//frist thing tha happens is that we get the raw template
		var raw_template = loadTemplate(this.__ROOT, template_name);

		if ( raw_template instanceof ExceptionHandler ) {
			return raw_template.render();
		}

		var compiled_template = compileTemplate(raw_template, this);

		if ( compiled_template instanceof ExceptionHandler ) {
			return compiled_template.render();
		}
		
		//[issue][need_test]: injecting functions?
		var template = function () {
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
					return new ExceptionHandler(new Error("Template Error: Invalid argument passed: `"+JSON.stringify(vars)+"`!"));
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
		};

		var res = new template();
		res.src = compiled_template;
		window.template = res;
		return res; 

	}

}).call(this)