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
import { GUI } from "dat.gui";
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
            camera.position.set(0, 2, 5);
            camera.lookAt(new THREE.Vector3());
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                // alpha: true,
            });
            // ✅ 开启深度测试
            // renderer.state.buffers.depth.setTest(true);
            // renderer.state.buffers.depth.setMask(true);
            // renderer.state.buffers.depth.setFunc(THREE.LessEqualDepth);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true; // 启用阴影
            renderer.setSize(w, h);
            renderer.setClearColor(0x000000, 1);
            document.body.appendChild(renderer.domElement);
            // 2️⃣ 添加有限平面
            const planeGeometry = new THREE.PlaneGeometry(10, 10); // 限定大小
            const planeMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
            }); // 灰色平面
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = -1;
            plane.receiveShadow = true; // 接收阴影
            scene.add(plane);
            // 3️⃣ 添加 3D 物体
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );
            box.position.set(-2, 0.5, 0);
            box.castShadow = true; // 产生阴影
            scene.add(box);

            const torus = new THREE.Mesh(
                new THREE.TorusGeometry(0.7, 0.3, 16, 100),
                new THREE.MeshStandardMaterial({ color: 0x00ff00 })
            );
            torus.position.set(0, 0.5, 2);
            torus.castShadow = true;
            scene.add(torus);
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32),
                new THREE.MeshStandardMaterial({ color: 0x0000ff })
            );
            cylinder.position.set(2, 0.75, -2);
            cylinder.castShadow = true;
            scene.add(cylinder);
            // 4️⃣ 创建透明球体
            // 5️⃣ 创建 **带白色光雾的透明球体**
            const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);

            const fresnelShader = {
                uniforms: {
                    color: { value: new THREE.Color(0xffffff) }, // 光雾颜色
                    power: { value: 2.5 }, // 光的强度
                    scale: { value: 1.5 }, // 光的扩散范围
                    opacity: { value: 0.2 }, // 透明度
                    cameraNear: { value: camera.near },
                    cameraFar: { value: camera.far },
                    tDepth: { value: null }, // 深度贴图
                },
                vertexShader: `
                  varying vec3 vNormal;
                  varying vec3 vViewPosition;

                  void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = normalize(-viewPosition.xyz);
                    gl_Position = projectionMatrix * viewPosition;
                  }
                `,
                fragmentShader: `
                uniform sampler2D tDepth; // 深度纹理
                uniform float cameraNear;
                uniform float cameraFar;

                varying vec3 vNormal;
                varying vec3 vViewPosition;

                float getDepth(float depth) {
                    float z = depth * 2.0 - 1.0; // 转换到 NDC 空间
                    return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
                }

                void main() {
                    // 计算菲涅耳效应
                    float fresnel = pow(1.0 - dot(vNormal, vViewPosition), 2.5) * 1.5;

                    // 获取当前片元的深度
                    float sceneDepth = getDepth(texture2D(tDepth, gl_FragCoord.xy / vec2(1024.0, 1024.0)).r);
                    float fragDepth = getDepth(gl_FragCoord.z);

                    // 计算遮挡区域的高亮
                    float occlusionHighlight = smoothstep(0.0, 0.1, abs(sceneDepth - fragDepth)); // 0.1 处变白

                    // 计算最终颜色
                    vec3 finalColor = mix(vec3(1.0), vec3(1.0, 1.0, 1.0) * fresnel, occlusionHighlight);

                    gl_FragColor = vec4(finalColor, occlusionHighlight);
                }

        `,
            };

            const sphereMaterial = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(fresnelShader.uniforms),
                vertexShader: fresnelShader.vertexShader,
                fragmentShader: fresnelShader.fragmentShader,
                transparent: true,
                side: THREE.DoubleSide,
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(0, 1, 0); // 让球体中心对准物体
            scene.add(sphere);

            // 4️⃣ 添加光源和阴影
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(20, 20, 20);
            light.castShadow = true;
            scene.add(light);
            // 6️⃣ 创建 GUI 控制器
            const gui = new GUI();
            const sphereControls = {
                scale: 1, // 初始比例
                color: "#ffffff", // 初始颜色
            };

            gui.add(sphereControls, "scale", 0.1, 2).onChange((value) => {
                sphere.scale.set(value, value, value); // 调整大小
            });

            gui.addColor(sphereControls, "color").onChange((value) => {
                sphereMaterial.color.set(value); // 修改颜色
            });

            // 调整阴影质量
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 50;
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // 开启惯性
            controls.dampingFactor = 0.1; // 设置惯性阻尼
            const render = () => {
                renderer.render(scene, camera);
                torus.rotation.x += 0.02;
                torus.rotation.y += 0.02;
                controls.update();
                requestAnimationFrame(render);
            };
            render();
        },
    },
};
</script>