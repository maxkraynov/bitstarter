#!/usr/bin/env node
/*
 * Automatically grade files for the presence of specified HTML tags/attributes.
 * Uses commander.js and cheerio. Teaches command line application development
 * and basic DOM parsing.
 *
 * References:
 *
 *  + cheerio
 *     - https://github.com/MatthewMueller/cheerio
 *        - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 *           - http://maxogden.com/scraping-with-node.html
 *
 *            + commander.js
 *               - https://github.com/visionmedia/commander.js
 *                  - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
 *
 *                   + JSON
 *                      - http://en.wikipedia.org/wiki/JSON
 *                         - https://developer.mozilla.org/en-US/docs/JSON
 *                            - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 *                            */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	    var instr = infile.toString();
	        if(!fs.existsSync(instr)) {
			        console.log("%s does not exist. Exiting.", instr);
				        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
					    }
		    return instr;
};

var getHtmlFromDisc = function(htmlfile) {
	    return fs.readFileSync(htmlfile);
};

var loadChecks = function(checksfile) {
	    return JSON.parse(fs.readFileSync(checksfile));
};

var checkFromUrl = function(path, checksfile){
	getHtmlFromUrl(path, function(result){checkHtmlFile(result, checksfile)});
}

var checkFromDisc = function(path, checksfile){
	checkHtmlFile(getHtmlFromDisc(path), checksfile)
}

var checkHtmlFile = function(htmlfile, checksfile) {
	    $ = cheerio.load(htmlfile);
	        var checks = loadChecks(checksfile).sort();
		    var out = {};
		        for(var ii in checks) {
				        var present = $(checks[ii]).length > 0;
					        out[checks[ii]] = present;
						    }
		    var outJson = JSON.stringify(out, null, 4);	
		    fs.writeFileSync("output.json",outJson);
};

var getHtmlFromUrl = function (url, callback) {
	rest.get(url).on('complete', function(result) {
		if (result instanceof Error){
			console.log("%s does not exist. Good Bye", url);
			process.exit(1);
		}
		else{
			callback(result);
		}
	});
}

var getHtml
var clone = function(fn) {
	    // Workaround for commander.js issue.
	    // http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if(require.main == module) {
	    program
		            .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
			         .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
				    .option('-u, --url <url>', 'Url')
				            .parse(process.argv);
	    program.url ? checkFromUrl(program.url, program.checks) : checkFromDisc(program.file, program.checks);
} else {
	    exports.checkHtmlFile = checkHtmlFile;
}
