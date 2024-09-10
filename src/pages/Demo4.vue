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
            renderer.setClearColor(0xffffff, 1);
            document.body.appendChild(renderer.domElement);
            // const light = new THREE.AmbientLight(0xffff00); // 柔和的红光
            // scene.add(light);

            // const pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
            // pointLight.position.set( 0, 5, 0);
            // scene.add( pointLight );
            // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            // directionalLight.position.set(1, 1, 1);
            // scene.add(directionalLight);
            const controls = new OrbitControls(camera, renderer.domElement);
            // 添加坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(50);
            scene.add(axesHelper);
            const geometry = new THREE.PlaneGeometry(3, 3);
            const vertexShader = `
                varying vec2 vUv;
                varying vec3 vNormal;
                void main(){
                    vUv = uv;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `
            const fragmentShader = `
                varying vec2 vUv;
                void main(){
                    
                    gl_FragColor = vec4(vUv, 0.5,1.0);
                }
            `
            const material = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                // side: DoubleSide
            });
            const palne = new THREE.Mesh(geometry, material);
            palne.lookAt(0, 1, 0);
            scene.add(palne);
            const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                // emissive: 0xff0000,
                // blending: THREE.AdditiveBlending,
            });
            // 创建发光的球体
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(0, 2, 0);
            scene.add(sphere);
            // 创建光晕效果
            var glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x110000,
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending,
            });
            var glowSphere = new THREE.Mesh(sphereGeometry, glowMaterial);
            glowSphere.scale.multiplyScalar(1.2);
            glowSphere.position.set(0, 2, 0);
            // scene.add(glowSphere);
            const render = () => {
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>