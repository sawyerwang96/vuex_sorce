const applyMixin = (Vue) => {
  Vue.mixin({
    beforeCreate: vuexInit
  });
}

function vuexInit() {
  // vuex 给每个组件定义了一个$store属性 指向的都是同一个vuex实例
  const options = this.$options;
  if (options.store) {
    // 根实例
    this.$store = options.store
  } else if (options.parent && options.parent.$store) {
    // options.parent 组件的父组件
    // 子组件
    this.$store = options.parent.$store
  }
}

export default applyMixin
