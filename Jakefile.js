var // Program refs
fs = require("fs"),
sys = require("sys"),
uglify = require("uglify-js"),
jshint = require("jshint").JSHINT,
print = require("sys").print,
util = require("util"),
exec = require("child_process").exec,
child;

// Global constants
FILES = {
	src: [
		"src/mediagroup.js"
	],
	test: [
		"test/mediagroup.unit.js"
	]
};
_SRC_ = "src/",
_DIST_ = "dist/";

PROJECT = "mediagroup";


HINTABLES = [ "src", "test" ];

HINTS = {
	// `data: true` can be used by us to output information collected and available via jshint.data()
	src: { unused: true, unuseds: true, devel: true, undef: true, noempty: true, evil: true, forin: false, maxerr: 100 },
	test: { devel: true, evil: true, forin: false, maxerr: 100 }
};


SILENT = process.argv[ process.argv.length - 1 ] === "--silent" || false;
VERBOSE = process.argv[ process.argv.length - 1 ] === "--verbose" || false;



desc( "Hint all JavaScript program files with JSHint *" );
task( "hint", [], function( params ) {

	print( "\nHinting..." );
	!SILENT && print( "\n" );

	var files = FILES,
	hints = HINTS,
	count = 0;

	function hintFile( file, hint, set ) {

		var errors, warning, data,

		found = 0,

		src = fs.readFileSync( file, "utf8"),

		ok = {
			// warning.reason
			"Expected an identifier and instead saw 'undefined' (a reserved word).": true,
			"Use '===' to compare with 'null'.": true,
			"Use '!==' to compare with 'null'.": true,
			"Expected an assignment or function call and instead saw an expression.": true,
			"Expected a 'break' statement before 'case'.": true,
			"'e' is already defined.": true,

			// warning.raw
			"Expected an identifier and instead saw \'{a}\' (a reserved word).": true
		},

		dataProps = {
			unuseds: true,
			implieds: true,
			globals: true
		},
		props;

		jshint( src, hint );

		errors = jshint.errors;

		if ( hint.data ) {

			data = jshint.data();

			Object.keys( dataProps ).forEach(function( prop ) {
				if ( data[ prop ] ) {
					console.log( prop, data[ prop ] );
				}
			});
		}

		for ( var i = 0; i < errors.length; i++ ) {
			warning = errors[i];

			// If a warning exists for this error
			if ( warning &&
					// If the warning has evidence and the evidence is NOT a single line comment
					( warning.evidence && !/^\/\//.test( warning.evidence.trim() ) )
				) {

				//console.dir( warning );

				if ( !ok[ warning.reason ] && !ok[ warning.raw ] ) {
					found++;

					print( "\n" + file + " at L" + warning.line + " C" + warning.character + ": " + warning.reason );
					print( "\n    " + warning.evidence.trim() + "\n");

				}
			}
		}

		if ( found > 0 ) {

			print( "\n    " + set + ": \n" );
			print( "\n\n" + found + " Error(s) found in: " + file + "\n\n" );

		} else {

			!SILENT && print( "        PASS: " + file + "\n" );
		}
	}


	HINTABLES.forEach(function( set, i ) {

		var fileSet = files[ set ];

		if ( fileSet && fileSet.length ) {

			!SILENT && print( "\n    " + set + ": \n" );

			files[ set ].forEach(function( file, i ) {

				hintFile( file, hints[ set ], set );

				count++;
			});
		}

		if ( HINTABLES.length - 1 === i ) {
			print("\nComplete: " + count + " files hinted\n");
		}
	});
});



desc("Uglify JS");
task("minify", [ "hint" ], function( params ) {

	print( "\nUglifying..." );

	var ast, out, min,
	all = "",
	files = FILES.src;


	// Concatenate JavaScript resources
	files.forEach(function(file, i) {
		if ( file.match(/^.*js$/) && file ) {
			all += fs.readFileSync( file ).toString();
		}
	});

	// Outout concatenated
	out = fs.openSync( _DIST_ + PROJECT + ".js", "w+" );
	fs.writeSync( out, all );

	// Create AST from concatenated sources
	ast = uglify.parser.parse( all );

	// Open output stream
	out = fs.openSync( _DIST_ + PROJECT + ".min.js", "w+" );

	// Compress AST
	ast = uglify.uglify.ast_mangle( ast );
	ast = uglify.uglify.ast_squeeze( ast );
	ast = uglify.uglify.gen_code( ast );

	min = [
		"/*! mediagroup.js, Copyright 2011, Rick Waldron, MIT Licensed " +
		" * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#assigning-a-media-controller-declaratively " +
		" */",
		ast
	];

	// Output regenerated, compressed code
	fs.writeSync( out, min.join("\n") );

	print( "Success!\n" );
});

task("clean", [], function( params ) {

	print( "\nCleaning...\n\n" );

	fs.readdir( _DIST_, function( err, files ) {
		files.forEach(function( file ) {

			exec("rm " + file,
				function( error, stdout, stderr ) {

					if ( error !== null && !/No such file/.test( error ) ) {
						console.log( error );
					} else {
						// no such file errors will be allowed through, just ignore them
						if ( error !== null ) {
							console.log("  deleted: " + file );
						}
					}
				}
			);

			if ( files.length - 1 === i ) {
				print("Completed.\n");
			}
		});
	});
});

task("default", [ "hint", "minify" ], function( params ) {

	print( "\n" );

});