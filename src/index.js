var jsdom = require( "jsdom" );

var pluginFactory = function( _, anvil ) {
    return anvil.plugin( {
        // Name your plugin
        name: "anvil.buildr",
        // Activity list: "identify", "pull", "combine", "pre-process","compile", "post-process", "push", "test"
        activity: "pull",
        // Command all the things [ "-s, --somecommand", "Run this plugin for awesomesauce" ]
        commander: [[ "-q", "q all the things"]],
        // Configure all the things...
        configure: function( config, command, done ) {
            done();
        },
        dependencies: [ "anvil.workset" ],
        config: {
            "mainOut": "index.html",
            "mainSrc": "index.html",
            "output" : "js/",
            "buildReference": "/js/"
            // "filter": ".build"
        },
        jqversion: "1.8.1",
        // Run all the things...ALL THINGS WORK
        run: function( done ) {
            var self = this,
                indexSource = anvil.fs.buildPath([anvil.config.source, this.config.mainSrc]);
        
            anvil.fs.read( indexSource, function( contents ) {
                jsdom.env({
                    html: contents,
                    scripts: [ 'http://code.jquery.com/jquery-{jqver}.min.js'.replace("{jqver}", self.jqversion) ]
                }, function(err, window) {
                    var $ = window.jQuery,
                        scripts = {
                            main: []
                        },
                        $scripts = $( "script" ), files = [];
                    
                    $scripts.each(function() {
                        var $this = $( this ),
                            build = $this.data("build"),
                            src = $(this).attr("src");

                        if ( !src || ~$this.attr("src").indexOf("http") ) {
                            return;
                        }

                        if ( build === "true" ) {
                            scripts.main.push( src );
                            $this.remove();
                        }
                        else if ( $this.data("build").length ) {
                            scripts[ build ] = scripts[ build ] || [];
                            scripts[ build ].push( src );
                            $this.remove();
                        }
                    });

                    files = _.reduce( scripts, function( memo, scriptArr, key ) {
                        if ( !scriptArr.length ) {
                            return memo;
                        }

                        memo.push({
                            includes: scriptArr,
                            path: self.config.output + key + ".build.js"
                        });
                        return memo;
                    }, []);

                    anvil.scheduler.parallel( files, self.createFile, function(){
                        var newContents = self.addScripts( files, contents, window );

                        anvil.fs.write( anvil.fs.buildPath([anvil.config.working, self.config.mainOut]),
                            newContents,
                            function() {
                                done();
                        });
                    });
                });
            });
        },
        createFile: function( file, done ) {
            // A bit weird here because the imports are derived from the script tags and are therefore
            // relative to the index.html.
            var content = _.map( file.includes, function( child ) {
                                return "//import('" + child.replace(this.config.output, "") + "')";
                            }, this).join( "\n" ),
                originSpec = anvil.fs.buildPath( [ anvil.config.source, file.path ] ),
                workingSpec = anvil.fs.buildPath( [ anvil.config.working, file.path ] ),
                data = anvil.fs.buildFileData( anvil.config.source, anvil.config.working, originSpec );
            
            data.concat = true;
            
            anvil.project.files.push( data );
            anvil.fs.write( workingSpec , content, function() {
                done();
            });
        },
        addScripts: function( files, contents, window ) {
            var $ = window.$,
                doctype = /<!DOCTYPE(.*?)>/.exec( contents ),
                head = window.document.getElementsByTagName("head")[0],
                newScript, buildReference;

            _.each( files, function( file ) {
                newScript = window.document.createElement('script'),
                buildReference =  file.path;
                newScript.src = buildReference;
                head.appendChild( newScript );
            });

            $( ".jsdom" ).remove();
            
            window.document.documentElement.innerHTML = window.document.documentElement.innerHTML.replace(/^\s+$/mg, "");
            
            return doctype[0] + window.document.innerHTML;
        }
    } );
};

module.exports = pluginFactory;