<template>
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <!-- <component :is="currentView" /> -->
  <!-- <ShaderTest msg="Welcome to Your Vue.js App"/> -->
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
// import ShaderTest from './pages/shaderTest.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    // ShaderTest
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
}
</style>
