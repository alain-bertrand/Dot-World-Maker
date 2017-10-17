/// <binding BeforeBuild='compile' Clean='clean' ProjectOpened='default' />
"use strict";

var gulp = require("gulp");
var rimraf = require("rimraf");
var typescript = require("gulp-typescript");
var less = require("gulp-less");
var util = require("gulp-util");
var sourcemaps = require('gulp-sourcemaps');

function clean(path)
{
    var fs = require("fs");
    if (fs.existsSync(path))
        fs.unlinkSync(path);
}

function swallowError(error)
{
    // If you want details of the error in the console
    console.log(error.toString())

    this.emit('end')
}

var tsMaker = typescript.createProject({
    out: "maker.js",
    module: "system",
    target: "es5",
    experimentalDecorators: true,
    sourceMap: true,
});

var tsRuntime = typescript.createProject({
    outFile: "runtime.js",
    module: "system",
    target: "es5",
    experimentalDecorators: true,
    sourceMap: true,
});

gulp.task("default", function ()
{
    process.chdir(__dirname);
    console.log("Hi there Dot World Maker Developer!");
    console.log("I will watch for you all the TS and LESS files and compile them as needed.");
    console.log(" ");
    gulp.watch(["public/Engine/**/*.ts", "!public/Engine/**/version.ts"], ["compile:client"]);
    gulp.watch("server/**/*.ts", ["compile:server"]);
    gulp.watch("public/**/*.less", ["compile:less"]);
});

gulp.task("clean", ["clean:js", "clean:css"]);
gulp.task("compile", ["compile:less", "compile:client", "compile:server"]);

gulp.task("compile:less", function ()
{
    process.chdir(__dirname);
    return gulp.src(['./public/Less/engine.less']).pipe(less({})).pipe(gulp.dest('./public/Less')).on('error', swallowError);
});

gulp.task("clean:css", function (cb)
{
    process.chdir(__dirname);
    clean('./public/Less/engine.css');
    cb();
});

gulp.task("clean:js", function (cb)
{
    process.chdir(__dirname);
    clean('./public/maker.js');
    clean('./public/maker.js.map');
    clean('./public/runtime.js');
    clean('./public/runtime.js.map');
    clean('./app.js');
    clean('./app.js.map');
    cb();
});

gulp.task("compile:client", ["compile:maker", "compile:runtime"]);

gulp.task('compile:maker', function ()
{
    process.chdir(__dirname + "/public");

    gulp.src(['./Engine/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(tsMaker())
        .pipe(sourcemaps.write(".", {
            includeContent: false, addComment: true 
        }))
        .pipe(gulp.dest("."))
        .on('error', swallowError)
        .on('finish', function ()
        {
            util.log(util.colors.cyan("Maker compilation complete"));
        });
});

gulp.task('compile:runtime', function ()
{
    process.chdir(__dirname + "/public");

    gulp.src(['./Engine/Logic/**/*.ts', './Engine/Module/MapEditor/MapEditorData.ts', './Engine/Module/ZoneEditor/ZoneEditorData.ts', './Engine/GUI/**/*.ts', './Engine/Libs/**/*.ts', './Engine/*.ts', './Engine/Module/Play/*.ts', './Engine/Module/GameList/*.ts', './Engine/Module/Logout/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(tsRuntime())
        .pipe(sourcemaps.write(".", { includeContent: false, addComment: true }))
        .pipe(gulp.dest("."))
        .on('error', swallowError)
        .on('finish', function ()
        {
            util.log(util.colors.cyan("Runtime compilation complete"));
        });
});

gulp.task('compile:server', function ()
{
    process.chdir(__dirname);
    gulp.src(['server/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(typescript({
            out: "app.js",
            module: "system",
            target: "es5",
            experimentalDecorators: true,
            sourceMap: true,
        }))
        .pipe(sourcemaps.write(".", { includeContent: false, addComment: true }))
        .pipe(gulp.dest("."))
        .on('error', swallowError)
        .on('finish', function ()
        {
            util.log(util.colors.cyan("Server compilation complete"));
        });
});