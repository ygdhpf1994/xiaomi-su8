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
            const controls = new OrbitControls(camera, renderer.domElement);
            // 添加坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(50);
            scene.add(axesHelper);

            const firefliesGeometry = new THREE.BufferGeometry();
            const firefliesCount = 300;
            const positions1 = new Float32Array(firefliesCount * 3);
            const sizes = new Float32Array(firefliesCount);

            for (let i = 0; i < firefliesCount; i++) {
                const r = Math.random() * 5 + 5;
                positions1[i * 3 + 0] = (Math.random() - 0.5) * r;
                positions1[i * 3 + 1] = (Math.random() - 0.5) * r;
                positions1[i * 3 + 2] = (Math.random() - 0.5) * r;

                sizes[i] = Math.random() + 0.4;
            }
            console.log(positions1, sizes)

            firefliesGeometry.setAttribute(
                "position",
                new THREE.BufferAttribute(positions1, 3)
            );
            firefliesGeometry.setAttribute(
                "aSize",
                new THREE.BufferAttribute(sizes, 1)
            );

            const firefliesVertexShader = /* GLSL */ `
                uniform float uTime;
                attribute float aSize;
                varying float a;
                void main() {
                    vec3 newPos = position;
                    // newPos.y += sin(uTime * 0.5 + newPos.x * 100.0) * aSize * 0.2;
                    // newPos.x += sin(uTime * 0.5 + newPos.x * 200.0) * aSize * 0.1;
                    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
                    a = aSize;
                    gl_PointSize = 170.0 * aSize / -mvPosition.z;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;

            const firefliesFragmentShader = /* GLSL */ `
                varying float a;
                void main() {
                  float d = length(gl_PointCoord - vec2(0.5));
                  bool  b = a > 1.0;
                  float strength = clamp(0.05 / d - 0.05 * 2.0, 0.0, 1.0);
                  gl_FragColor = vec4(vec3(1.0), strength);
              }
            `;

            const firefliesMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: firefliesVertexShader,
                fragmentShader: firefliesFragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const fireflies = new THREE.Points(
                firefliesGeometry,
                firefliesMaterial
            );
            scene.add(fireflies);

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
                        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
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
                side: THREE.DoubleSide,
            });

            const geometry = new THREE.BoxGeometry(2, 2, 2, 30, 30, 30);
            //const geometry = new THREE.SphereGeometry(1, 32, 16);
            console.log(geometry);
            const cube = new THREE.Points(geometry, material);
            scene.add(cube);
            console.log(fireflies);
            let time = 0;
            const render = () => {
                time += 0.02;
                fireflies.rotation.z = time;
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