"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Worlds {
    static main() {
        let line = '';
        let parts = [];
        try {
            const data = fs_1.default.readFileSync('data/worlds.csv', 'utf-8');
            const lines = data.split('\n');
            line = lines[0]; // Skip header
            for (let i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                if (parts.length < 8)
                    continue;
                console.log(`{"world":"${parts[0]}", "aptitude":"${parts[7]}"},`);
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    }
}
class Roles {
    static main() {
        let line = '';
        let parts = [];
        try {
            const data = fs_1.default.readFileSync('data/roles.csv', 'utf-8');
            const lines = data.split('\n');
            line = lines[0]; // Skip header
            for (let i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                if (parts.length < 2)
                    continue;
                const aptitudes = parts[1].split(',').map(x => `"${x.trim()}"`).join(',');
                console.log(`{"role":"${parts[0]}", "aptitudes":[${aptitudes}]},`);
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    }
}
class Backgrounds {
    static main() {
        let line = '';
        let parts = [];
        try {
            const data = fs_1.default.readFileSync('data/backgrounds.csv', 'utf-8');
            const lines = data.split('\n');
            line = lines[0]; // Skip header
            for (let i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('\t');
                if (parts.length < 6)
                    continue;
                const aptitudes = parts[5].split(' or ').map(x => `"${x}"`).join(',');
                console.log(`{"background":"${parts[0]}", "aptitudes":[${aptitudes}]},`);
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    }
}
class Csv2Json {
    static main() {
        let line = '';
        let parts = [];
        try {
            const data = fs_1.default.readFileSync('data/talents.csv', 'utf-8');
            const lines = data.split('\n');
            line = lines[0]; // Skip header
            for (let i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.substring(1, line.length - 1).split('","');
                if (parts.length < 6)
                    continue;
                console.log(`{"Tier":"${parts[0]}", "Talent":"${parts[1]}", "Prerequisites":"${parts[2]}", "Aptitude 1":"${parts[3]}", "Aptitude 2":"${parts[4]}", "Benefit":"${parts[5]}"},`);
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    }
}
class Dh2Csv2Json {
    static main() {
        let line = '';
        let parts = [];
        try {
            const data = fs_1.default.readFileSync('data/dh2t.csv', 'utf-8');
            const lines = data.split('\r\n');
            line = lines[0]; // Skip header
            for (let i = 1; i < lines.length; i++) {
                line = lines[i];
                parts = line.split('_');
                if (parts.length < 7)
                    continue;
                console.log(`{"tier":${parts[4].substring(1)}, "talent":"${parts[0]}", "prerequisites":"${parts[1]}", "apt1":"${parts[2]}", "apt2":"${parts[3]}", "benefit":"${parts[5]}", "ref":"${parts[6]}"},`);
            }
        }
        catch (ex) {
            console.error(line);
            console.error(parts.join(' --- '));
            console.error(ex);
        }
    }
}
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
