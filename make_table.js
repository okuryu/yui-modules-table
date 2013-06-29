var page = require('webpage').create(),
    fs = require('fs'),
    versions = JSON.parse(fs.read('versions.json')),
    moduleNames = [],
    moduleTable = {};

function unique(array) {
    var a = array.concat(),
        i,
        j;

    for(i = 0; i < a.length; ++i) {
        for(j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }

    return a;
}

function createTableHeader(stream) {
    stream.writeLine('<tr>');
    stream.writeLine('<th>#</th>');

    versions.forEach(function (version) {
        stream.writeLine('<th>' + version + '</th>');
    });

    stream.writeLine('</tr>');
}

function createTable() {
    var mods = unique(moduleNames).sort(),
        header = fs.open('template_header.html', 'r').read(),
        footer = fs.open('template_footer.html', 'r').read(),
        output = fs.open('index.html', 'w');

    output.write(header);
    createTableHeader(output);

    mods.forEach(function (mod) {
        output.writeLine('<tr>');
        output.writeLine('<th>' + mod + '</th>');
        versions.forEach(function (version) {
            if (moduleTable[version][mod]) {
                output.writeLine('<td class="yes">YES</td>');
            } else {
                output.writeLine('<td class="no">NO</td>');
            }
        });
        output.writeLine('</tr>');
    });

    createTableHeader(output);
    output.write(footer);
    output.flush();
    output.close();
    phantom.exit();
}

function getModules(versions, key) {
    var version,
        jsPath;

    if (versions.length === key) {
        createTable();
    }

    version = versions[key];
    jsPath = 'http://yui.yahooapis.com/' + version + '/build/yui/yui-min.js';

    page.includeJs(jsPath, function () {
        var Y,
            modules;
        Y = page.evaluate(function () {
            return YUI().use('*');
        });
        modules = Object.keys(Y.Env.meta.modules);
        moduleNames = moduleNames.concat(modules);
        moduleTable[version] = {};
        modules.forEach(function (module) {
            moduleTable[Y.version][module] = 1;
        });
        getModules(versions, key + 1);
    });
}

getModules(versions, 0);
