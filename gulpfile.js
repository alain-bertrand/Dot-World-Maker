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

    gulp.watch(["public/Engine/**/*.ts", "!public/Engine/**/version.ts"], gulp.series(compileMaker, compileRuntime));
    gulp.watch("server/**/*.ts", compileServer);
    gulp.watch("public/**/*.less", compileLess);
    cb();
});

gulp.task("clean", gulp.series(cleanJS, cleanCSS));
gulp.task("compile", gulp.series(compileLess, compileServer, compileMaker, compileRuntime));
gulp.task("increase-version", updateVersion);

gulp.task("compile:less", compileLess);

function compileLess(cb)
{
    process.chdir(__dirname);
    return gulp.src(['./public/Less/engine.less']).pipe(less({})).pipe(gulp.dest('./public/Less')).on('error', swallowError);
}

function cleanCSS(cb)
{
    process.chdir(__dirname);
    clean('./public/Less/engine.css');
    clean('./public/Less/home.css');
    cb();
}

function cleanJS(cb)
{
    process.chdir(__dirname);
    clean('./public/maker.js');
    clean('./public/maker.js.map');
    clean('./public/home.js');
    clean('./public/home.js.map');
    clean('./public/help/help.js');
    clean('./public/help/help.js.map');
    clean('./app.js');
    clean('./app.js.map');
    cb();
}

function compileServer(cb)
{
    process.chdir(__dirname);
    return gulp.src(['server/**/*.ts','typings/node.d.ts'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(typescript({
            out: "app.js",
            module: "system",
            target: "es2017",
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
}

function updateVersion()
{
    return new Promise(function (ok, err)
    {
        process.chdir(__dirname + "/public");

        var fs = require("fs");
        fs.readFile("./Engine/Module/About/version.ts", "utf8", function (err2, data)
        {
            var lastBuild = data;
            if (err2)
            {
                err(err2)
                return;
            }
            var m = lastBuild.match(/engineVersion\s*=\s*"([^"]+)"/i);
            var version = m[1].split('.');
            version[version.length - 1] = "" + (parseInt(version[version.length - 1]) + 1);
            var newVersion = "var engineVersion = \"" + version.join(".") + "\";\n";
            newVersion += "var engineBuild = \"" + (new Date).toUTCString() + "\";\n";

            fs.writeFile("./Engine/Module/About/version.ts", newVersion, "utf8", function (err3)
            {
                if (err3)
                {
                    err(err3);
                    return;
                }
                console.log("end");
                ok();
            });
        });
    });
}

function compileMaker(cb)
{
    process.chdir(__dirname + "/public");

    return gulp.src(['./Engine/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.identityMap())
        .pipe(typescript({
            out: "maker.js",
            module: "system",
            target: "es5",
            experimentalDecorators: true,
            sourceMap: true,
        }))
        .pipe(sourcemaps.write(".", {
            includeContent: false, addComment: true
        }))
        .pipe(gulp.dest("."))
        .on('error', swallowError)
        .on('finish', function ()
        {
            util.log(util.colors.cyan("Maker compilation complete"));
            //gulp.start('compile:maker:mini');
        });
}

function compileRuntime(cb)
{
    process.chdir(__dirname + "/public");

    return gulp.src(['./Engine/Logic/**/*.ts', './Engine/Module/MapEditor/MapEditorData.ts', './Engine/Module/ZoneEditor/ZoneEditorData.ts', './Engine/GUI/**/*.ts', './Engine/Libs/**/*.ts', './Engine/*.ts', './Engine/Module/Play/*.ts', './Engine/Module/GameList/*.ts', './Engine/Module/Logout/*.ts'])
        .pipe(sourcemaps.init({ largeFile: true }))
        .pipe(sourcemaps.identityMap())
        .pipe(typescript({
            outFile: "runtime.js",
            module: "system",
            target: "es5",
            experimentalDecorators: true
        }))
        .pipe(sourcemaps.write(".", { includeContent: false, addComment: true }))
        .pipe(gulp.dest("."))
        .on('error', swallowError)
        .on('finish', function ()
        {
            util.log(util.colors.cyan("Runtime compilation complete"));
            //gulp.start('compile:runtime:mini');
        });
}

gulp.task("clean:css", cleanCSS);

gulp.task("clean:js", cleanJS);

gulp.task("compile:client", gulp.series(compileMaker, compileRuntime));

gulp.task('compile:maker', compileMaker);

gulp.task('compile:runtime', compileRuntime);

gulp.task('compile:server', compileServer);
