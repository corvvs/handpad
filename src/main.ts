import Vue from 'vue';
import './plugins/vuetify'
// import Vuetify from "vuetify";
import App from './App.vue';


// Initialize Firebase
import * as firebase from 'firebase'

import router from './router'
// Vue.use(Vuetify);
var config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
};
firebase.initializeApp(config);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
