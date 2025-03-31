<template>
    <div >
        <div class="hello" @click="updateProfile">{{isProfile ? '开始剖切' : '取消剖切'}}</div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import SceneView from "../component/SceneView";
import * as THREE from "three";
import { ref } from "vue";

let isProfile = ref(false)

let sceneView = null

let stencilGroupList = []
let poGroupList = []
let curMesh = []
let Planes = []

onMounted(() => {
    const w = window.innerWidth - 20;
    const h = window.innerHeight - 20;
    const data = {
        w,
        h,
        bgc: 0xffffff,
        cd: 5,
    };
    sceneView = new SceneView(data);
    const axesHelper = new THREE.AxesHelper(50);
    sceneView.add(axesHelper);
    const Points = [
        { x: 1, y: 2 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
        { x: 2, y: -1 },
        { x: 0, y: -2 },
        { x: -2, y: -1 },
        { x: -2, y: 0 },
        { x: -1, y: 1 },
        { x: -1, y: 2 },
    ];
    const shape = createShape(Points);
    const extrudeSettings = {
        steps: 2,
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 0.0005,
        bevelSize: 0.0005,
        bevelOffset: 0,
        bevelSegments: 1,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 , side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(geometry, material);
    // sceneView.add(mesh)
    curMesh = mesh
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const stencilGroup = createPlaneStencilGroup(mesh.geometry, plane, 2);
    const object = new THREE.Group();
    object.add(stencilGroup);
    stencilGroupList.push(object)

    sceneView.add(object);
    const poGroup = new THREE.Group();
    const planeGeom = new THREE.PlaneGeometry(6, 6);
    const planeMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0,
        roughness: 0.75,
        colorWrite : false,
        clippingPlanes: [plane],

        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
    });
    const po = new THREE.Mesh(planeGeom, planeMat);
    po.onAfterRender = function (renderer) {
        renderer.clearStencil();
    };
    mesh.material.clippingPlanes = [plane]
    Planes.push(plane)
    mesh.renderOrder = 6
    object.add(mesh)
    po.renderOrder = 3;
    poGroup.add(po);
    sceneView.add(poGroup);
    poGroupList.push(poGroup)
    poGroup.lookAt(0, -1, 0)
    
    animate();
});

const animate = () => {
    sceneView.renderer.render(sceneView.scene, sceneView.camera);
    sceneView.controls.update();
    requestAnimationFrame(animate);
};

const createShape = (item) => {
    const shape = new THREE.Shape();
    for (let i = 0; i < item.length; i++) {
        if (i === 0) {
            shape.moveTo(item[i].x, item[i].y);
        } else {
            shape.lineTo(item[i].x, item[i].y);
        }
    }
    return shape;
};

const updateProfile = () => {
    if (!isProfile.value) {
        // sceneView.remove(stencilGroupList[0])
        // sceneView.remove(poGroupList[0])
        // sceneView.add(curMesh)
        curMesh.material.clippingPlanes = null
    } else {
        // sceneView.add(stencilGroupList[0])
        // sceneView.add(poGroupList[0])
        curMesh.material.clippingPlanes = Planes
    }
    isProfile.value = !isProfile.value
    console.log(sceneView.scene)
    //  animate();
}

const createPlaneStencilGroup = (geometry, plane, renderOrder) => {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
};
</script>

<style>
.hello {
    position: absolute;
    top: 50;
    left: 50;
    width: 30;
    height: 20;
    border: 1px black solid;
}
</style>