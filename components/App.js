var React = require('react');
var ReactDOM = require('react-dom');
var Gulpview = require('./Gulpview');
var Packagejson = require('./Packagejson');
var $ = require('jquery');
var Codemirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');


	var code = {
    gulp : "var gulp = require('gulp'); \nvar browserify = require('browserify'); \nvar babelify = require('babelify'); \nvar watchify = require('watchify'); \nvar source = require('vinyl-source-stream'); \nvar notify = require('gulp-notify'); \nvar nodemon = require('gulp-nodemon'); \n\nfunction handleErrors() { \n\tvar args = Array.prototype.slice.call(arguments); \n\tnotify.onError({ \n\t\ttitle : 'Compile Error', \n\t\tmessage : '<%= error.message %>' \n\t}).apply(this, args); \n\tthis.emit('end'); //keeps gulp from hanging on this task \n\t} \nfunction buildScript(file, watch) { \n\tvar props = { \n\t\tentries : ['./components/' + file], \n\t\tdebug : true, \n\t\ttransform : babelify.configure({ \n\t\t\tpresets: ['react', 'es2015'] \n\t\t}) \n}; \n\n//watchify if watch set to true. otherwise browserify once \nvar bundler = watch ? watchify(browserify(props)) : browserify(props); \nfunction rebundle(){ \n\tvar stream = bundler.bundle(); \n\treturn stream \n\t\t.on('error', handleErrors) \n\t\t.pipe(source('bundle.js')) \n\t\t.pipe(gulp.dest('./build/')); \n\t} \n\t\tbundler.on('update', function() { \n\t\tvar updateStart = Date.now(); \n\t\trebundle(); \n\t\vconsole.log('Updated!', (Date.now() - updateStart) + 'ms'); \n\t}) \n\n\t// run it once the first time buildScript is called \n\treturn rebundle(); \n\t} \n\n// run once \ngulp.task('scripts', function() { \n\treturn buildScript('App.js', false); \n}); \n\n//run nodemon \ngulp.task('start', function() { \n\tnodemon({ \n\t\tscript: 'server/server.js', \n\t\text: 'js html', \n\t\tenv: {'NODE_ENV': 'development'} \n\t}) \n}); \n\n//run 'scripts' task first, then watch for future changes \ngulp.task('default', ['scripts', 'start'], function() { \n\treturn buildScript('App.js', true); \n});",
		minify: 	"\n\nvar minifyCss = require('gulp-minify-css');\n// task\n	gulp.task('minify-css', function () {\n\t  gulp.src('./Css/one.css') // path to your file\n\t .pipe(minifyCss())\n\t .pipe(gulp.dest('path/to/destination'));\n\t});",
		closure: 	"\n\nvar closureCompiler = require('gulp-closure-compiler');\n	gulp.task('default', function() {\n\t return gulp.src('src/*.js')\n\t\t.pipe(closureCompiler({\n\t\t compilerPath: 'bower_components/closure-compiler/lib/vendor/compiler.jar', \n\t\tfileName: 'build.js'\n\t}))\n\t .pipe(gulp.dest('dist'));\n	});",
		package: '{\n\t"name": "<enter the name of your project here>",\n\t"version": "1.0.0",\n\t"description": "<enter a description of your project here>",\n\t"main": "index.js",\n\t"scripts": {\n\t\t"prestart": "npm run task",\n\t\t"start": "node server/server.js",\n\t\t"start-dev": "npm run task",\n\t\t"task": "gulp"\n\t\t},\n\t"dependencies": {\n\t\t"babel-preset-es2015": "^6.0.15",\n\t\t"babel-preset-react": "^6.0.15",\n\t\t"babelify": "^7.2.0",\n\t\t"body-parser": "^1.15.0",\n\t\t"browserify": "^10.2.4",\n\t\t"codemirror": "^5.12.0"\n\t\t"express": "^4.13.3",\n\t\t"gulp": "^3.9.0",\n\t\t"gulp-notify": "^2.2.0",\n\t\t"jquery": "^2.2.0",\n\t\t"path": "^0.12.7",\n\t\t"react": "^0.14",\n\t\t"react-dom": "^0.14.0",\n\t\t"react-scratchblocks": "^1.1.1",\n\t\t"vinyl-source-stream": "^1.1.0"\n\t},\n\t"devDependencies": {\n\t\t"body-parser": "^1.15.0",\n\t\t"gulp-nodemon": "^2.0.6",\n\t\t"watchify": "^3.2.2",\n\t\t"gulp-cssnano": "^2.1.1"\n\t},\n\t"author": "<your name here>",\n\t"license": "ISC"\n}'
	};



var App = React.createClass({
  getInitialState: function(){
    return {
      gulp: true,
      json: false,
      code: code.gulp,
      minify: false,
			closure: false
    }
  },
	updateCode: function(newCode) {
		this.setState({
				code: newCode
		});
	},
  postRequest: function(e){
    e.preventDefault();
    var gulpState = this.state.code;
    var minify = this.state.minify;
    $.ajax({
      type: 'POST',
      url: '/gulp',
      data: gulpState,
      contentType: 'text/plain; charset=utf-8',
			success: function(data) {
				window.location.href = '/download';
			}
    });
  },

  newTasks: function() {
		var addonObj = {
			minify : $('.minify:checked').val(),
			closure : $('.closure:checked').val(),
		}
		console.log(addonObj.minifyVal)
		var checkedObj = {};
		for (var val in addonObj){
			if (addonObj[val]) checkedObj[val] = code[val]
		}
		console.log(checkedObj);
		var displayedCode = code.gulp;
		for (var goodVal in checkedObj){
			displayedCode += checkedObj[goodVal]
		}
		this.setState({code: displayedCode});
  },

  render: function () {
    var options = {
            lineNumbers: true,
            mode: 'javascript'
        };
    return (
      <div id='App'>
				<form onClick={this.newTasks}>
				Minify CSS
				<input type="checkbox" className="minify" name="minify" value="minify" />
				Closure Complier
				<input type="checkbox" className="closure" name="closure-compiler" value="closure-compiler" />
				</form>
        <Codemirror value={this.state.code} onChange={this.updateCode} options={options} />
        <form id="download-files" onSubmit={this.postRequest}>
          <input type="submit" value="Download Files" />
        </form>

      </div>
    )
  }
});

module.exports = App;

ReactDOM.render(<App />, document.getElementById('main-container'));
