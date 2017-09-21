![status](https://github.com/richardnoel/taskManagerGulp.git)

managerTaskGulp
==========

A module for execute task to development project

Usage
-----

```javascript
const gulp = require('gulp');
const taskManager = require('task-manager-gulp');
//configuración de dirrecciones de modulos
/*
* {app} => variable de proyectos principal
* {module} => Lista de modulos que contiene el proyecto principal 
*/
gulp.task('test', function (e) {
	var gulpManager = new taskManager({
		pathModule: '{app}/src/main/{module}',
		destiny: '{app}/src/main/webapp2',
	});
	var mainConfig = require('./config/aplications.js');
	var modules = gulpManager.buildModulesPath(mainConfig);
	gulpManager.readFilesConfig(modules);
	var settingsList = gulpManager.buildConfig(modules, 'dev', e);
	gulpManager.executeTasks(settingsList);
});

//archivo requerido de  estructura del proyectos y modulos de proyectos 
"use strict";
var config = {
	aplications: {
		'union-showcase-web' : [
			'showcase/unikit'
		],
		'union-static-web': [
			'interfaces/unikit',
			'modules/angular',
			'modules/bootstrap',
			'modules/jquery',
			'templates/default'
		]
	},
	filesConfig: {
		js: '/js.config.js',
		css: '/css.config.js',
		copy: '/cp.config.js',
		doc: '/doc.config.js',
		json: '/json.config.js'
	}
};
module.exports = config;


// configuración de los archivos config.js, que se deben encontrar en cada modulo de cada proyecto  
// para la configuracion del ejemplo
// {app}/src/main/{module} --> union-showcase-web/src/main/showcase/unikit
// {app}/src/main/{module} --> union-static-web/src/main//interfaces/unikit

//archivo js.config.js
var jsConfig = function(sourcePath){
    var sourcePath = sourcePath || '';
    var files =  {
        folderDest: 'angularjs',
        nameBuild: 'build',
        base: [
            sourcePath + "/file.js"
        ],
        excludeToProd: []
    }
    return files;
};

if (typeof exports !== "undefined") {
    module.exports = jsConfig;
}

//archivo css.config.js
var cssConfig = function(sourcePath){
    var sourcePath = sourcePath || '';
    var files =  {
        folderDest: 'angularjs',
        nameBuild: 'build',
        base: [
            sourcePath + "/file.css"
        ],
        excludeForProd: []
    }
    return files;
};

if (typeof exports !== "undefined") {
    module.exports = cssConfig;
}

//archivo cp.config.js
var cpConfig = function(sourcePath){
    var sourcePath = sourcePath || '';
    var files =  {
		folderDest: 'angularjs',
        nameBuild: 'build',
        dir: [
            sourcePath + "/dir/"  
        ],
        files:[
        	sourcePath + '/templates/test.html',
        	sourcePath + '/3.3.7/fonts/*'
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
