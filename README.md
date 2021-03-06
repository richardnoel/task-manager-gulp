![status](https://github.com/richardnoel/taskManagerGulp.git)

managerTaskGulp
==========

A module for execute task to development project

Usage
-----

```javascript
// Use example

const gulp = require('gulp');
const taskManager = require('task-manager-gulp');
const runSeq = require('run-sequence');

var buildMode;

// Creation of the 'gulpManager'
// Configuration construction, importing the main configuration file
var createGulpManager = function (mode, observable) {
	gulpManager = new taskManager({
		pathModule: "{app}/src/main/{module}",
		destiny: "{app}/src/main/webapp",
		mode: mode || "dev",
		watch: observable || false
	});
	
	var mainConfig = require("./config/config.js");
	gulpManager.buildModulesPath(mainConfig);
	gulpManager.readFilesConfig();
	gulpManager.buildConfig();
};

gulp.task("dev", function () {
	createGulpManager("develop", false);
	gulpManager.executeTasks("develop");
});


gulp.task('prod', function () {
	runSeq(['dev', 'buildProd']);
});


gulp.task('buildProd', function () {
	setTimeout(function () {
		gulpManager.obfuscatorRun();
	}, 3000);
});

// CONFIGURATION FILES

// Required structure file of projects and project modules './config/aplications.js'

"use strict";
var config = {
	aplications: {
		'any-web-project' : [
			'module1/template'
		],
		'any-web-project2': [
			'module1/custom',
			'module2/angular',
			'module3/bootstrap',
			'module4/jquery'
		]
	},
	filesConfig: {
		js: '/js.config.js',
		css: '/css.config.js',
		copy: '/cp.config.js'
	}
};
module.exports = config;


// 
// Creating addresses for reading configuration files.
// 
// for project 'any-web-project'
// {app}/src/main/{module} --> any-web-project/src/main/module1/template
// ....
// for project 'any-web-project2'
// {app}/src/main/{module} --> any-web-project2/src/main/module1/unikit

//file required in {app}/src/main/{module}/config/js.config.js, to read javascript file settings

var jsConfig = function(){
    var files =  {
        folderDest: 'angularjs',
        nameBuild: 'build',
        base: [
            "/file.js"
        ],
        excludeToProd: []
    }
    return files;
};

if (typeof exports !== "undefined") {
    module.exports = jsConfig;
}

// File required in {app}/src/main/{module}/config/css.config.js, to read css file settings
// If you have sass files, you can attach them to the same list of base files

var cssConfig = function(){
    var files =  {
        folderDest: 'angularjs',
        nameBuild: 'build',
        base: [
            "/file.css",
            "/file.scss"
        ],
        excludeForProd: []
    }
    return files;
};

if (typeof exports !== "undefined") {
    module.exports = cssConfig;
}

// File required in {app}/src/main/{module}/config/css.config.js, to read copy file settings

var cpConfig = function(){
    var files =  {
		folderDest: 'angularjs',
        nameBuild: 'build',
        dir: [
            sourcePath + "/dir/"  
        ],
        files:[
        	'/templates/test.html',
        	'/3.3.7/fonts/*'
        ]
    }
    return files;
};

if (typeof exports !== "undefined") {
    module.exports = cpConfig;
}


```

LICENSE
-------

(MIT License)

Copyright (c) 2017 

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
