const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let config_watch, config_minify, config_devtool

const env = ( process.env.mode === 'production' )

if(env === true){
   config_watch = false
   config_minify = true
   config_devtool = false
} else {
   config_watch = true
   config_minify = false
   config_devtool = "cheap-module-eval-source-map"
}

let config = {
   entry: './assets/src/js/main.js',
   output: {
      path: path.resolve('./assets/public/js/'),
      filename: 'app.js',
   },
   devServer: {
      contentBase: path.join(__dirname,('/assets/public/')),
      compress: true,
      port: 3000
   },
   devtool: config_devtool ,
   watch: config_watch,
   module: {
      rules: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015', 'react']
            }
         }
      ]
   },
   plugins: []
}

if(env){
   config.plugins.push( new UglifyJsPlugin() )
}

module.exports = config;