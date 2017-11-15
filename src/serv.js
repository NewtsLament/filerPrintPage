var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var exec = require('child_process').exec;

// We are doing two things here, either we ar serving the html form page.
// Or if a file has been posted, then we deal with the file and return an appropriate response for the user.

class Uploader {
	constructor(req,res) {
		this.res = res;
		this.req = req;
		this.path = null;
		this.pages = "";
		this.copies = "1";
		this.form = new formidable.IncomingForm();
		this.form.keepExtensions = true;
	}
	lpout(error,stdout,stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	}
	printfile() {
		console.log("Printing: " + this.path);
		if (this.pages != "") {
			console.log("With pages parameter: " + this.pages);
		}
		console.log("Number of copies: " + this.copies);
		if (this.pages != "") {
			exec("lp -n " + this.copies + " -P " + this.pages + " " + this.path,this.lpout);
		} else {
			exec("lp -n " + this.copies + " " + this.path,this.lpout);
		}
	}
	formler(err, fields, files) {
		this.path = files.filetoupload.path;
		this.pages = fields.pages;
		this.copies = fields.copies;
	}
	upload() {
		this.form.parse(this.req, this.formler.bind(this));
		this.form.on('end', this.printfile.bind(this));
		return 'Fil uploades..';
	}
}

var main = {
	data : "I was not changed.",
	filer : function (err,data) {
		temp = 'Et eller andet gik galt.';
		if (err) {
			if (err.message) {temp = err.message;}
			this.data = '<p>' + temp + '</p>';
			throw err;
		} else {
			this.data = data;
		}
	},
	choose : function (req, res) {
		var out = null;
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8',});
		if (req.url == '/fileupload') {
			var upper = new Uploader(req,res);
			out = upper.upload();
		} else {
			out = this.data;
		}
		res.write(out);
		res.end();
	},
	run : function () {
		fs.readFile('filer.html', this.filer.bind(this));
		this.serv = http.createServer(this.choose.bind(this));
		this.serv.listen(8080);
	}
};

main.run();
