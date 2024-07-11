import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export interface attrs {
    w: number,
    h: number
}
export default class SceneView {
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private controls: OrbitControls
    private clock: THREE.Clock
    constructor(attrs: attrs) {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(90, attrs.w / attrs.h, 0.001, 1000);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            // alpha: true,
        });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(attrs.w, attrs.h);
        this.renderer.setClearColor(0x000000, 1);
       
        const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
        this.scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        this.clock = new THREE.Clock();
        document.body.appendChild(this.renderer.domElement);
        // this.init()
    }


    add(entity: THREE.Object3D) {
        this.scene.add(entity)
    }
}