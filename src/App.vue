<template>
  <div id="app">
    <router-view ></router-view>
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css';
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
export default {
  name: 'App',
}
</script>

<style>
body {
  margin:0;
  padding:0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.content-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
}
</style>