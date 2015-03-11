/**
 * @file Test spec
 * @author treelite(c.xinle@gmail.com)
 */

var combineEntry = require('../index');

describe('combine-entry', function () {

    it('combine modules without common module', function () {
        var config = combineEntry('mock/*.html', {cwd: __dirname}).getCombineConfig();
        expect(config).toEqual({index: {modules: []}});

        config = combineEntry('mock/**/*.html', {cwd: __dirname}).getCombineConfig();
        expect(config).toEqual({index: {modules: []}, 'list/index': {modules: []}});
    });

    it('combine modules with common module', function () {
        var combineConfig = {
            boot: true
        };

        var config = combineEntry('mock/*.html', {cwd: __dirname, moduleId: 'boot'}).getCombineConfig(combineConfig);
        expect(config).toEqual({
            boot: true,
            index: {
                modules: ['!~boot']
            }
        });

        combineConfig = {
            boot: {
                modules: ['~common1', '!~common2']
            }
        };
        config = combineEntry('mock/**/*.html', {cwd: __dirname, moduleId: 'boot'}).getCombineConfig(combineConfig);
        expect(config).toEqual({
            boot: {
                modules: ['~common1', '!~common2']
            },
            index: {
                modules: ['!~boot', '!~common1']
            },
            'list/index': {
                modules: ['!~boot', '!~common1']
            }
        });
    });

});
