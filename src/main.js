import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './plugins/device.js'
import Toasted from 'vue-toasted'
import Persist from 'vue-component-persist'
import echarts from 'echarts'
import VueCropper from 'vue-cropper' 

Vue.use(VueCropper)
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false

Vue.prototype.window = window

Vue.use(Toasted, {
  duration: 5000,
  position: 'top-center'
})

Vue.use(Persist, {
  read: k => {
    let data = JSON.parse(localStorage.getItem(k))
    try {
      data.data.isStale = true
    } catch (e) { throw e; }
    return data
  }
})

// Toast 去重
let lastToastText = null
Vue.toasted.__show = Vue.toasted.show
Vue.toasted.show = (text, ...args) => {
  if (text !== lastToastText) {
    lastToastText = text
    setTimeout(() => lastToastText = null, 5000)
    return Vue.toasted.__show(text, ...args)
  }
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
