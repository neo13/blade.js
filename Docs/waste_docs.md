//this function shall load the requested template and return the raw text
	//we load templates from file in node __ENVironment and [todo]: from script tags in browsers
	//[todo]: ajax loading for browsers
		/*	this function is used to resolve the in inheritance in template
		**	the problem caused by nested inheritance where template1 inheritance from base and template 2 inheritance from template 1
		**	[param]: 	source				when there is no inheritance it just return the raw_template 
		**										[caution]: the compile function will remove all the inheritance terms from template
		**										after returning from this function
		**				features 				children inheritance features, used to extract the base name and then to resolve
		**										the sections
		**
		**	[return]: 	BEH		if there were any errors or so
		**				resoleved_template		template file that all the inheritance terms are resolved
		**										[caution]: it may still have some unresolved inheritance terms but they will be removed afterward
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
		**					->delete all the remaining yields after this function is over
		**
		**	[issue]: Laravel 4 templating changed a little bit, it provided the ability to map section to section
		**			 but i don't think it's a logical way to do this
		*/

//firstly we have to consider the inheritance
			//if the inheritance is used we have :
			// 1. load the base template
			// 2. extract the inheritance_syntax of the base template
			// 3. replace the base template sections using section and yield
			// 4. load and replace include templates
			// 5. replace the raw_template with new template
			// what if we have a nested inheritance?
			// i think the best way is to get along with it
			// how?
			// recessiveness

			//OK done :D

	//	for easing job a little i categorized the syntax to 3 major type:
	//	inheritance_syntax: the most hard one
	//	substitutional_syntax: easiest just a substitution
	//	conditional_syntax: second hard
	