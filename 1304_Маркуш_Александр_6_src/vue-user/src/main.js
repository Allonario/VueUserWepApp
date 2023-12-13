import './assets/main.css'

import io from "socket.io-client";
import { createApp } from 'vue'
import App from './App.vue'
import store from "./store";
import router from "./router";
import VueSocketIO from 'vue-socket.io'

export const SocketInstance = io('http://localhost:8080/');


const app = createApp(App);

app.use(store);
app.use(router, VueSocketIO, SocketInstance);
app.config.globalProperties.$socket = SocketInstance;

app.mount('#app');