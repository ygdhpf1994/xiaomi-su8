<template>
  <div class="hello">
    <div class="go" @click="go">
      gogogo
    </div>
    <div id="canvas1">
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import {Background} from "../pages/backgroud.ts"

// 引入 DRACOLoader
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import bg from "../assets/t_env_light.hdr";
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      scene: null,
      wheel: null
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
      // const camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 1, 1000 );
      camera.position.set(0, 5, 0);
      camera.lookAt(new THREE.Vector3());
      const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      //  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
      // directionalLight1.position.set(-10, 10, 10);
      //  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      // directionalLight2.position.set(-10, 10, -10);
      // directionalLight.castShadow = true;
      scene.add(directionalLight);
      // scene.add(directionalLight1);
      // scene.add(directionalLight2);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true,
      });
      scene.castShadow = true;

      const controls = new OrbitControls(camera, renderer.domElement);
      console.log(camera);
      const geometry = new THREE.PlaneGeometry(10, 10);
      // const material = new THREE.MeshLambertMaterial({
      //   color: 0xffffff,
      //   side: THREE.DoubleSide,
      // });
      const options = {
        color: 0xffffff,
        textureWidth: 512,
        textureHeight: 512,
        clipBias: 0.03,
        // shader: undefined,
        // encoding: LinearEncoding,
        // multisample: 0,
      };
      const plane = new Reflector(geometry, options);
      // plane.lookAt(0, 1, 0);
      plane.rotation.x = -0.5 * Math.PI
      scene.add(plane);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
      plane.receiveShadow = true;

      new RGBELoader().load(bg, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      });
      const canvas1 = document.getElementById('canvas1')

      canvas1.appendChild(renderer.domElement);

      // const clock = new THREE.Clock();
      // 创建GLTF加载器对象
      // 创建一个新的 DRACOLoader 实例
      const dracoLoader = new DRACOLoader();

      // 设置 DRACOLoader 的解压路径，通常需要从 CDN 或者本地服务器加载
      dracoLoader.setDecoderPath("/draco/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load("/su8/scene.gltf", (gltf) => {
        // console.log("控制台查看加载gltf文件返回的对象结构", gltf);
        // console.log("gltf对象场景属性", gltf.scene);
        // 返回的场景对象gltf.scene插入到threejs场景中
        gltf.scene.traverse((item) => {
          item.castShadow = true;
          if (item.name === 'Wheel1001_12') {
            this.wheel = item.children[0]
            console.log(this.wheel)
          }
          // if (item.isMesh) {
          // item.material.clippingPlanes = [this.localPlane];
          // item.stencilRef = 1;
          // item.stencilWrite = true;
          // item.stencilWriteMask = 0xff;
          // item.stencilZPass = THREE.ReplaceStencilOp;
          // item.geometry.computeVertexNormals();
          // if (item.name === "平面") {
          //   item.visible = false;
          // }
          // if (item.name === 'topLigt') {
          //   item.material.clippingPlanes = []
          //   item.position.y = 6
          //   item.scale.set(12, 0.04, 6)
          //   // item.visible = false
          //   item.material.emissiveIntensity = 0.52
          //   // item.material.emissiveIntensity = 0
          //   this.topLight = item
          // }
          // }
        });
        scene.add(gltf.scene);
        gltf.scene.children.forEach((item, index) => {
          if (item.type === "Group" && index === 8) {
            item.children.forEach((item1) => {
              // item1.material.color.set(1, 0, 0)
              console.log(item1);
            });
          }
        });
        new Background(scene)
        const { box3, center } = this.getBoxInfo(gltf.scene);
        gltf.scene.position.set(0, -box3.min.y, 0);
        console.log(box3, center);
        // console.log(gltf.scene.children[12].material.color)
        console.log(scene);

        // 添加坐标轴辅助器
        const axesHelper = new THREE.AxesHelper(50);
        scene.add(axesHelper);
        // 启用阻尼（惯性） enableDamping：设置为true，启用阻尼（惯性），这将给控制器带来重量感。默认值为false
        controls.enableDamping = false;
        // dampingFactor：阻尼惯性有多大。 默认值 0.05
        controls.dampingFactor = 0.04;

        // 移动相机视角;
        // camera.position.x = -3;
        camera.position.y = 2;
        camera.position.z = -5;

        // 让 Three.js的gltf模型自动居中
        // const boxInfo = toSceneCenter(gltf.scene);
        // const { center } = boxInfo;
        // 让相机视角看到物体的位置
        camera.lookAt(0, 10, 10);

        // 渲染场景和相机
        renderer.render(scene, camera);
      });

      // const textureLoader  = THREE.textureLoader()
      // const clock = new THREE.Clock();
      const render = () => {
        // const time = clock.getElapsedTime();
        // points.rotation.y = time * 0.5;
        // material.uniforms.uTime.value = time;
        if (this.wheel) {
          // this.wheel.rotation.z = time * 1;
        }
        plane.updateMatrix()
        
        renderer.render(scene, camera);
        controls.update();
        requestAnimationFrame(render);
      };
      // console.log(mesh);

      // 获取包围盒

      // const toSceneCenter = function (mesh) {
      //   const { center, size } = getBoxInfo(mesh);
      //   console.log("中心点", center);
      //   // 将Y轴置为0
      //   mesh.position.copy(center.negate().setY(0));
      //   return { center, size };
      // };

      render();
    },
    getBoxInfo(mesh) {
      const box3 = new THREE.Box3();
      box3.expandByObject(mesh);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      // 获取包围盒的中心点和尺寸
      box3.getCenter(center);
      box3.getSize(size);
      return {
        size,
        center,
        box3,
      };
    },
    go() {
      this.$router.push('/demo3')
    }
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

.go {
  width: 30px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
