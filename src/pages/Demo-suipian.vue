<template>
    <div class="hello"></div>
</template>

<script setup>
import { onMounted } from "vue";
import SceneView from "../component/SceneView";
import * as THREE from "three";
// import { ref } from "vue";

onMounted(() => {
    const w = window.innerWidth - 20;
    const h = window.innerHeight - 20;
    const data = {
        w,
        h,
    };
    const sceneView = new SceneView(data);

    // const shape = new THREE.Shape();
    // shape.moveTo(0, 0);
    // shape.lineTo(0, width);
    // shape.lineTo(length + width, width + width);
    // shape.lineTo(length, 0);
    // shape.lineTo(0, 0);
    //
    // const extrudeSettings = {
    // steps: 2,
    // depth: 0.1,
    // bevelEnabled: true,
    // bevelThickness: 0.0005,
    // bevelSize: 0.0005,
    // bevelOffset: 0,
    // bevelSegments: 1,
    // };

    // const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    // const mesh = new THREE.Mesh(geometry, material);
    const axesHelper = new THREE.AxesHelper(50);
    sceneView.add(axesHelper);

    // sceneView.add(mesh);
    const arr = createPoint();
    console.log(sceneView, arr);
    const fgsContainer = new THREE.Group();
    sceneView.add(fgsContainer);
    fgsContainer.position.copy(new THREE.Vector3(-36, -36, 0.1));
    arr.forEach((item) => {
        const shape = createShape(item);
        const extrudeSettings = {
            steps: 2,
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.0005,
            bevelSize: 0.0005,
            bevelOffset: 0,
            bevelSegments: 1,
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = (Math.random() - 0.5) * 20
        fgsContainer.add(mesh);
        console.log(mesh);
    });
    const fgsContainer2 = new THREE.Group().copy(fgsContainer.clone());
    fgsContainer2.position.y = fgsContainer.position.y - 100;

    const totalG = new THREE.Group();
    totalG.add(fgsContainer);
    totalG.add(fgsContainer2);
    sceneView.add(totalG)
    let i = 0
    const animate = () =>{
        i++
        totalG.position.y = (i * 0.5)
        if (totalG.position.y > 100) {
            i = 0
        }
        sceneView.renderer.render(sceneView.scene, sceneView.camera);
        sceneView.controls.update();
        requestAnimationFrame(animate);
    }
    animate()
});

const createPoint = () => {
    const gridX = 10,
        gridY = 10,
        maxX = 8,
        maxY = 9;
    const polygons = [];

    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridY; j++) {
            const points = [];
            let edgeCount = 3;
            const randEdgePossibility = Math.random();
            if (randEdgePossibility > 0 && randEdgePossibility <= 0.2) {
                edgeCount = 3;
            } else if (
                randEdgePossibility > 0.2 &&
                randEdgePossibility <= 0.55
            ) {
                edgeCount = 4;
            } else if (
                randEdgePossibility > 0.55 &&
                randEdgePossibility <= 0.9
            ) {
                edgeCount = 5;
            } else if (
                randEdgePossibility > 0.9 &&
                randEdgePossibility <= 0.95
            ) {
                edgeCount = 6;
            } else if (randEdgePossibility > 0.95 && randEdgePossibility <= 1) {
                edgeCount = 7;
            }
            let firstPoint = {
                x: 0,
                y: 0,
            };
            let angle = THREE.MathUtils.randFloat(0, 2 * Math.PI);
            for (let k = 0; k < edgeCount; k++) {
                if (k === 0) {
                    firstPoint = {
                        x: (i % maxX) * 10,
                        y: (j % maxY) * 10,
                    };
                    points.push(firstPoint);
                } else {
                    // random polar
                    const r = 10;
                    angle += THREE.MathUtils.randFloat(0, Math.PI / 2);
                    const anotherPoint = {
                        x: firstPoint.x + r * Math.cos(angle),
                        y: firstPoint.y + r * Math.sin(angle),
                    };
                    points.push(anotherPoint);
                }
            }
            polygons.push(points);
        }
    }

    return polygons;
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
</script>