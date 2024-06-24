<!--
 * @Author: ygdhpf1994 1270253125@qq.com
 * @Date: 2024-06-22 23:22:35
 * @LastEditors: ygdhpf1994 1270253125@qq.com
 * @LastEditTime: 2024-06-24 07:16:06
 * @FilePath: /xiaomi-su8/src/pages/Demo1.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="hello"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";

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
      let w = window.innerWidth;
      let h = window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        1,
        20000
      );
      camera.position.set(30, 30, 100);
      camera.lookAt(0, 0.1, 0);
      //scene.background = new THREE.Color( 0x443333 );
      //scene.fog = new THREE.Fog( 0x443333, 1, 4 );
      const hemiLight = new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3);
      scene.add(hemiLight);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);
      renderer.setClearColor(0xbbdefb, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.5;

      renderer.shadowMap.enabled = true;

      document.body.appendChild(renderer.domElement);
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
          "textures/waternormals.jpg",
          function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
      });
      water.rotation.x = -Math.PI / 2;

      scene.add(water);
      const sky = new Sky();
      sky.scale.setScalar(10000);
      scene.add(sky);
      const skyUniforms = sky.material.uniforms;

      skyUniforms["turbidity"].value = 10;
      skyUniforms["rayleigh"].value = 2;
      skyUniforms["mieCoefficient"].value = 0.005;
      skyUniforms["mieDirectionalG"].value = 0.8;

      const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
      scene.add(light);
      const spotLight = new THREE.SpotLight();
      spotLight.intensity = 7;
      spotLight.angle = Math.PI / 16;
      spotLight.penumbra = 0.5;
      spotLight.castShadow = true;
      spotLight.position.set(2, 2, 2);
      scene.add(spotLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      // 添加坐标轴辅助器
      const axesHelper = new THREE.AxesHelper(50);
      scene.add(axesHelper);
      const loader = new THREE.TextureLoader();
      const geometry1 = new THREE.SphereGeometry(15, 30, 30);
      
      const loader1 = new THREE.TextureLoader()
      

      var material1 = new THREE.MeshPhongMaterial({
        map: loader.load(require("../assets/earth-4096.png")),
        normalMap: loader1.load(require("../assets/earth_normal.jpg")),
        side: THREE.DoubleSide,
      });
      var material2= new THREE.MeshPhongMaterial({
        map: loader.load(require("../assets/earth-4096.png")),
        side: THREE.DoubleSide,
      });

      var cube1 = new THREE.Mesh(geometry1, material1);
      var cube2 = new THREE.Mesh(geometry1, material2);
      cube1.position.set(-0, 15, 0.2);
      cube2.position.set(-0, 15, 40)
      cube1.castShadow = true;
      cube2.receiveShadow = true;
      cube2.castShadow = true;
      cube1.receiveShadow = true;
      scene.add(cube1);
      scene.add(cube2);
      const parameters = {
        elevation: 2,
        azimuth: 180,
      };
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const sceneEnv = new THREE.Scene();

      let renderTarget;

      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);
      let sun = new THREE.Vector3();

      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      if (renderTarget !== undefined) renderTarget.dispose();

      sceneEnv.add(sky);
      renderTarget = pmremGenerator.fromScene(sceneEnv);
      scene.add(sky);

      // scene.environment = renderTarget.texture;

      const clock = new THREE.Clock();
      const render = () => {
        const time = clock.getElapsedTime();
        cube1.rotation.y = time * 0.5;
        cube2.rotation.y = time * 0.5;
        renderer.render(scene, camera);
        camera.lookAt(0, 0.1, 0);
        water.material.uniforms["time"].value += 1.0 / 60.0;
        controls.update();
        requestAnimationFrame(render);
      };
      render();
    },
  },
};
</script>