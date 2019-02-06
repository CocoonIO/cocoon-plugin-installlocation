#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf('android') <= -1)
        return;

    var config_xml_path = path.join(context.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'res', 'xml', 'config.xml');

    var et = context.requireCordovaModule('elementtree');
    var data = fs.readFileSync(config_xml_path).toString();
    var etree = et.parse(data);

    var installLocation = "internalOnly";
    var preferences = etree.findall('./preference');
    for (var i=0; i<preferences.length; i++) {
        var preference = preferences[i];
        var name = preference.get("name", null);
        if (name !== null && name.indexOf("android-installLocation") === 0) {
            var value = preference.get("value", installLocation);
            if (value !== null) {
                installLocation = value;
            }
        }
    }

    var manifest_xml_path = path.join(context.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    var et = context.requireCordovaModule('elementtree');

    data = fs.readFileSync(manifest_xml_path).toString();
    etree = et.parse(data);
    root = etree.getroot();
    root.attrib['android:installLocation'] = installLocation; 

    data = etree.write({'indent': 4});
    fs.writeFileSync(manifest_xml_path, data);
}