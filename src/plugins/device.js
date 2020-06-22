import Vue from 'vue'

Vue.prototype.$device = {}
Vue.prototype.$device.isDesktop = window.innerWidth > 480
Vue.prototype.$device.isMobile = window.innerWidth <= 480
Vue.prototype.$device.height = window.innerHeight