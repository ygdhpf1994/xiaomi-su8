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
            renderer.clearStencil(0);
            renderer.state.buffers.stencil.setTest(true); // 启用模板测试
            document.body.appendChild(renderer.domElement);
            // 添加点光源
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(2, 2, 2);
            scene.add(light);

            // 设置相机位置
            camera.position.z = 5;
            const controls = new OrbitControls(camera, renderer.domElement);
            // 顶点着色器
            const vertexShader = `
              varying vec3 vNormal;
              varying vec3 vPosition;
            
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `;

            // 片元着色器
            const fragmentShader = `
              varying vec3 vNormal;
              varying vec3 vPosition;

              uniform vec3 lightPosition;
              uniform vec3 lightColor;
              uniform vec3 objectColor;

              void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(normal, lightDir), 0.0);

                vec3 diffuse = diff * lightColor;
                vec3 ambient = 0.1 * lightColor; // 环境光

                vec3 finalColor = (ambient + diffuse) * objectColor;
                gl_FragColor = vec4(finalColor, 1.0);
              }
            `;
            // 创建 Shader 材质
            const shaderMaterial = new THREE.ShaderMaterial({
              vertexShader,
              fragmentShader,
              uniforms: {
                lightPosition: { value: new THREE.Vector3(2, 2, 2) }, // 点光源位置
                lightColor: { value: new THREE.Color(1, 1, 1) }, // 白色光源
                objectColor: { value: new THREE.Color(0, 0, 1) }, // 蓝色物体
              }
            });

            // 创建长方体
            const geometry3 = new THREE.BoxGeometry(2, 1, 1);
            const cube = new THREE.Mesh(geometry3, shaderMaterial);
            scene.add(cube);
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