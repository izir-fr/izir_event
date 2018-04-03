const path = require('path');
const minify = require('uglifyjs-webpack-plugin');
const webpack = require('webpack')

let config = {

	entry: './src/js/global.js',
	
	output:{
		path: path.resolve('./public/js'),
		filename: 'bundle.js'
	},

	watch: true,

	mode: 'development',

	devtool: 'cheap-module-eval-source-map',

	module: {
		rules: [
			{
				test:/\.(js|jsx)$/,
				exclude: /node_modules/,
				use:['babel-loader']
			}
		]
	},

  resolve: {

    extensions: ['*', '.js', '.jsx']

  },

  plugins: [
	new webpack.ProvidePlugin({
		$: 'jQuery',
		jQuery: 'jQuery'
	})
	//new minify ()

  ]

}

module.exports = config