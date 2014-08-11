module.exports = function(grunt) {
    require('grunt');
    
    var config_file_name = 'config.json';
    var auth_file_name = 'auth.json';
    
    var config = { auth: {} };
    
    if ( grunt.file.exists(config_file_name) ) {
    
        config = grunt.file.readJSON('config.json');

        config.js_files = grunt.file.expand(['src/javascript/*.js']);

        config.ugly_files = grunt.file.expand(['deploy/app.min.*.js']);
        
        config.css_files = grunt.file.expand( 'src/style/*.css' );
        config.checksum = "<!= checksum !>";
        
        config.js_contents = " ";
        for (var i=0;i<config.js_files.length;i++) {
            grunt.log.writeln( config.js_files[i]);
            config.js_contents = config.js_contents + "\n" + grunt.file.read(config.js_files[i]);
        }
    
        config.style_contents = "";
        for (var i=0;i<config.css_files.length;i++) {
            grunt.log.writeln( config.css_files[i]);
            config.style_contents = config.style_contents + "\n" + grunt.file.read(config.css_files[i]);
        }
        
        config.ugly_contents = "";
        for ( var i=0;i<config.ugly_files;i++ ) {
            grunt.file.read(config.ugly_files[i]);
        }
    }
    if ( grunt.file.exists(auth_file_name) ) {
    // grunt.log.writeln( config.js_contents );
        var auth = grunt.file.readJSON(auth_file_name);
        config.auth = auth
    } else {
        grunt.log.writeln("");
        grunt.log.writeln("WARNING: Slow tests won't run without an auth.json file");
    }
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: true
            },
            ugly: {
                files: { 'deploy/app.min.js': config.js_files }
            }
        },
        template: {
                dev: {
                    src: 'templates/App-debug-tpl.html',
                    dest: 'App-debug.html',
                    engine: 'underscore',
                    variables: config
                },
                prod: {
                    src: 'templates/App-tpl.html',
                    dest: 'deploy/App.txt',
                    engine: 'underscore',
                    variables: config
                },
                ugly: {
                    src: 'templates/App-ugly-tpl.html',
                    dest: 'deploy/Ugly.txt',
                    engine: 'underscore',
                    variables: config                    
                }
        },
        jasmine: {
            fast: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/fast/*-spec.js',
                    helpers: 'test/fast/*Helper.js',
                    template: 'test/fast/custom.tmpl',
                    templateOptions: config,
                    keepRunner: true,
                    junit: { 
                        path: 'test/logs/fast'
                    }
                }
            },
            slow: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/slow/*-spec.js',
                    helpers: 'test/slow/*Helper.js',
                    template: 'test/slow/custom.tmpl',
                    templateOptions: config,
                    keepRunner: true,
                    timeout: 50000,
                    junit: { 
                        path: 'test/logs/slow'
                    }
                }
            }
        }
    });
    
    grunt.registerTask('setChecksum', 'Make a sloppy checksum', function() {
        var fs = require('fs');
        var chk = 0x12345678,
            i;
        var deploy_file = 'deploy/App.txt';

        var file = grunt.file.read(deploy_file);
        string = file.replace(/var CHECKSUM = .*;/,"");
        string = string.replace(/\s/g,"");  //Remove all whitespace from the string.
        
        for (i = 0; i < string.length; i++) {
            chk += (string.charCodeAt(i) * i);
        }
        grunt.log.writeln('sloppy checksum: ' + chk);
        grunt.log.writeln('length: ' + string.length);
// 
        grunt.template.addDelimiters('square-brackets','[%','%]');
        
        var output = grunt.template.process(file, { data: { checksum: chk },  delimiters: 'square-brackets' });
        grunt.file.write(deploy_file,output);
        
    });

    //load
    grunt.loadNpmTasks('grunt-templater');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //tasks
    grunt.registerTask('default', ['debug','build','ugly']);
    
    // (uses all the files in src/javascript)
    grunt.registerTask('build', "Create the html for deployment",['template:prod','setChecksum']);
    // 
    grunt.registerTask('debug', "Create an html file that can run in its own tab", ['template:dev']);
    //
    grunt.registerTask('ugly', "Create the ugly html for deployment",['uglify:ugly','template:ugly']);

    grunt.registerTask('test-fast', "Run tests that don't need to connect to Rally", ['jasmine:fast']);
    grunt.registerTask('test-slow', "Run tests that need to connect to Rally", ['jasmine:slow']);

};
