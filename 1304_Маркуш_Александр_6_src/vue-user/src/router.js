import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from "@/components/LoginPage.vue";
import BrokerPage from "@/components/BrokerPage.vue";
import AdminPage from "@/components/AdminPage.vue";

const routes = [
    { path: '/', redirect: '/login'},
    { path: '/login', name: 'LoginPage', component: LoginPage },
    { path: '/broker/:id', name: 'BrokerPage',component: BrokerPage },
    { path: '/admin/:id', name: 'AdminPage', component: AdminPage }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router