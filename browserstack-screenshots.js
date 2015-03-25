var fs = require('fs');
var parseArgs = require('minimist');
var request = require('request');

var args = parseArgs(process.argv);
var bailOut = false;

var username;
var auth_key;

var urlFile;
var urlList;

var browserFile;
var browsers;

var emailAddress;
var emailPassword;
var emailProvider;

var resultsFile;



if(!args.browserstackCredentials) {
	console.log('<!> You must supply BrowserStack Credentials.  use --browserstackCredentials');
	bailout = true;
} else {
	userName = args.browserstackCredentials.split(':')[0];
	auth_key = args.browserstackCredentials.split(':')[1];
}

if(!args.urlFile && !args.urls) {
	console.log('<!> Either a url file(using --urlFile), or a comma separated list of urls(using --urls) must be supplied');
	bailOut = true;
} else {
	if(args.urlFile) {
		urlFile = fs.readFileSync(args.urlFile, { encoding: 'utf8' });
		urlList = urlFile.split('\n');
	} else {
		urlList = args.urls.split(',');
	}
}

if(!args.browserFile) {
	console.log('<!> A browser file must be specificed.  Use --browserFile');
	bailOut = true;
} else {
	browserFile = fs.readFileSync(args.browserFile, {encoding: 'utf8'});
	browsers = JSON.parse(browserFile);
}

if(bailOut) {
	console.log('ERRORS FOUND.  Quitting....');
	process.exit();
}

if(!args.resultsFile) {
	console.log('No results file specified.');
	if(!args.emailCredentials) {
		console.log('Outputting results to STDOUT');
	} else {
		emailAddress = args.emailCredentials.split(':')[0];
		emailPassword = args.emailCredentials.split(':')[1];
		emailProvider = args.emailCredentials.split(':')[2];
		console.log('Sending results to ' + emailAddress + ' through ' + emailProvider);
	}
} else {
	resultsFile = args.resultsFile;
}

urlList.forEach(function(requestedURL) {
	var url = 'http://' + userName + ':' + auth_key + '@www.browserstack.com/screenshots'
	var requestOptions = {
		method: 'POST',
		uri: url,
		body: JSON.stringify({
			url: requestedURL,
			browsers: browsers,
			quality: 'compressed'
		})
	};

	console.log(requestOptions);

	request(requestOptions, function(err, response, body) {
		if(err) {
			console.log(err);
			process.exit();
		} else {
			console.log('Results for ' + requestedURL);
			console.log(body);
		}
	});
});
