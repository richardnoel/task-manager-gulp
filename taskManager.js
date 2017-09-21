const gulp = require('gulp');
const log = require('gutil-color-log');
const readFiles = require('read-files-promise');
const gulpUtil = require('./gulpUtilFunctions.js');
//configuración de dirrecciones de modulos
var pathFilesConfig = '{module}/config/{type}.config.js';
var pathModule = '{app}/src/main{module}';
var destiny = '{app}/src/main/webapp2';

var taskManager = function(){
	this.buildModulesPath = function (mainConfig) {
		var apps = mainConfig.aplications || {};
		var filesConfig = mainConfig.filesConfig || [];
		var modules = [];
		for (var app in apps) {
			if (apps[app].length) {
				for (var i = 0; i < apps[app].length; i += 1) {
					var pathMod = pathModule;
					var destMod = destiny;
					var index = apps[app][i].lastIndexOf('/');
					var nameMod = apps[app][i].substring(index + 1, apps[app][i].length);
					var listConfig = {};
					pathMod = pathMod.replace(/{app}/g, app);
					pathMod = pathMod.replace(/{module}/g, apps[app][i]);
					destMod = destMod.replace(/{app}/g, app);
					for (var type in filesConfig) {
						listConfig[type] = pathMod + '/config' + filesConfig[type];
					}
					modules.push({
						source: pathMod,
						destiny: destMod + '/' + nameMod,
						configPaths: listConfig,
						name: nameMod,
						destinyParent: destMod
					});
				}
			}
		}
		return modules;
	};

	this.readFilesConfig = function (modules) {
		log('blue', 'Init read files');
		for (var i = 0; i < modules.length; i += 1) {
			var configPaths = modules[i].configPaths;
			log('blue', '--------------' + modules[i].name.toUpperCase() + '--------------');
			for (var config in configPaths) {
				try {
					var configFile = new require(configPaths[config]);
					if (typeof configFile === "function") {
						var files = configFile(modules[i].source);
						log('green', configPaths[config] + ' ok!');
						configPaths[config] = files;
					} else {
						log('yellow', configPaths[config] + ' is not a instantiable function!');
					}
				} catch (e) {
					log('yellow', e.message);
					log('yellow', configPaths[config] + ' inaccessible!');
					delete configPaths[config];
				}
			}
		}
	};

	this.standardizeSettings = function (config, e) {
		var confType;
		var configList = [];
		for (var confType in config.configPaths) {
			var configTask = config.configPaths[confType];
			var settings = {
				type: confType,
				source: config.source,
				files: configTask.base,
				name: configTask.nameBuild || config.name || 'build',
				destinyParent: config.destinyParent
			}
			settings.destiny = this.renameDest(config, configTask.folderDest);
			if (confType === "copy") {
				settings.files = {
					dir: configTask.dir || [],
					file: configTask.file || [],
					font: configTask.font || []
				}
			}
			configList.push(settings);
		}
		return configList;
	};

	this.renameDest = function (config, otherDest) {
		var currentDest = config.destiny;
		if (otherDest) {
			var newDest = currentDest.substring(0, currentDest.lastIndexOf('/') + 1);
			newDest = newDest + otherDest;
			currentDest = newDest;
		}
		return currentDest;
	};

	this.buildConfig = function (modulesConfig) {
		var modulesConf = [];
		if (modulesConfig) {
			for (var i = 0; i < modulesConfig.length; i += 1) {
				var config = modulesConfig[i];
				var settings = this.standardizeSettings(config);
				modulesConf.push(settings);
			}
		}
		return modulesConf;
	};

	this.executeTasks = function (settingsList, mode, e) {
		if (settingsList.length) {
			log('blue', 'Init execute task');
			var tasks = new gulpUtil();
			for (var i = 0; i < settingsList.length; i += 1) {
				var moduleConfigs = settingsList[i];
				if (moduleConfigs[0] && moduleConfigs[0].destiny) {
					tasks.cleanDirectory(moduleConfigs[0].destiny);
				}
				for (var j = 0; j < moduleConfigs.length; j += 1) {
					var setting = moduleConfigs[j];
					if (tasks.factory['dev'][setting.type]) {
						tasks.factory['dev'][setting.type](setting, e);
					}
				}
			}
		}
	};
}