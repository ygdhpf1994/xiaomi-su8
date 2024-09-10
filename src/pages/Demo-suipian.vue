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
        bgc: 0x000000,
        cd: 50
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
    const {arr, centerList} = createPoint();
    console.log(sceneView, arr);
    const fgsContainer = new THREE.Group();
    sceneView.add(fgsContainer);
    fgsContainer.position.copy(new THREE.Vector3(-36, -36, 0.1));
    const vertexShader = /*glsl*/ ` 
        uniform float iTime;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 iMouse;
        uniform vec2 iResolution;
        uniform float uRandom;
        uniform float uLayerId;
        uniform vec3 uCenter;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec4 vMvPosition;
        varying vec3 vPosition;

        mat2 rotation2d(float angle){
            float s=sin(angle);
            float c=cos(angle);
            
            return mat2(
                c,-s,
                s,c
            );
        }
        
        mat4 rotation3d(vec3 axis,float angle){
            axis=normalize(axis);
            float s=sin(angle);
            float c=cos(angle);
            float oc=1.-c;
            
            return mat4(
                oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
                oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
                oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
                0.,0.,0.,1.
            );
        }
        
        vec2 rotate(vec2 v,float angle){
            return rotation2d(angle)*v;
        }
        vec3 rotate(vec3 v,vec3 axis,float angle){
            return(rotation3d(axis,angle)*vec4(v,1.)).xyz;
        }
        vec3 distort(vec3 p){
            vec3 tx1=vec3(-uCenter.x,-uCenter.y,-uCenter.z);
            p+=tx1;

            float angle=iTime*uRandom*0.05;
            p=rotate(p,vec3(0.,1.,0.),angle);

            vec3 tx2=vec3(uCenter.x,uCenter.y,uCenter.z);
            p+=tx2;

            //p*=(.6-uLayerId*.5);

            return p;
        }
        void main(){
            vec3 p=position;
            vec3 N=normal;
            

            p=distort(p);
            N=distort(N);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            vUv=uv;
            vNormal=N;
            vMvPosition=modelViewMatrix*vec4(p,1.);
            vPosition=p;
        }
    `;
    const fragmentShader = `
        varying vec2 vUv;
        uniform float iTime;
        varying vec3 vNormal;
        varying vec4 vMvPosition;
        varying vec3 vPosition;
        uniform sampler2D uTexture;
        uniform vec3 uLightPosition;
        uniform vec3 uLightColor;
        uniform float uRandom;
        uniform vec2 uMouse;
        mat2 rotation2d(float angle){
            float s=sin(angle);
            float c=cos(angle);

            return mat2(
                c,-s,
                s,c
            );
        }

        mat4 rotation3d(vec3 axis,float angle){
            axis=normalize(axis);
            float s=sin(angle);
            float c=cos(angle);
            float oc=1.-c;

            return mat4(
                oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
                oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
                oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
                0.,0.,0.,1.
            );
        }

        vec2 rotate(vec2 v,float angle){
            return rotation2d(angle)*v;
        }

        vec3 rotate(vec3 v,vec3 axis,float angle){
            return(rotation3d(axis,angle)*vec4(v,1.)).xyz;
        }

        // lighting
        float saturate(float a){
            return clamp(a,0.,1.);
        }

        float diffuse(vec3 n,vec3 l){
            float diff=saturate(dot(n,l));
            return diff;
        }

        float specular(vec3 n,vec3 l,float shininess){
            float spec=pow(saturate(dot(n,l)),shininess);
            return spec;
        }

        float blendSoftLight(float base,float blend){
            return(blend<.5)?(2.*base*blend+base*base*(1.-2.*blend)):(sqrt(base)*(2.*blend-1.)+2.*base*(1.-blend));
        }

        vec3 blendSoftLight(vec3 base,vec3 blend){
            return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
        }

        // distort
        vec2 distort(vec2 p){
            vec2 m=uMouse;

            p.x-=(uRandom-m.x*.8)*.5;
            p.y-=uRandom*.1-iTime*.001;

            p.x-=.25;
            p.y-=.5;
            p=rotate(p,uRandom);
            p*=2.;
            return p;
        }

        vec3 distortNormal(vec3 p){
            p*=vec3(-1.*uRandom*15.,-1.*uRandom*15.,30.5);
            return p;
        }

        // lighting
        vec4 lighting(vec3 tex,vec3 normal){
            vec4 viewLightPosition=viewMatrix*vec4(uLightPosition,0.);
            vec3 N=normalize(normal);
            vec3 L=normalize(viewLightPosition.xyz);

            vec3 dif=tex*uLightColor*diffuse(N,L);

            vec3 C=-normalize(vMvPosition.xyz);
            vec3 R=reflect(-L,N);

            vec3 spe=uLightColor*specular(R,C,500.);

            vec4 lightingColor=vec4(dif+spe,.5);

            vec3 softlight=blendSoftLight(tex,spe);
            float dotRC=dot(R,C);
            float theta=acos(dotRC/length(R)*length(C));
            float a=1.-theta*.3;

            vec4 col=vec4(tex,a*.01)+vec4(softlight,.02)+(lightingColor*a);
            return col;
        }

        void main(){
            vec2 p=vUv / 80.0;
            vec3 N=vNormal;
            p=distort(p);
            N=distortNormal(N);
            vec4 tex=texture2D(uTexture,p);
            vec4 col=tex;
            col=lighting(tex.xyz,N);
            gl_FragColor=col;
        }
    `;
    let i = 0.0;
    const loader = new THREE.TextureLoader()
    
    let Texture = loader.load('https://s2.loli.net/2022/11/20/8E6yHP9kAawc7Wr.jpg')
    const materialList = []
    arr.forEach((item, index) => {
        const shape = createShape(item);
        const extrudeSettings = {
            steps: 2,
            depth: 0.001,
            bevelEnabled: true,
            bevelThickness: 0.0005,
            bevelSize: 0.0005,
            bevelOffset: 0,
            bevelSegments: 1,
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const z = (Math.random() - 0.5) * 20
        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
                iTime: {
                    value: 0
                },
                uTexture: {
                    value: Texture,
                },
                uLightPosition: {
                    value: new THREE.Vector3(-0.2, -0.2, 3),
                },
                uLightColor: {
                    value: new THREE.Color("#eeeeee"),
                },
                uRandom: {
                    value: THREE.MathUtils.randFloat(0.1, 1.1),
                },
                uMouse: {
                    value: new THREE.Vector2(0.5, 0.5),
                },
                uLayerId: {
                    value: 0,
                },
                uCenter: {
                    value: new THREE.Vector3(centerList[index].x??0, centerList[index].y??0, z)
                }
            },
            vertexShader,
            fragmentShader,
        });
        materialList.push(material)
        console.log(centerList[index])
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = z;
        fgsContainer.add(mesh);
    });
    const fgsContainer2 = new THREE.Group().copy(fgsContainer.clone());
    fgsContainer2.position.y = fgsContainer.position.y - 100;

    const totalG = new THREE.Group();
    totalG.add(fgsContainer);
    totalG.add(fgsContainer2);
    sceneView.add(totalG);
    console.log(totalG)

    const animate = () => {
        i += 1.0;
        totalG.position.y = i * 0.2;
        if (totalG.position.y > 100) {
            i = 0;
        }
        for(let j = 0 ; j < materialList.length; j++) {
            materialList[j].uniforms.iTime.value = i
        }
        sceneView.renderer.render(sceneView.scene, sceneView.camera);
        sceneView.controls.update();
        requestAnimationFrame(animate);
    };
    animate();
});

const createPoint = () => {
    const gridX = 10,
        gridY = 10,
        maxX = 8,
        maxY = 9;
    const polygons = [];
    const centerList = [];

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
            const xarr = []
            const yarr = []
            for (let k = 0; k < edgeCount; k++) {
                if (k === 0) {
                    firstPoint = {
                        x: (i % maxX) * 10,
                        y: (j % maxY) * 10,
                    };
                    points.push(firstPoint);
                    xarr.push(firstPoint.x)
                    yarr.push(firstPoint.y)
                } else {
                    // random polar
                    const r = 10;
                    angle += THREE.MathUtils.randFloat(0, Math.PI / 2);
                    const anotherPoint = {
                        x: firstPoint.x + r * Math.cos(angle),
                        y: firstPoint.y + r * Math.sin(angle),
                    };
                    points.push(anotherPoint);
                    xarr.push(anotherPoint.x)
                    yarr.push(anotherPoint.y)
                }
            }
            polygons.push(points);
            const data = new THREE.Vector2((Math.max(...xarr) + Math.min(...xarr)) / 2, (Math.max(...yarr) + Math.min(...yarr)) / 2)
            centerList.push(data)
        }
    }
    console.log(centerList)

    return {
        arr: polygons,
        centerList
    };
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