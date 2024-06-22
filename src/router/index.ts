import { Path } from "three";
import { createRouter, createWebHistory} from "vue-router";

const  routes = [
    {
        path: '/',
        component: () => import('../pages/HelloWorld.vue')
    },
    {
        path: '/shaderTest',
        component: () => import("../pages/shaderTest.vue")
    },
    {
        path: '/demo1',
        component: () => import("../pages/Demo1.vue")
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router