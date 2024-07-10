const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js', // Path to your main entry file
  output: {
    path: path.resolve(__dirname, 'askcart12'), // Output directory relative to __dirname
    filename: 'bundle.js', // Output filename
    library: 'MySDK', // Name of your SDK library
    libraryTarget: 'umd', // Universal Module Definition to support all module types
    globalObject: 'this' // Ensure it works in both node and browser environments
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: 'file-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Add presets
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve JS and JSX files
  },
};
