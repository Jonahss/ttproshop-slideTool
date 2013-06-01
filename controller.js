var fs = require('fs'),
	qs = require('qs'),
	im = require('imagemagick'),
	url = require('url'),
    http = require('http'),
	request = require('request');

var server = http.createServer();

server.on('request', function(request, response){
	var u = url.parse(request.url, true)
	
	console.log('pathname: ', u.pathname);
	switch(u.pathname){
		case '/submit':
			processSlide(u.query, request, response);
			break;
		default:
			fs.readFile('index.html', function(err, data){
				response.end(err || data);
			});
	}
	
	
	
});

server.listen("8080");
console.log("server running");

//////////////////////////////////////////
var processSlide = function(query, req, res){
	console.log('query: ', query);
	var extension;
	
	var save_image = function(u, callback){
		extension = u.split('.').pop();
		var stream = request(query.url).pipe(fs.createWriteStream('tempImage.'+extension)).end = callback;
	}
	
	var resize_image = function(callback){
		var resizeOptions = {
		  srcPath: 'tempImage.'+extension,
		  srcData: null,
		  srcFormat: null,
		  dstPath: 'resizedImage.'+extension,
		  quality: 0.8,
		  format: 'png',
		  progressive: false,
		  width: 0,
		  height: 120,
		}
		im.resize(resizeOptions, function(){
			callback();
		});
	};
	
	
	save_image(query.url, function(){
		console.log('imaged saved locally as .'+extension);
		resize_image(function(){
			console.log('image resized locally');
			
		});
	});
	
	
	
	
}