"use strict";
const gulp = require("gulp");
const concat = require("gulp-concat");
const log = require('gutil-color-log');
const copy = require('copy');
const copydir = require('copy-dir');
const sass = require('gulp-sass');
const del = require("del");
const mkdirp = require('mkdirp');
var selft;
var timeoutCompileSass = 500;
var gulpUtil = function (files, destiny, name, type) {
	this.factory = {
		dev: {
			js: this.jsDev,
			css: this.cssDev,
			sass: this.sassCompile,
			copy: this.copy
		},
		prod: {
			js: this.jsProd,
			css: this.cssProd,
			sass: this.sassCompile,
			copy: this.copy
		}
	};
	selft = this;
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
				selft.copyDir(settings.files[i][j], settings.destiny + nameDir);
			}
		}
		if (i === 'file') {
			selft.copyFiles(settings.files[i], settings.destiny);
		}
		if (i === 'font') {
			selft.copyFiles(settings.files[i], settings.destinyParent + '/font');
		}
	}
};

gulpUtil.prototype.copyFiles = function (originfiles, destiny) {
	gulp.src(originfiles).
									pipe(gulp.dest(destiny));
};

gulpUtil.prototype.copyDir = function (originDir, destiny) {
	copydir(originDir, destiny, function () {});
};


gulpUtil.prototype.jsDev = function (settings) {
	gulp.src(settings.files)
									.pipe(concat(settings.name + '.js'))
									.pipe(gulp.dest(settings.destiny));
	log('green', settings.destiny + ' jsDev --> successful task!');
};

gulpUtil.prototype.cssDev = function (settings) {
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
		selft.sassCompile(sassList, settings.name, settings.destiny);
	}

	setTimeout(function () {
		var files = [];
		files.push(settings.destiny + '/' + settings.name + ".css");
		files = files.concat(cssList);
		gulp.src(files)
										.pipe(concat(settings.name + ".css"))
										.pipe(gulp.dest(settings.destiny));
		log('green', settings.destiny + ' cssDev --> successful task!');

	}, timeoutCompileSass);
};

gulpUtil.prototype.sassCompile = function (sassList, name, destiny) {
	gulp.src(sassList)
									.pipe(sass.sync().on('error', sass.logError))
									.pipe(concat(name + ".css"))
									.pipe(gulp.dest(destiny));
};


if (typeof exports !== "undefined") {
	module.exports = gulpUtil;
}
