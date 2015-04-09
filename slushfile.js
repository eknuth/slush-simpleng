/*
 * slush-simpleeng
 * https://github.com/eknuth/slush-simpleeng
 *
 * Copyright (c) 2015, Edwin Knuth
 * Licensed under the MIT license.
 */

'use strict';

var gulp        = require('gulp');
var path        = require('path');
var install     = require('gulp-install');
var conflict    = require('gulp-conflict');
var template    = require('gulp-template');
var rename      = require('gulp-rename');
var _           = require('lodash');
_.string        = require('underscore.string');
var inquirer    = require('inquirer');
var fs          = require('fs');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var workingDir = process.cwd();

var defaults = (function() {
    var workingDirName = path.basename(workingDir);
    var homeDir, osUserName, configFile, user;
    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    } else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (fs.existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }
    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        componentName: "AngularModule"
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    }, {
        name: 'componentName',
        message: 'What is the name of your angular component?',
        default: defaults.componentName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is the github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function(answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            gulp.src(__dirname + '/templates/app/**')
                .pipe(template(answers))
                .pipe(rename(function(file) {
                    if (file.basename[0] === '_') {
                        file.basename = '.' + file.basename.slice(1);
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function() {
                    done();
                });
        });
});

gulp.task('service', function (done) {
    var glob = require('glob');
    var serviceBaseName = [gulp.args[0], 'service'].join('_');
    var existingServices = glob.sync(workingDir + '/src/services/*_service.js').map(function (file) {
        return path.basename(file, '.js');
    });
    existingServices.push(serviceBaseName);
    var answers = {
        existingServices: _.uniq(existingServices),
        serviceName: serviceBaseName
    }
    gulp.src(__dirname + '/templates/services/**')
        .pipe(template(answers))
        .pipe(rename(function(file) {
            file.dirname = './src/services';

            if (file.basename === 'service') {
                file.basename = serviceBaseName;
            } else if (file.basename === 'spec') {
                file.basename = serviceBaseName + '_spec';
                file.dirname = './spec';
            }
        }))
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'))
        .on('end', function() {
            done();
        });
})
