<template>
  <div class="hello"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export default {
  name: "shaderTest",
  props: {
    msg: String,
  },
  data() {
    return {
      scene: null,
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
      const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
      // const camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 1, 1000 );
      camera.position.set(0, 3, 24);
      camera.lookAt(new THREE.Vector3());
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);
      renderer.setClearColor(0x160016, 1);
      document.body.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      console.log(controls);
      const count1 = 50000;
      const count2 = 100000;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const sizes = [];
      const shifts = [];
      for (let i = 0; i < count1 + count2; i++) {
        let theta = Math.random() * Math.PI * 2;
        // let phi = Math.random() * Math.PI; // 两极密集
        let phi = Math.acos(Math.random() * 2 - 1); // 分布更均匀
        if (i < count1) {
          // let r = 10;
          let r = Math.random() * 0.5 + 9.5;
          // let x = r * Math.sin(phi) * Math.cos(theta);
          // let y = r * Math.cos(phi);
          // let z = r * Math.sin(phi) * Math.sin(theta);
          let { x, y, z } = new THREE.Vector3()
            .randomDirection()
            .multiplyScalar(r);
          positions.push(x, y, z);
          let angle = (Math.random() * 0.9 + 0.1) * Math.PI * 0.1;
          positions.push(x, y, z);
          let strength = Math.random() * 0.9 + 0.1; // 0.1-1
          shifts.push(theta, phi, angle, strength);
          let size = Math.random() * 1.5 + 0.5; // 0.5-2.0
          sizes.push(size);
        } else {
          // 圆盘粒子
          // let r = 10;
          // let R = 40;
          // let rand = Math.pow(Math.random(), 1.5);
          let radius = Math.random() * 30 + 10;
          let { x, y, z } = new THREE.Vector3().setFromCylindricalCoords(
            radius,
            Math.random() * 2 * Math.PI,
            (Math.random() - 0.5) * 2
          );
          positions.push(x, y, z);
        }
      }
      console.log(geometry)
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      // const geometry = new THREE.SphereGeometry(10);
      // const material = new THREE.MeshBasicMaterial({
      //   color: 0xffffff,
      //   wireframe: true,
      // });
      // const mesh = new THREE.Mesh(geometry, material);
      // scene.add(mesh);

      // const material = new THREE.PointsMaterial({
      //   size: 0.4,
      //   color: 0xffffff,
      // });
      geometry.setAttribute(
        "aSize",
        new THREE.Float32BufferAttribute(sizes, 1)
      );
      geometry.setAttribute(
        "aShift",
        new THREE.Float32BufferAttribute(shifts, 4)
      );

      const vertexShader = /* GLSL */ `
        attribute float aSize;
        attribute vec4 aShift;
      
        uniform float uTime;
      
        varying vec3 vColor;
      
        const float PI = 3.141592653589793238;
      
        void main() {
            // float d = abs(position.y) / 10.0;
            float d = length(abs(position) / vec3(40., 10., 40.)); // 中间黄色、外面紫色
            d = clamp(d, 0., 1.);
            
            // rgb(227, 155, 0)
            // rgb(100, 50, 255)
            vec3 color1 = vec3(227., 155., 0.);
            vec3 color2 = vec3(100., 50., 255.);
      
            vColor = mix(color1, color2, d) / 255.;
      
            vec3 transformed = position;
      
            float theta = mod(aShift.x + aShift.z * uTime, PI * 2.);
            float phi = mod(aShift.y + aShift.z * uTime, PI * 2.);
            transformed += vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * aShift.w;
            
            vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
            gl_PointSize = aSize * 80.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
        }
      `;

      const fragmentShader = /* GLSL */ `
        // varying vec2 vUv;
        varying vec3 vColor;

        void main() {
          // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          // gl_FragColor = vec4(gl_PointCoord, 0.0, 1.0);
          // float mask = step(length(gl_PointCoord - 0.5), 0.5);
          float d = length(gl_PointCoord.xy - 0.5);
          if(d > 0.5) discard;
          gl_FragColor = vec4(vColor, smoothstep(0.5, 0.1, d));
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        // blending: THREE.AdditiveBlending,
        depthTest: false,
      });
      const points = new THREE.Points(geometry, material);
      points.rotation.order = "ZYX";
      points.rotation.z = 0.2;
      scene.add(points);

      // const clock = new THREE.Clock();
      const render = function () {
        // const time = clock.getElapsedTime();
        // points.rotation.y = time * 0.5;
        // material.uniforms.uTime.value = time;
        renderer.render(scene, camera);
         controls.update();
        requestAnimationFrame(render);
      };
      // console.log(mesh);

      render();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
