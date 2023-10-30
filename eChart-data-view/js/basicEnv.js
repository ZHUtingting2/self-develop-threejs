import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';//hdr环境贴图加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";//解压缩加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";//模型加载器

import { Reflector } from "three/examples/jsm/objects/Reflector";//导入实现镜面模块

let scene, camare, renderer;
let axesHelper, controls;
let container;
//let modelValue = 0
//let clearModel = null

let robot;

init();
initLoader();
initEnv();
render();

function init() {
    //1.创建场景及物体
    scene = new THREE.Scene();

    //1.1创建坐标
    axesHelper = new THREE.AxesHelper(2);
    //scene.add(axesHelper)


    //2.创建相机
    camare = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camare.position.set(0, 1.5, 6);
    camare.lookAt(new THREE.Vector3(0, 0, 0));

    //3.创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    //document.body.appendChild(renderer.domElement);
    container = document.getElementById('robot');
    container.appendChild(renderer.domElement);

    //4.创建控制器
    controls = new OrbitControls(camare, renderer.domElement)
    controls.target.set(0, 0.2, 0)
    //controls.addEventListener('change', render) 监听控制器变化，调用render


}

function initLoader() {

    let hdrLoader = new RGBELoader();
    hdrLoader.load('./assets/sky12.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    });

    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/gltf/');//解压文件目录
    dracoLoader.setDecoderConfig({ type: 'js' });
    let gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader)
    gltfLoader.load('./assets/robot.glb', (gltf) => {
        scene.add(gltf.scene);
        robot = gltf.scene
    });

    controls.target.set(0, 0.2, 0)


}

function initEnv() {
    let light1 = new THREE.DirectionalLight(0xffffff, 0.3);
    light1.position.set(0, 10, 10);
    let light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light1.position.set(0, 10, -10);
    let light3 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(10, 10, 10);
    scene.add(light1, light2, light3);

    /* 添加光阵 */
    let video = document.createElement("video");
    video.src = "./assets/zp2.mp4";
    video.loop = true;
    video.muted = true;//设置静音
    video.play();
    let videoTexture = new THREE.VideoTexture(video);
    const videoGeoPlane = new THREE.PlaneGeometry(8, 4.5);
    const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,//定义此材质是否透明
        side: THREE.DoubleSide,//定义将要渲染哪一面
        alphaMap: videoTexture //alpha贴图是一张灰度纹理，用于控制整个表面的不透明度
    })
    const videoMesh = new THREE.Mesh(videoGeoPlane, videoMaterial);
    videoMesh.position.set(0, 0.2, 0);
    videoMesh.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(videoMesh);

    /* 添加镜面反射 */
    let reflectorGeometry = new THREE.PlaneGeometry(100, 100);//创建镜子形状
    let reflectorPlane = new Reflector(reflectorGeometry, {
        textureHeight: window.innerHeight,
        textureHeight: window.innerHeight,
        color: 0x332222
    });
    reflectorPlane.rotation.x = -Math.PI / 2;
    scene.add(reflectorPlane);
}




/****************************************************************************************************************************
var  clickLeft, clickRight;
function handlePage(){
    clickLeft = document.getElementById("clickLeft");
    clickLeft.addEventListener('click', btnHid);
    clickRight = document.getElementById("clickRight");
    clickRight.addEventListener('click', btnShow)
    //document.addEventListener('mouseup', handleMouseUp, false);
}
 //隐藏百变小怪按钮 
function btnHid(){
    modelValue = 0;
    clearModel = 0;//展示大头勇士，清空百变小怪
    //调取页面信息
    let dance = document.getElementById("dance");
    let death = document.getElementById("death");
    let jump = document.getElementById("jump");
    let walking = document.getElementById("walking");
    dance.style.display="none";
    death.style.display="none";
    jump.style.display="none";
    walking.style.display="none";
    initLoader();
    //deleteObject(robotExpressive)
}
//显示百变小怪按钮
function btnShow(){
    modelValue = 1;
    clearModel = 1;//清空大头勇士，展示百变小怪
    //调取页面信息
    let dance = document.getElementById("dance");
    let death = document.getElementById("death");
    let jump = document.getElementById("jump");
    let walking = document.getElementById("walking");
    dance.style.display="block";
    death.style.display="block";
    jump.style.display="block";
    walking.style.display="block";

    initLoader()
    //deleteObject(robot)
}
************************************************************************************/



function render() {
    controls.update();
    renderer.render(scene, camare);
    requestAnimationFrame(render);
}

//监听画面尺寸变化，更新渲染画面
window.addEventListener("resize", () => {
    console.log("画面变化了");
    camare.aspect = window.innerWidth / window.innerHeight;//更新摄像头
    camare.updateProjectionMatrix();//更新摄像头的投影矩阵
    renderer.setSize(window.innerWidth, window.innerHeight);//更新渲染器
    renderer.setPixelRatio(window.devicePixelRatio);//设置渲染器的像素比
})
