import Vue from 'vue'
import Router from 'vue-router'
import MDEdit from './views/MDEdit.vue'
import MDList from './views/MDList.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/md',
      name: 'MDList',
      component: MDList,
    },
    {
      path: '/md/_new',
      name: 'home',
      component: MDEdit,
    },
    {
      path: '/md/:document_id',
      name: 'home',
      component: MDEdit,
      props: true,
    },
  ]
})
