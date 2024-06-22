import * as THREE from "three"
import { Scene } from "three"
export class Background {
    private scene: Scene | null = null
    private url: string = ''
    constructor(scene: Scene) {
        this.scene = scene
        this.url = require('../assets/white-bg.png')
        this.init()
    }

    init() {
        const loader = new THREE.TextureLoader()
        const geo = new THREE.SphereGeometry(10, 50, 50)
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: loader.load(this.url)
        })
        const sphere = new THREE.Mesh(geo, material)
        sphere.position.copy({x: 0, y: 0, z: 0})
        if (this.scene !== null) {
            this.scene.add(sphere)
        }
    }
}