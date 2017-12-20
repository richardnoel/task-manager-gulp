const log = require('gutil-color-log');
const gulpUtil = require('./gulpUtilFunctions.js');

var taskManager = function (options) {
	this.modes = {
		develop: 'dev',
		production: 'prod',
		default: 'dev'
	};
	if (options.pathModule) {
		this.pathModule = options.pathModule;
	} else {
		this.pathModule = '{app}/src/main/{module}';
	}
	if (options.destiny) {
		this.destiny = options.destiny;
	} else {
		this.destiny = '{app}/src/main/webapp2';
	}
	this.timeOutToWatch = options.timeOutToWatch || 3000;
	this.modules = null;
	this.settingsList = null;
	this.watch = options.watch || false;
	this.runningWatch = false;
	this.listWatch = [];
	this.gUtil = new gulpUtil();
	this.buildModulesPath = function (mainConfig) {
		var apps = mainConfig.aplications || {};
		var filesConfig = mainConfig.filesConfig || [];
		var modules = [];
		for (var app in apps) {
			if (apps[app].length) {
				for (var i = 0; i < apps[app].length; i += 1) {
					var pathMod = this.pathModule;
					var destMod = this.destiny;
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
		this.modules = modules;
	};

	this.fixAbsolutePath = function (files, target) {
		for (var item in files) {
			if (typeof files[item] === "object" && files[item].length) {
				var itemFile = files[item];
				for (var index = 0; index < itemFile.length; index += 1) {
					var file = itemFile[index];
					if (file.indexOf(target) === -1) {
						itemFile[index] = target + itemFile[index];
					}
				}
			}
		}
	};

	this.readFilesConfig = function () {
		log('blue', 'Init read files');
		for (var i = 0; i < this.modules.length; i += 1) {
			var configPaths = this.modules[i].configPaths;
			log('blue', '--------------' + this.modules[i].name.toUpperCase() + '--------------');
			for (var config in configPaths) {
				try {
					var configFile = new require('../../' + configPaths[config]);
					if (typeof configFile === 'function') {
						var files = configFile(this.modules[i].source);
						this.fixAbsolutePath(files, this.modules[i].source);
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

	this.standardizeSettings = function (config) {
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
			};
			settings.destiny = this.renameDest(config, configTask.folderDest);
			if (confType === 'copy') {
				settings.files = {
					dir: configTask.dir || [],
					files: configTask.files || [],
					font: configTask.font || []
				};
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

	this.buildConfig = function () {
		var modulesConf = [];
		if (this.modules) {
			for (var i = 0; i < this.modules.length; i += 1) {
				var config = this.modules[i];
				var settings = this.standardizeSettings(config);
				modulesConf.push(settings);
			}
		}
		this.settingsList = modulesConf;
	};

	this.setMode = function (mode) {
		if (this.modes[mode]) {
			this.mode = this.modes[mode];
		} else {
			this.mode = this.modes['default'];
		}
	};

	this.executeTasks = function (mode) {
		var that = this;
		this.setMode(mode);
		if (this.settingsList.length) {
			log('blue', 'Init execute task');
			for (var i = 0; i < this.settingsList.length; i += 1) {
				var moduleConfigs = this.settingsList[i];
				if (moduleConfigs[0] && moduleConfigs[0].destiny) {
					this.gUtil.cleanDirectory(moduleConfigs[0].destiny);
				}
				for (var j = 0; j < moduleConfigs.length; j += 1) {
					var setting = moduleConfigs[j];
					if (this.watch) {
						var list = this.createListToWath(setting);
						this.listWatch = this.listWatch.concat(list);
					}
					this.gUtil.executeTask(setting, this.mode);
				}
			}
		}
		if (this.watch && !this.runningWatch) {
			setTimeout(function () {
				that.runWatch();
			}, that.timeOutToWatch);
		}
	};

	this.runWatch = function () {
		var that = this;
		this.runningWatch = true;
		this.gUtil.fixWatch(this.listWatch, function () {
			that.executeTasks(this.mode);
		});
	};

	this.createListToWath = function (setting) {
		var listFiles = [];
		if (setting.type === 'js' || setting.type === 'css') {
			listFiles = listFiles.concat(setting.files);
		} else if (setting.type === 'copy') {
			for (var item in setting.files) {
				if (item === 'dir') {
					var folders = setting.files[item];
					var auxListFolders = [];
					for (var k = 0; k < folders.length; k += 1) {
						var folder = folders[k];
						folder = folder + '/**/*.*';
						auxListFolders.push(folder);
					}
					listFiles = listFiles.concat(auxListFolders);
				} else {
					listFiles = listFiles.concat(setting.files[item]);
				}
			}
		}
		return listFiles;
	};

	this.obfuscatorRun = function () {
		for (var i = 0; i < this.settingsList.length; i += 1) {
			var moduleConf = this.settingsList[i];
			for (var j = 0; j < moduleConf.length; j += 1) {
				var fileConfig = moduleConf[j];
				if (fileConfig['type'] === 'js' || fileConfig['type'] === 'css') {
					prodConfig = {
						file: fileConfig['destiny'] + '/' + fileConfig['name'] + '.' + fileConfig['type'],
						name: fileConfig['name'],
						destiny: fileConfig['destiny'],
						type: fileConfig['type']
					};
					var gUtil2 = new gulpUtil();
					gUtil2.obfuscatorRun(prodConfig, 'prod');
				}
			}
		}
	};
};

if (typeof exports !== 'undefined') {
	module.exports = taskManager;
}