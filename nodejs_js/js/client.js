// Edit me. Feel free to create additional .js files.
/*
 * Beta version for interview use only
 * 
 * Developed by Wei Wang on 03/11/2016
 * 
 * GPL license
 */
( function( window, undefined ) {

	'use strict';

	// Utility functions for 
	function isArray( obj ) {
		return Object.prototype.toString.call( obj ) === "[object Array]";
	}

	function isObject( obj ) {
		return Object.prototype.toString.call( obj ) === "[object Object]";
	}

	var console = window.console;

	// check for canvas support
	var canvas = document.createElement('canvas');
	var isCanvasSupported = canvas.getContext && canvas.getContext('2d');

	// Don't proceed if canvas is no supported
	if ( !isCanvasSupported ) {
		return;
	}


	function InitPixelOperation( img, options ) {
		this.img = img;
		// creat canvas
		var canvas = this.canvas = document.createElement('canvas');
		this.cxt = canvas.getContext('2d');
		// copy attributes from img to canvas
		canvas.className = img.className;
		canvas.id = img.id;

		this.render( options );

		// replace image with canvas
		img.parentNode.replaceChild( canvas, img );

	}

	InitPixelOperation.prototype.render = function( options ) {
		this.options = options;
		// set size
		var w = this.width = this.canvas.width = this.img.width;
		var h = this.height = this.canvas.height = this.img.height;
		// draw image on canvas
		this.cxt.drawImage( this.img, 0, 0 );
		// get imageData

		try {
			this.imgData = this.cxt.getImageData( 0, 0, w, h ).data;
		} catch ( error ) {
			if ( console ) {
				console.error( error );
			}
			return;
		}

		this.cxt.clearRect( 0, 0, w, h );

		for ( var i=0, opt_len = options.length; i < opt_len; i++ ) {
			this.render_Pixels( options[i] );
		}

	}

	InitPixelOperation.prototype.render_Pixels = function( opts ) {
		var w = this.width;
		var h = this.height;
		var cxt = this.cxt;
		var imgData = this.imgData;

		// option defaults
		var res = opts.resolution || 2;
		var size = opts.size || res;
		var alpha = opts.alpha || 1;
		var offset = opts.offset || 0;
		var offsetX = 0;
		var offsetY = 0;
		var cols = w / res + 1;
		var rows = h / res + 1;
		var halfSize = size / 2;

		if ( isObject( offset ) ){ 
			offsetX = offset.x || 0;
			offsetY = offset.y || 0;
		} else if ( isArray( offset) ){
			offsetX = offset[0] || 0;
			offsetY = offset[1] || 0;
		} else {
			offsetX = offsetY = offset;
		}

		var row, col, x, y, pixelY, pixelX, pixelIndex, red, green, blue, pixelAlpha;

		for ( row = 0; row < rows; row++ ) {
			y = ( row - 0.5 ) * res + offsetY;
			// normalize y so shapes around edges get color
			pixelY = Math.max( Math.min( y, h-1), 0);

			for ( col = 0; col < cols; col++ ) {
				x = ( col - 0.5 ) * res + offsetX;
				// normalize y so shapes around edges get color
				pixelX = Math.max( Math.min( x, w-1), 0);
				pixelIndex = ( pixelX + pixelY * w ) * 4;
				red   = imgData[ pixelIndex + 0 ];
				green = imgData[ pixelIndex + 1 ];
				blue  = imgData[ pixelIndex + 2 ];
				pixelAlpha = alpha * ( imgData[ pixelIndex + 3 ] / 255);

				cxt.fillStyle = 'rgba(' + red +','+ green +','+ blue +','+ pixelAlpha + ')';

				// square
				cxt.fillRect( x - halfSize, y - halfSize, size, size );
			} // end of for circle of column
		} // end of for circle of row
	}

	// enable img.closePixelate
	HTMLImageElement.prototype.initPixelate = function ( options ) {
		return new InitPixelOperation( this, options );
	}

	// put in global namespace
	window.InitPixelOperation = InitPixelOperation;
})( window );

// common variables
var iMaxFilesize = 1048576; // 1MB

function fileSelected() {

	// clear the warning messages first
	document.getElementById('error').style.display = 'none';
	document.getElementById('warnsize').style.display = 'none';
	
	// get selected file element
	var oFile = document.getElementById('image_file').files[0];

	// filter for image files
	var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
	if (! rFilter.test(oFile.type)) {
		document.getElementById('error').style.display = 'block';
		return;
	}

	// little test for filesize
	if (oFile.size > iMaxFilesize) {
		document.getElementById('warnsize').style.display = 'block';
		return;
	}

	// get preview element, it should be canvas element now
	var currImgPrev = document.getElementById('preview');
	var tmpImage = new Image(); 
	
	// if it is canvas, convert it to image  
	var oReader = new FileReader();
	if ( currImgPrev.getContext && currImgPrev.getContext('2d')) {
		// copy attributes from canvas to image
		tmpImage.className = currImgPrev.className;
		tmpImage.id = currImgPrev.id;
		oReader.onload = function(e){
			tmpImage.src = e.target.result;
		};
		// read selected file as DataURL
		oReader.readAsDataURL(oFile);
		// change the canvas object to image object for next time use
		currImgPrev.parentNode.replaceChild( tmpImage, currImgPrev );
		// initialize the tiles resolution value
		document.getElementById('range').value = 0;
		document.getElementById('output').textContent = 0;
	}else{
		oReader.onload = function(e){
			currImgPrev.src = e.target.result;
		};
		// read selected file as DataURL
		oReader.readAsDataURL(oFile);
	}
}
