const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

module.exports = function() {
    const setOps = (name, def) => {
        return packageJson[name] === undefined
            ? def
            : packageJson[name];
    }
    const p = {
        name: setOps('name', '@darkair/eastereggs'),
        version: setOps('version', ''),
        license: setOps('license', 'GNU GPLv3'),
        description: setOps('description', ''),
        keywords: setOps('keywords', []),
        author: setOps('author', 'Dmitry DarkAiR Romanov <darkair@list.ru>'),
        private: false,
        main: 'index.js',
        types: 'index.d.ts',
        files: ["/"],
        publishConfig: {
            access: "public",
            registry: "https://registry.npmjs.org/"
        },
        devDependencies: {},
        dependencies: {}
    };
    const fn = path.join('dist', 'package.json');
    fs.writeFile(fn, JSON.stringify(p, null, '  '),
        {
            flag: "w"
        },
        (err) => {
            if (err)
                console.log('ERROR', err);
            else {
                console.log("File written successfully\n");
            }
        }
    );
}
