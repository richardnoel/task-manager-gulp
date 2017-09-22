'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const log = require('gutil-color-log');
const copy = require('copy');
const copydir = require('copy-dir');
const sass = require('gulp-sass');
const del = require('del');
const mkdirp = require('mkdirp');
const sourcemaps = require('gulp-sourcemaps');
const read = require('read-file');
const fs = require('fs');
const minifyCSS = require('gulp-minify-css');
const javaScriptObfuscator = require('javascript-obfuscator');
const writeFile = require('write');

var self;
var timeoutCompileSass = 500;
var gulpUtil = function () {
	this.factory = {
		css: this.cssBuild,
		copy: this.copy,
		js: this.jsBuild
	};
	self = this;
};

gulpUtil.prototype.jsBuild = function (settings, mode) {
	self.jsDev(settings);
};

gulpUtil.prototype.jsDev = function (settings) {
	gulp.src(settings.files)
									.pipe(concat(settings.name + '.js'))
									.pipe(gulp.dest(settings.destiny));
	log('green', settings.destiny + ' jsDev --> successful task!');
};

gulpUtil.prototype.obfuscatorRun = function (settings) {
	if (fs.existsSync(settings.file)) {
		read(settings.file, {encoding: 'utf8'}, function (err, buffer) {
			log('green', settings.file);
			var configObfusator = {
				compact: true,
				sourceMap: true,
				sourceMapMode: 'separate',
				disableConsoleOutput: true,
				mangle: true,
				log: true,
				rotateStringArray: true,
				selfDefending: true,
				stringArray: true,
				stringArrayThreshold: 0.75
			};
			var obfuscationResult = javaScriptObfuscator.obfuscate(buffer, configObfusator);
			writeFile.promise(settings.file, obfuscationResult.getObfuscatedCode()).then(function () {
				log('green', settings.destiny + '---> Obfuscation completed!!');
			});
			fs.open(settings.destiny + '/' + settings.name + '.js.map', 'wx', (err, fd) => {
				if (err) {
					console.log(err);
				}
				writeFile.promise(settings.destiny + '/' + settings.name + '.js.map', obfuscationResult.getSourceMap())
												.then(function () {
													log('green', settings.destiny + '---> sourcemaps completed!!');
												});
			});
		});
	} else {
		console.log('---!!!!!!no existe');
	}
};

gulpUtil.prototype.cleanDirectory = function (dir) {
	del.sync([dir], {force: true});
	return mkdirp(dir, function (err) {
		if (err) {
			log('red', err);
		}
	});
};

gulpUtil.prototype.copy = function (settings) {
	for (var i in  settings.files) {
		if (i === 'dir') {
			for (var j = 0; j < settings.files[i].length; j += 1) {
				var originDir = settings.files[i][j];
				var index = originDir.lastIndexOf('/');
				var nameDir = originDir.substring(index, originDir.length);
				self.copyDir(settings.files[i][j], settings.destiny + nameDir);
			}
		}
		if (i === 'file') {
			self.copyFiles(settings.files[i], settings.destiny);
		}
		if (i === 'font') {
			self.copyFiles(settings.files[i], settings.destinyParent + '/font');
		}
	}
	log('green', settings.destiny + ' copy --> successful task!');
};

gulpUtil.prototype.copyFiles = function (originfiles, destiny) {
	gulp.src(originfiles).pipe(gulp.dest(destiny));
};

gulpUtil.prototype.copyDir = function (originDir, destiny) {
	copydir(originDir, destiny, function () {});
};


gulpUtil.prototype.cssBuild = function (settings, mode) {
	var sassList = [];
	var cssList = [];
	for (var i = 0; i < settings.files.length; i += 1) {
		var index = settings.files[i].lastIndexOf('.');
		var file = settings.files[i];
		if (file.substring(index + 1, file.length) === 'scss') {
			sassList.push(file);
		} else {
			cssList.push(file);
		}
	}
	if (sassList.length) {
		self.sassCompile(sassList, settings.name, settings.destiny);
	}
	setTimeout(function () {
		var files = [];
		files.push(settings.destiny + '/' + settings.name + '.css');
		files = files.concat(cssList);
		if (mode === 'dev') {
			gulp.src(files)
											.pipe(concat(settings.name + '.css'))
											.pipe(gulp.dest(settings.destiny));
		} else {
			gulp.src(files)
											.pipe(concat(settings.name + '.css'))
											.pipe(sourcemaps.init())
											.pipe(sourcemaps.init({loadMaps: true}))
											.pipe(minifyCSS())
											.pipe(sourcemaps.write('/'))
											.pipe(gulp.dest(settings.destiny));
		}
		log('green', settings.destiny + ' cssDev --> successful task!');
	}, timeoutCompileSass);
};


gulpUtil.prototype.sassCompile = function (sassList, name, destiny) {
	gulp.src(sassList)
									.pipe(sass.sync().on('error', sass.logError))
									.pipe(concat(name + '.css'))
									.pipe(gulp.dest(destiny));
};

gulpUtil.prototype.executeTask = function (setting, mode) {
	if (self.factory[setting.type]) {
		self.factory[setting.type](setting, mode);
	} else {
		log('red', setting.type + 'the function not exist!');
	}
};

gulpUtil.prototype.executeProdTask = function (setting, mode) {
	if (self.factory[setting.type]) {
		self.factory[setting.type](setting, mode);
	} else {
		log('red', setting.type + 'the function not exist!');
	}
};

if (typeof exports !== 'undefined') {
	module.exports = gulpUtil;
}