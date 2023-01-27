import typesctipt from '@rollup/plugin-typescript'

export default {
  input:"./packages/easy-vue/src/index.ts",
  output: [
    {
      name: "EasyVue",
      format: "cjs",
      file: "./packages/easy-vue/lib/rollup-lib/easy-vue.cjs.js",
      sourcemap: true,
    },
    {
      name: "EasyVue",
      format: "es",
      file: "./packages/easy-vue/lib/rollup-lib/easy-vue.esm.js",
      sourcemap: true,
    },
    {
      name: "EasyVue",
      format: "umd",
      file: "./packages/easy-vue/lib/rollup-lib/easy-vue.umd.js",
      sourcemap: true,
    },
  ],
  plugins: [
    typesctipt()
  ]
};
