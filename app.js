// ============================================================
// TM University AR
// MindAR + Three.js Module
//
// 功能
// ✓ MindAR Image Tracking
// ✓ 8 個 Target
// ✓ Goose PNG
// ✓ Arrow PNG
// ✓ route.js 控制方向
// ✓ Target 7 抵達
//
// 移除
// ✗ 點點路線
// ✗ 點點連線
// ✗ 幾何箭頭
// ✗ GLTFLoader
// ============================================================


// ============================================================
// Three.js
// ============================================================

import * as THREE from "three";


// ============================================================
// MindAR
// ============================================================

import { MindARThree } from
    "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";


// ============================================================
// Route
// ============================================================

import { ROUTES } from "./route.js";


// ============================================================
// MindAR Target
// ============================================================

const TARGET_FILE = "./targets.mind";


// ============================================================
// AR Container
// ============================================================

const arContainer =
    document.querySelector("#ar-container");


// ============================================================
// 檢查 AR Container
// ============================================================

if (!arContainer) {

    throw new Error(
        "找不到 #ar-container"
    );

}


// ============================================================
// MindAR 初始化
// ============================================================

const mindarThree = new MindARThree({

    container: arContainer,

    imageTargetSrc: TARGET_FILE,

    maxTrack: 1,

    uiScanning: "yes",

    uiLoading: "yes"

});


// ============================================================
// Three.js 元件
// ============================================================

const {
    renderer,
    scene,
    camera
} = mindarThree;


// ============================================================
// 光源
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xffffff,
        0xbbbbbb,
        3
    );

scene.add(
    hemisphereLight
);


// ============================================================
// Assets
// ============================================================

const ASSET_PATH =
    "./assets/";


// ============================================================
// 方向素材
// ============================================================

const DIRECTION_ASSETS = {

    forward: {

        goose:
            `${ASSET_PATH}goose_forward.png`,

        arrow:
            `${ASSET_PATH}arrow_forward.png`

    },


    left: {

        goose:
            `${ASSET_PATH}goose_left.png`,

        arrow:
            `${ASSET_PATH}arrow_left.png`

    },


    right: {

        goose:
            `${ASSET_PATH}goose_right.png`,

        arrow:
            `${ASSET_PATH}arrow_right.png`

    }

};


// ============================================================
// Texture Loader
// ============================================================

const textureLoader =
    new THREE.TextureLoader();


// ============================================================
// Texture Cache
// ============================================================

const textureCache = {};


// ============================================================
// 目前 AR 群組
// ============================================================

let currentARGroup = null;


// ============================================================
// 目前 Target
// ============================================================

let currentTargetIndex = null;


// ============================================================
// 載入圖片
// ============================================================

function loadTexture(path) {

    if (textureCache[path]) {

        return Promise.resolve(
            textureCache[path]
        );

    }


    return new Promise(
        (resolve, reject) => {

            textureLoader.load(

                path,

                (texture) => {

                    texture.colorSpace =
                        THREE.SRGBColorSpace;

                    textureCache[path] =
                        texture;

                    resolve(texture);

                },

                undefined,

                (error) => {

                    console.error(
                        "圖片載入失敗：",
                        path,
                        error
                    );

                    reject(error);

                }

            );

        }
    );

}


// ============================================================
// 建立 Sprite
// ============================================================

function createSprite(
    texture,
    width,
    height
) {

    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            alphaTest: 0.01,

            depthTest: true,

            depthWrite: false

        });


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(
        width,
        height,
        1
    );


    return sprite;

}


// ============================================================
// 建立 Goose + Arrow
// ============================================================

async function createDirectionGroup(
    direction
) {

    const assets =
        DIRECTION_ASSETS[direction];


    if (!assets) {

        console.error(
            "沒有這個方向的素材：",
            direction
        );

        return null;

    }


    // --------------------------------------------------------
    // 載入 Goose
    // --------------------------------------------------------

    const gooseTexture =
        await loadTexture(
            assets.goose
        );


    // --------------------------------------------------------
    // 載入 Arrow
    // --------------------------------------------------------

    const arrowTexture =
        await loadTexture(
            assets.arrow
        );


    // --------------------------------------------------------
    // 建立群組
    // --------------------------------------------------------

    const group =
        new THREE.Group();


    // --------------------------------------------------------
    // Goose
    // --------------------------------------------------------

    let gooseWidth =
        1.1;

    let gooseHeight =
        1.3;


    if (direction === "forward") {

        gooseWidth =
            1.0;

        gooseHeight =
            1.35;

    }


    const goose =
        createSprite(
            gooseTexture,
            gooseWidth,
            gooseHeight
        );


    goose.position.set(
        0,
        0.65,
        0.02
    );


    group.add(
        goose
    );


    // --------------------------------------------------------
    // Arrow
    // --------------------------------------------------------

    let arrowWidth =
        1.0;

    let arrowHeight =
        0.8;


    if (direction === "forward") {

        arrowWidth =
            0.85;

        arrowHeight =
            1.0;

    }


    const arrow =
        createSprite(
            arrowTexture,
            arrowWidth,
            arrowHeight
        );


    arrow.position.set(
        0,
        -0.55,
        0.01
    );


    group.add(
        arrow
    );


    // --------------------------------------------------------
    // 整體位置
    // --------------------------------------------------------

    group.position.set(
        0,
        0,
        0
    );


    return group;

}


// ============================================================
// 移除目前 Goose + Arrow
// ============================================================

function removeCurrentARGroup() {

    if (!currentARGroup) {

        return;

    }


    if (
        currentARGroup.parent
    ) {

        currentARGroup.parent.remove(
            currentARGroup
        );

    }


    currentARGroup.traverse(
        (object) => {

            if (
                object.material
            ) {

                object.material.dispose();

            }

        }
    );


    currentARGroup = null;

}


// ============================================================
// 顯示 Goose + Arrow
// ============================================================

async function showDirection(
    anchor,
    direction
) {

    removeCurrentARGroup();


    const group =
        await createDirectionGroup(
            direction
        );


    if (!group) {

        return;

    }


    anchor.group.add(
        group
    );


    currentARGroup =
        group;


    console.log(
        `顯示方向：${direction}`
    );

}


// ============================================================
// 抵達畫面
// ============================================================

function showArrival() {

    const arrival =
        document.querySelector(
            "#arrival"
        );


    if (!arrival) {

        return;

    }


    arrival.classList.add(
        "show"
    );

}


function hideArrival() {

    const arrival =
        document.querySelector(
            "#arrival"
        );


    if (!arrival) {

        return;

    }


    arrival.classList.remove(
        "show"
    );

}


// ============================================================
// 更新 HUD
// ============================================================

function updateHUD(
    route
) {

    const location =
        document.querySelector(
            "#current-location"
        );


    const instruction =
        document.querySelector(
            "#instruction"
        );


    if (location) {

        location.textContent =
            route.location;

    }


    if (instruction) {

        instruction.textContent =
            route.instruction;

    }

}


// ============================================================
// 更新路線
// ============================================================

async function updateRoute(
    targetIndex,
    anchor
) {

    const route =
        ROUTES[targetIndex];


    if (!route) {

        console.warn(
            `Target ${targetIndex} 沒有 route 設定`
        );

        return;

    }


    console.log(
        `Target ${targetIndex} 已辨識`,
        route
    );


    currentTargetIndex =
        targetIndex;


    // --------------------------------------------------------
    // 更新文字
    // --------------------------------------------------------

    updateHUD(
        route
    );


    // --------------------------------------------------------
    // 抵達
    // --------------------------------------------------------

    if (
        route.arrived === true
    ) {

        console.log(
            "已抵達目的地"
        );


        removeCurrentARGroup();

        showArrival();

        return;

    }


    // --------------------------------------------------------
    // 一般路線
    // --------------------------------------------------------

    hideArrival();


    // --------------------------------------------------------
    // 檢查方向
    // --------------------------------------------------------

    if (
        !DIRECTION_ASSETS[
            route.direction
        ]
    ) {

        console.error(
            "找不到方向素材：",
            route.direction
        );

        return;

    }


    // --------------------------------------------------------
    // 顯示 Goose + Arrow
    // --------------------------------------------------------

    await showDirection(
        anchor,
        route.direction
    );

}


// ============================================================
// 建立 8 個 Target
// ============================================================

const anchors = [];


for (
    let i = 0;
    i < 8;
    i++
) {

    const anchor =
        mindarThree.addAnchor(
            i
        );


    anchors.push(
        anchor
    );


    // --------------------------------------------------------
    // Target Found
    // --------------------------------------------------------

    anchor.onTargetFound =
        async () => {

            console.log(
                `Target ${i} Found`
            );


            await updateRoute(
                i,
                anchor
            );

        };


    // --------------------------------------------------------
    // Target Lost
    // --------------------------------------------------------

    anchor.onTargetLost =
        () => {

            console.log(
                `Target ${i} Lost`
            );

        };

}


// ============================================================
// 啟動 AR
// ============================================================

async function startAR() {

    const startButton =
        document.querySelector(
            "#start-button"
        );


    const status =
        document.querySelector(
            "#status"
        );


    try {

        // ----------------------------------------------------
        // Button
        // ----------------------------------------------------

        if (startButton) {

            startButton.disabled =
                true;

            startButton.textContent =
                "正在開啟相機…";

        }


        if (status) {

            status.textContent =
                "正在啟動 AR…";

        }


        // ----------------------------------------------------
        // 清除抵達狀態
        // ----------------------------------------------------

        hideArrival();


        // ----------------------------------------------------
        // 啟動 MindAR
        // ----------------------------------------------------

        await mindarThree.start();


        // ----------------------------------------------------
        // Render Loop
        // ----------------------------------------------------

        renderer.setAnimationLoop(
            () => {

                renderer.render(
                    scene,
                    camera
                );

            }
        );


        // ----------------------------------------------------
        // 成功
        // ----------------------------------------------------

        console.log(
            "MindAR 啟動成功"
        );


        if (status) {

            status.textContent =
                "請對準第一張場景圖片";

        }


        // ----------------------------------------------------
        // 隱藏開始畫面
        // ----------------------------------------------------

        const startScreen =
            document.querySelector(
                "#start-screen"
            );


        if (startScreen) {

            startScreen.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "AR 啟動失敗：",
            error
        );


        if (status) {

            status.textContent =
                "無法開啟相機，請確認相機權限。";

        }


        if (startButton) {

            startButton.disabled =
                false;

            startButton.textContent =
                "重新開啟 AR";

        }

    }

}


// ============================================================
// Start Button
// ============================================================

const startButton =
    document.querySelector(
        "#start-button"
    );


if (startButton) {

    startButton.addEventListener(
        "click",
        startAR
    );

}


// ============================================================
// 頁面載入
// ============================================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "================================"
        );

        console.log(
            "TM University AR Ready"
        );

        console.log(
            "MindAR Target：8"
        );

        console.log(
            "Goose + Arrow：ON"
        );

        console.log(
            "Dot Route：OFF"
        );

        console.log(
            "Three.js：Module"
        );

        console.log(
            "================================"
        );

    }
);