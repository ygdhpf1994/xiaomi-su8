<!--
 * @Author: ygdhpf1994 1270253125@qq.com
 * @Date: 2024-06-22 23:22:35
 * @LastEditors: ygdhpf1994 1270253125@qq.com
 * @LastEditTime: 2024-06-23 08:51:58
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
    name: "HelloWorld",
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
            renderer.setClearColor(0x00ffff, 1);
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
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(aposition, 1.0);
                }
            `;
            const fragment = `
                varying vec2 vUv;
                uniform float uTime;
                float plot(vec2 st, float pct){
                    return  smoothstep( pct-0.02, pct, st.y) -
                        smoothstep( pct, pct+0.02, st.y);
                }

                void main() {   
                    float dist = length(vUv - vec2(0.5));
                    // float dist = distance(vUv, vec2(0.5));
                    float radius = 0.25;
                    float outerRadius = 0.4;
                    if (dist > outerRadius) {
                        discard;
                    } else if (dist < radius) {
                        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                    } else {
                        gl_FragColor = vec4(1, (dist - radius) / (outerRadius - radius), (dist - radius) / (outerRadius - radius), 1.0);
                    }
              }
            `;

            // const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragment,
                side: THREE.DoubleSide
            });

            const geometry = new THREE.BoxGeometry(2, 2, 2, 30, 30, 30);
            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            console.log(cube);
            let time = 0;
            const render = () => {
                time += 0.02;
                material.uniforms.uTime.value = time;
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>