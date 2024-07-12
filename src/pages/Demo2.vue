<!--
 * @Author: ygdhpf1994 1270253125@qq.com
 * @Date: 2024-06-22 23:22:35
 * @LastEditors: ygdhpf1994 1270253125@qq.com
 * @LastEditTime: 2024-06-23 20:35:41
 * @FilePath: /xiaomi-su8/src/pages/Demo1.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div class="hello"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export default {
    name: "DeMo",
    props: {
        msg: String,
    },
    data() {
        return {
            scene: null,
            wheel: null,
        };
    },
    mounted() {
        this.initThree();
    },
    methods: {
        initThree() {
            let w = window.innerWidth - 20;
            let h = window.innerHeight - 20;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(90, w / h, 0.1, 1000);
            camera.position.set(0, 5, 0);
            camera.lookAt(new THREE.Vector3());
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                // alpha: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(w, h);
            renderer.setClearColor(0xbbdefb, 1);
            document.body.appendChild(renderer.domElement);
            const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
            scene.add(light);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            const controls = new OrbitControls(camera, renderer.domElement);
            // 添加坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(50);
            scene.add(axesHelper);

            const vertexShader = `
                varying vec2 vUv;
                uniform float uTime;

                void main() {
                  vUv = uv;
                  vec3 aposition = position;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            const fragment = `
                uniform float uTime;

                void main() {
                    vec2 uv = gl_FragCoord.xy;
                    vec3 color = vec3(sin(uTime), 0.0, 0.0); // 使用sin函数基于时间变化颜色
                    gl_FragColor = vec4(color, 1.0);
                }
            `;

            // const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
            const loader = new THREE.TextureLoader()
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragment,
                wireframe: true,
                map: loader.load(require('../assets/equth.jpg'))
            });

            const geometry = new THREE.SphereGeometry(1, 30, 30);

            const geometry1 = new THREE.SphereGeometry(1, 30, 30);

            var material1 = new THREE.MeshBasicMaterial({ map: loader.load(require('../assets/equth.jpg')), side: THREE.DoubleSide });

            var cube1 = new THREE.Mesh(geometry, material);

            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Mesh(geometry1, material1);
            cube1.position.set(3,0,0)
            scene.add(cube);
            scene.add(cube1);
            console.log(cube);
            const clock = new THREE.Clock();
            cube.rotation.order = "ZYX";
            cube.rotation.z = 0.2
            const render = () => {
                const time = clock.getElapsedTime();
                material.uniforms.uTime.value = time * 0.5
                cube.rotation.y = time * 0.5
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>