<template>
  <div id="app">
    <div>a: {{ $store.state.a }}</div>
    <div>name: {{ $store.state.name }}</div>
    <div>age: {{ $store.getters.getAge }}</div>
    <button @click="$store.state.a += 10">add</button>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import mixinTest from './mixin'
export default {
  name: 'App',
  mixins: [mixinTest],
  components: {
    HelloWorld
  },
  created() {
    console.log('App.vue')
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
