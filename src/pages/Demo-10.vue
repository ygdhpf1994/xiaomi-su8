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
            renderer.setClearColor(0x000000, 1);
            document.body.appendChild(renderer.domElement);
            const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
            scene.add(light);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

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

                float Star(vec2 uv) {
                    float d = length(uv);
                    float m = 0.04 / d;
                    float r = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
                    m += r * 1.0;
                    return m * smoothstep(0.8, 0.2, d);;
                }

                void main() {   
                    vec2 uv = vUv - vec2(0.5);
                    vec3 col = vec3(0.0);
                    col += Star(uv);
                    gl_FragColor = vec4(col, 1.0);
              }
            `;

            // const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragment,
                side: THREE.DoubleSide,
            });

            const geometry = new THREE.PlaneGeometry(1, 1);
            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            console.log(cube);
            cube.lookAt(0, 1 , 0)
            let time = 0;
            const render = () => {
                time += 0.02;
                material.uniforms.uTime.value = time;
                renderer.render(scene, camera);
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>