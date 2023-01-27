// TODO: webpack build error, can't resolve module with monorepo project

// import type { Configuration } from "webpack"
import path from 'path'
const __dirname = path.resolve(path.dirname(''))

export default {
  mode: 'development',
  entry: './packages/easy-vue/src/index.ts',
  output: {
    path: path.resolve(__dirname, './packages/easy-vue/lib/webpack-lib'),
    filename: 'easy-vue.js',
    library: {
      name: 'EasyVue',
      type: 'umd',
    },
    clean: true
  },
  // resolve: {
  //   alias: {
  //     '@easy-vue': path.resolve(__dirname, './src/packages'),
  //   },
  //   extensions: ['.js', '.json', '.ts'],
  // },
  module: {
    rules: [
      { 
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
}
