import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _452d1787 = () => interopDefault(import('..\\pages\\buzon.vue' /* webpackChunkName: "pages/buzon" */))
const _089d53dd = () => interopDefault(import('..\\pages\\buzon_consulta.vue' /* webpackChunkName: "pages/buzon_consulta" */))
const _470d15d3 = () => interopDefault(import('..\\pages\\calendario.vue' /* webpackChunkName: "pages/calendario" */))
const _51fdc90a = () => interopDefault(import('..\\pages\\inspire.vue' /* webpackChunkName: "pages/inspire" */))
const _36d37e0e = () => interopDefault(import('..\\pages\\microbiologia.vue' /* webpackChunkName: "pages/microbiologia" */))
const _40d1789a = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/buzon",
    component: _452d1787,
    name: "buzon"
  }, {
    path: "/buzon_consulta",
    component: _089d53dd,
    name: "buzon_consulta"
  }, {
    path: "/calendario",
    component: _470d15d3,
    name: "calendario"
  }, {
    path: "/inspire",
    component: _51fdc90a,
    name: "inspire"
  }, {
    path: "/microbiologia",
    component: _36d37e0e,
    name: "microbiologia"
  }, {
    path: "/",
    component: _40d1789a,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
