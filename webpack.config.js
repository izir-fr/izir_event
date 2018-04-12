const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let config_watch, config_devtool, config_output, config_entry, config_mode

const env = ( process.env.NODE_ENV === 'production' )

if(env){
   config_mode = 'production'   
   config_watch = false
   config_devtool = false
   config_entry = './assets/src/js/main.js'
   config_output = {
      path: path.resolve(__dirname, './assets/public/js/'),
      filename: 'app.js',
   }
} else {
   config_mode = 'development'   
   config_watch = true
   config_devtool = "cheap-module-eval-source-map"
   config_entry = [
      'webpack-hot-middleware/client',//?http://localhost:3000/
      './assets/src/js/main.js'
   ]
   config_output = {
      path: path.resolve('public/'),
      sourceMapFilename: '[file].map',
      filename: 'app.js',
      publicPath: '/js/'
   }   
}


let config = {
   entry: config_entry,
   output: config_output,
   devtool: config_devtool ,
   watch: config_watch,
   mode: config_mode,
   module: {
      rules: [
         {
            enforce: 'pre',
            test: /\.js?$/,
            exclude: /node_modules/,
            use: ['eslint-loader']
         },
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
               presets: ['env']
            }
         }
      ]
   },
   plugins: [
      new webpack.ProvidePlugin({
         jQuery: 'jquery',
         $: 'jquery',
         jquery: 'jquery',
         'window.jQuery': 'jquery',
         Popper: ['popper.js', 'default']
     })
   ]
}

if(env){
   config.plugins.push( new UglifyJsPlugin() )
} else {
   config.plugins.push( new webpack.NamedModulesPlugin() )
   config.plugins.push( new CleanWebpackPlugin)
   config.plugins.push( new webpack.HotModuleReplacementPlugin() )
   config.plugins.push( new webpack.NoEmitOnErrorsPlugin() )   
   config.devServer = {
      contentBase: path.resolve(__dirname),
      historyApiFallback: true,
      publicPath: "/js/",
      inline: true,
      noInfo: true,
      stats: {colors: true},
      hot: true,
      headers: {'Access-Control-Allow-Origin': '*'}, 
      compress: true,
      port: 8080,
   }
}

module.exports = config;