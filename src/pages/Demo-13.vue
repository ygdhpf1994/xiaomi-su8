<template>
    <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default {
    setup() {
        const threeContainer = ref(null);

        onMounted(() => {
            // 创建场景
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000); // 黑色背景

            // 创建相机
            const camera = new THREE.PerspectiveCamera(
                45,
                window.innerWidth / window.innerHeight,
                0.1,
                100
            );
            camera.position.set(3, 3, 6);
            camera.lookAt(0, 0, 0);

            // 渲染器
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            threeContainer.value.appendChild(renderer.domElement);

            // 交互控制
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // 添加光照
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            // 创建地板
            const planeGeometry = new THREE.PlaneGeometry(10, 10);
            const planeMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                side: THREE.DoubleSide,
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            scene.add(plane);

            // 创建 3D 物体
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );
            cube.position.set(1, 1, 1);
            scene.add(cube);

            const torus = new THREE.Mesh(
                new THREE.TorusGeometry(1, 0.3, 16, 100),
                new THREE.MeshStandardMaterial({ color: 0x88aabb })
            );
            torus.position.set(-1, 0.5, -1);
            scene.add(torus);

            const cone = new THREE.Mesh(
                new THREE.ConeGeometry(0.5, 1, 32),
                new THREE.MeshStandardMaterial({ color: 0x228b22 })
            );
            cone.position.set(1, 0.5, -1);
            scene.add(cone);

            // 创建透明球体 Shader
            const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
            const sphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    edgeColor: { value: new THREE.Color(0xffffff) }, // 白色边缘
                    edgeThickness: { value: 1.5 }, // 边缘厚度
                },
                vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(cameraPosition - vec3(modelMatrix * vec4(position, 1.0)));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
                fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform vec3 edgeColor;
    uniform float edgeThickness;

    void main() {
      // 计算 Fresnel
      float fresnel = pow(abs(1.0 - dot(vNormal, vViewDir)), edgeThickness);
      float alpha = clamp(fresnel, 0.0, 1.0);
      gl_FragColor = vec4(edgeColor, alpha);
    }
  `,
                transparent: true,
                depthWrite: true, // 允许深度写入
                blending: THREE.AdditiveBlending, // 透明混合
            });

            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            // 让球体渲染优先级提高，避免被其他物体遮挡
sphere.renderOrder = 1;
            scene.add(sphere);

            // 渲染循环
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();

            // 监听窗口变化
            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        });

        return { threeContainer };
    },
};
</script>

<style>
.three-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
</style>
