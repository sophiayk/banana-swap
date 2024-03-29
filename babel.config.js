module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    "@babel/plugin-transform-arrow-functions", // 这个是箭头函数的处理
    ["@babel/plugin-proposal-decorators", { legacy: true }], // 这个是装饰器
    ["@babel/plugin-proposal-class-properties", { loose: false }], // 这里是关键
  ],
};
