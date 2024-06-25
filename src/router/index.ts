/*
 * @Author: ygdhpf1994 1270253125@qq.com
 * @Date: 2024-06-22 23:22:35
 * @LastEditors: ygdhpf1994 1270253125@qq.com
 * @LastEditTime: 2024-06-24 06:24:36
 * @FilePath: /xiaomi-su8/src/router/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
    },
    {
        path: '/demo2',
        component: () => import("../pages/Demo2.vue")
    },
    {
        path: '/demo3',
        component: () => import("../pages/Demo3.vue")
    },
    {
        path: '/demo4',
        component: () => import("../pages/Demo4.vue")
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router