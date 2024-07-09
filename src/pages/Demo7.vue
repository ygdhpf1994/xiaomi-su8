<template>
    <div class="hello"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as freeControls from "three-freeform-controls"
import { Vector3 } from 'three';
export default {
    name: "DeMo",
    props: {
        msg: String,
    },
    mounted() {
        this.initThree();
    },
    methods: {
        initThree() {
            let w = window.innerWidth - 20;
            let h = window.innerHeight - 20;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(90, w / h, 0.01, 100);
            camera.position.set(0, 0, 1.4);
            camera.lookAt(new THREE.Vector3());
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                // alpha: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(w, h);
            renderer.setClearColor(0xffffff, 1);
            document.body.appendChild(renderer.domElement);
            const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
            scene.add(light);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            const controls = new OrbitControls(camera, renderer.domElement);
            
            const vertexShader = `
                varying vec2 vUv;
                uniform float uTime;
                const float PI = 3.1415926;

                void main() {
                  vUv = uv;
                  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                  modelPosition.y += 0.08 * sin(modelPosition.x * PI * 2.0 + uTime * 2.0);
                  modelPosition.y += 0.1 * sin(modelPosition.z * PI * 1.5 + uTime * 2.0);
                  gl_Position = projectionMatrix * viewMatrix * modelPosition;
                }
            `;
            const fragment = `
                varying vec2 vUv;
                uniform sampler2D uTexture;
                uniform float uTime;

                void main() {   
                     gl_FragColor = texture2D(uTexture, vUv);
              }
            `;

            // const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: {
                      value: new THREE.TextureLoader().load(require('../assets/junqi.webp')),
                    },
                },
                vertexShader: vertexShader,
                fragmentShader: fragment,
                side: THREE.DoubleSide,
            });

            const geometry = new THREE.PlaneGeometry(0.8, 0.534, 30, 30);
            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Mesh(geometry, material);
            cube.rotation.x = -Math.PI / 2;
            scene.add(cube);
            const ControlsManager = new freeControls.ControlsManager(camera, renderer.domElement);
            ControlsManager.position.set(0,0,0)
            scene.add(ControlsManager);
            const _controls = ControlsManager.anchor(cube)
            _controls.scale.copy(new Vector3(0.5,0.5,0.5))
            let time = 0;
            const render = () => {
                time += 0.02;
                material.uniforms.uTime.value = time;
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };
            render();
            ControlsManager.listen(freeControls.EVENTS.DRAG_START, () => {
              controls.enabled = false;
            });
            ControlsManager.listen(freeControls.EVENTS.DRAG_STOP, () => {
              controls.enabled = true;
            });
        },
    },
};
</script>