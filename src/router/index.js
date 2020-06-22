import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const VueRouterPush = VueRouter.prototype.push 
VueRouter.prototype.push = function push (to) {
    return VueRouterPush.call(this, to).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '*',
    redirect: '/home'
  },
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
