"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var Worlds = /** @class */ (function () {
    function Worlds() {
    }
    Worlds.main = function () {
        var line = '';
        var parts = [];
        try {
            var data = fs.readFileSync('data/worlds.csv', 'utf-8');
            var lines = data.split('\n');
            line = lines[0]; // Skip header
            for (var i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                console.log("{\"world\":\"".concat(parts[0], "\", \"aptitude\":\"").concat(parts[7], "\"},"));
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    };
    return Worlds;
}());
var Roles = /** @class */ (function () {
    function Roles() {
    }
    Roles.main = function () {
        var line = '';
        var parts = [];
        try {
            var data = fs.readFileSync('data/roles.csv', 'utf-8');
            var lines = data.split('\n');
            line = lines[0]; // Skip header
            for (var i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                var aptitudes = parts[1].split(',').map(function (x) { return "\"".concat(x.trim(), "\""); }).join(',');
                console.log("{\"role\":\"".concat(parts[0], "\", \"aptitudes\":[").concat(aptitudes, "]},"));
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    };
    return Roles;
}());
var Backgrounds = /** @class */ (function () {
    function Backgrounds() {
    }
    Backgrounds.main = function () {
        var line = '';
        var parts = [];
        try {
            var data = fs.readFileSync('data/backgrounds.csv', 'utf-8');
            var lines = data.split('\n');
            line = lines[0]; // Skip header
            for (var i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                var aptitudes = parts[5].split(' or ').map(function (x) { return "\"".concat(x, "\""); }).join(',');
                console.log("{\"background\":\"".concat(parts[0], "\", \"aptitudes\":[").concat(aptitudes, "]},"));
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    };
    return Backgrounds;
}());
var Csv2Json = /** @class */ (function () {
    function Csv2Json() {
    }
    Csv2Json.main = function () {
        var line = '';
        var parts = [];
        try {
            var data = fs.readFileSync('data/talents.csv', 'utf-8');
            var lines = data.split('\n');
            line = lines[0]; // Skip header
            for (var i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.substring(1, line.length - 1).split('","');
                console.log("{\"Tier\":\"".concat(parts[0], "\", \"Talent\":\"").concat(parts[1], "\", \"Prerequisites\":\"").concat(parts[2], "\", \"Aptitude 1\":\"").concat(parts[3], "\", \"Aptitude 2\":\"").concat(parts[4], "\", \"Benefit\":\"").concat(parts[5], "\"},"));
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    };
    return Csv2Json;
}());
var Dh2Csv2Json = /** @class */ (function () {
    function Dh2Csv2Json() {
    }
    Dh2Csv2Json.main = function () {
        var line = '';
        var parts = [];
        try {
            var data = fs.readFileSync('data/dh2t.csv', 'utf-8');
            var lines = data.split('\r\n');
            line = lines[0]; // Skip header
            for (var i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('_');
                console.log("{\"tier\":".concat(parts[4].substring(1), ", \"talent\":\"").concat(parts[0], "\", \"prerequisites\":\"").concat(parts[1], "\", \"apt1\":\"").concat(parts[2], "\", \"apt2\":\"").concat(parts[3], "\", \"benefit\":\"").concat(parts[5], "\", \"ref\":\"").concat(parts[6], "\"},"));
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    };
    return Dh2Csv2Json;
}());
console.log("OW --------------------------------------------");
console.log('{"talents":[');
Csv2Json.main();
console.log(']},');
console.log("DH2 --------------------------------------------");
console.log('{"worlds":[');
Worlds.main();
console.log(']},');
console.log('{"backgrounds":[');
Backgrounds.main();
console.log(']},');
console.log('{"roles":[');
Roles.main();
console.log(']},');
console.log('{"talents":[');
Dh2Csv2Json.main();
console.log(']},');
