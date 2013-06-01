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
		case '/image':
			var extension = u.query.extension.split('.').pop();
			var img = fs.readFileSync('annotatedImage.'+extension);
			response.writeHead(200, {'Content-Type': 'image/'+extension });
			response.end(img, 'binary');
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
	
	var extend_image = function(callback){
		//target size is 930x120
		//170px blank space on left side
		im.convert(['resizedImage.'+extension, '-background', 'none', '-gravity', 'west', '-extent', '760x120', 'extendedImage.'+extension], function(){
			im.convert(['extendedImage.'+extension, '-background', 'none', '-gravity', 'east', '-extent', '930x120', 'extendedImage.'+extension], callback)
		});
	};
	
	var add_text = function(txt, callback){
		im.convert(['-font', 'Candice', '-pointsize', '72', '-fill', 'turquoise', 'extendedImage.'+extension, '-gravity', 'west', '-annotate', '+350+0', txt, 'annotatedImage.'+extension], callback);
	}
	
	save_image(query.url, function(){
		console.log('imaged saved locally as .'+extension);
		resize_image(function(){
			console.log('image resized locally');
			extend_image(function(){
				console.log('image extended');
				add_text(query.text, function(e){
					console.log('text added',e);
					var stat = fs.statSync('annotatedImage.'+extension);

					/*
					res.writeHead(200, {
						'Content-Type': 'image/'+extension,
						'Content-Length': stat.size
					});
					//res.write("data:image/"+extension+";base64,");
					var readStream = fs.createReadStream('annotatedImage.'+extension);
					readStream.pipe(res)
					*/
					res.end(extension);
					console.log('sending finished');
				})
			});
		});
	});
	
	
	
	
}