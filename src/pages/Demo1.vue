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

                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            const fragment = `
                varying vec2 vUv;
                uniform float uTime;
                void main() {   
                    
                    float dist = fract((length(vUv - vec2(0.5)) / 0.707 - uTime * 0.1) * 5.0);
                    // 绘制渐变圆形
                    //float dist = length(vUv);
                    float radius = 0.5;
                    vec3 color = vec3(step(radius, dist));
                    gl_FragColor = vec4(color, 1.0);
              }
            `;

            // const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragment,
            });

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            let time = 0;
            const render = () => {
                time+=0.05
                material.uniforms.uTime.value = time
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>