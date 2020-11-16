const glob = require('glob');
const path = require('path');

const packageJson = require('../package.json');
console.log('package.json', packageJson);

module.exports = function() {
    const p = {
        name: packageJson?.name ?? ''
    }
    //
    // const trim = function (s, c) {
    //     if (c === "]") {
    //         c = "\\]";
    //     }
    //     if (c === "\\") {
    //         c = "\\\\";
    //     }
    //     return s.replace(new RegExp(
    //         "^[" + c + "]+|[" + c + "]+$", "g"
    //     ), "");
    // };
    //
    // const context = glob.sync('*/', {
    //     cwd: pathDir
    // });
    // const effects = {};
    // context.forEach(function(dirName) {
    //     const name = trim(dirName, '/');
    //     effects[name] = path.resolve(pathDir, name, 'index.ts');
    // });
    // return effects;
}

/*
{
    "name": "abc-charts",
    "version": "1.5.1",
    "license": "MIT",
    "description": "Widget render for using in 'ABC consulting' projects",
    "keywords": ["abc", "widget", "charts", "goodt"],
    "author": "Dmitry DarkAiR Romanov <darkair@list.ru>",
    "private": false,

    "main": "abc-charts.js",
    "types": "index.d.js",
    "files": ["/"],

    "devDependencies": {
},
    "dependencies": {
}
}
*/
