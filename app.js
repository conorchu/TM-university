// ============================================================
// TM University AR
// MindAR + Three.js Module
//
// ============================================================
// AR 物件配置：
//
//             ↑
//          Arrow
//
//              Goose
//
// Goose 永遠：
// ✓ 在 Arrow 下方
// ✓ 稍微偏右
//
// 所有 AR 圖案：
// ✓ 使用目前尺寸的 1/3
//
// 支援：
// ✓ forward
// ✓ left
// ✓ right
// ✓ arrived
//
// 移除：
// ✗ 點點路線
// ✗ 點點連線
// ✗ 幾何箭頭
// ✗ GLTFLoader
// ============================================================


// ============================================================
// ★ 羽球+1 網址
// ============================================================
//
// 請把這裡改成你的「羽球+1」正式網址。
//
// ============================================================

const BADMINTON_PLUS_URL =
    "https://你的羽球+1網址";


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
// Three.js
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

    },


    arrived: {

        goose:
            `${ASSET_PATH}goose_arrived.png`,

        arrow:
            `${ASSET_PATH}arrow_arrived.png`

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
// 所有 AR 圖案縮放倍率
//
// 原本 = 1
// 現在 = 1/3
//
// ============================================================

const AR_SCALE = 1 / 3;


// ============================================================
// Goose 相對於 Arrow 的水平偏移
//
// 正數 = 向右
//
// ============================================================

const GOOSE_OFFSET_X = 0.12;


// ============================================================
// Arrow / Goose 垂直位置
//
// Arrow 在上
// Goose 在下
//
// ============================================================

const ARROW_Y = 0.20;

const GOOSE_Y = -0.28;


// ============================================================
// 載入 Texture
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
        width * AR_SCALE,
        height * AR_SCALE,
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


    // ========================================================
    // 載入圖片
    // ========================================================

    const gooseTexture =
        await loadTexture(
            assets.goose
        );


    const arrowTexture =
        await loadTexture(
            assets.arrow
        );


    // ========================================================
    // 建立群組
    // ========================================================

    const group =
        new THREE.Group();


    // ========================================================
    // ARRIVED
    // ========================================================

    if (direction === "arrived") {


        // ----------------------------------------------------
        // Arrow
        // ----------------------------------------------------

        const arrow =
            createSprite(
                arrowTexture,

                1.25,

                1.45
            );


        arrow.position.set(

            0,

            ARROW_Y,

            0.01

        );


        group.add(
            arrow
        );


        // ----------------------------------------------------
        // Goose
        // ----------------------------------------------------

        const goose =
            createSprite(
                gooseTexture,

                1.45,

                1.45
            );


        goose.position.set(

            GOOSE_OFFSET_X,

            GOOSE_Y,

            0.02

        );


        group.add(
            goose
        );


        // ----------------------------------------------------
        // 整體位置
        // ----------------------------------------------------

        group.position.set(
            0,
            0,
            0
        );


        return group;

    }


    // ========================================================
    // 一般方向
    // ========================================================


    // ========================================================
    // Arrow
    // ========================================================

    let arrowWidth =
        1.0;

    let arrowHeight =
        0.8;


    if (
        direction === "forward"
    ) {

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

        ARROW_Y,

        0.01

    );


    group.add(
        arrow
    );


    // ========================================================
    // Goose
    // ========================================================

    let gooseWidth =
        1.1;

    let gooseHeight =
        1.3;


    if (
        direction === "forward"
    ) {

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

        GOOSE_OFFSET_X,

        GOOSE_Y,

        0.02

    );


    group.add(
        goose
    );


    // ========================================================
    // 整體位置
    // ========================================================

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

    // --------------------------------------------------------
    // 移除上一組
    // --------------------------------------------------------

    removeCurrentARGroup();


    // --------------------------------------------------------
    // 建立新的 Goose + Arrow
    // --------------------------------------------------------

    const group =
        await createDirectionGroup(
            direction
        );


    if (!group) {

        return;

    }


    // --------------------------------------------------------
    // 放到 Target 上
    // --------------------------------------------------------

    anchor.group.add(
        group
    );


    currentARGroup =
        group;


    console.log(
        `顯示方向：${direction}`
    );


    console.log(
        "AR 尺寸：目前設定的 1/3"
    );


    console.log(
        "Goose：Arrow 下方 + 稍微偏右"
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


    // ========================================================
    // 更新文字
    // ========================================================

    updateHUD(
        route
    );


    // ========================================================
    // ARRIVED
    // ========================================================

    if (
        route.arrived === true
    ) {

        console.log(
            "================================"
        );

        console.log(
            "已抵達目的地"
        );

        console.log(
            "顯示 arrived Goose + Arrow"
        );

        console.log(
            "================================"
        );


        // ----------------------------------------------------
        // 不顯示原本的抵達卡片
        // ----------------------------------------------------

        hideArrival();


        // ----------------------------------------------------
        // 顯示 arrived Goose + Arrow
        // ----------------------------------------------------

        await showDirection(
            anchor,
            "arrived"
        );


        return;

    }


    // ========================================================
    // 一般路線
    // ========================================================

    hideArrival();


    // ========================================================
    // 檢查方向
    // ========================================================

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


    // ========================================================
    // 顯示 Goose + Arrow
    // ========================================================

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


    const backButton =
        document.querySelector(
            "#back-button"
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
        // 清除抵達畫面
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
        // 啟動成功
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


        // ----------------------------------------------------
        // ★ 顯示「返回羽球+1」
        // ----------------------------------------------------

        if (backButton) {

            backButton.classList.add(
                "show"
            );

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
// ★ 返回羽球+1
// ============================================================

async function exitAR() {

    console.log(
        "================================"
    );

    console.log(
        "⬅️ 返回羽球+1"
    );


    // --------------------------------------------------------
    // 隱藏返回按鈕
    // --------------------------------------------------------

    const backButton =
        document.querySelector(
            "#back-button"
        );


    if (backButton) {

        backButton.classList.remove(
            "show"
        );

    }


    // --------------------------------------------------------
    // 移除目前 AR 物件
    // --------------------------------------------------------

    removeCurrentARGroup();


    // --------------------------------------------------------
    // 停止 Three.js Render Loop
    // --------------------------------------------------------

    renderer.setAnimationLoop(
        null
    );


    // --------------------------------------------------------
    // 停止 MindAR
    // --------------------------------------------------------

    try {

        await mindarThree.stop();

        console.log(
            "MindAR 已停止"
        );

    } catch (error) {

        console.warn(
            "MindAR stop 發生問題：",
            error
        );

    }


    // --------------------------------------------------------
    // 額外停止相機串流
    // --------------------------------------------------------

    try {

        const video =
            arContainer.querySelector(
                "video"
            );


        if (video) {

            if (
                video.srcObject
            ) {

                const tracks =
                    video.srcObject.getTracks();


                tracks.forEach(
                    (track) => {

                        track.stop();

                    }
                );

            }


            video.pause();

            video.srcObject =
                null;

        }

    } catch (error) {

        console.warn(
            "相機串流停止時發生問題：",
            error
        );

    }


    console.log(
        "相機已停止"
    );


    // --------------------------------------------------------
    // 跳轉到羽球+1
    // --------------------------------------------------------

    window.location.href =
        BADMINTON_PLUS_URL;

}


// ============================================================
// 開啟 AR 按鈕
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
// ★ 返回羽球+1 按鈕
// ============================================================

const backButton =
    document.querySelector(
        "#back-button"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        exitAR
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
            "Arrived Goose + Arrow：ON"
        );

        console.log(
            "AR Scale：1/3"
        );

        console.log(
            "Goose：Below Arrow + Right"
        );

        console.log(
            "Dot Route：OFF"
        );

        console.log(
            "Three.js：Module"
        );

        console.log(
            "Back Button：ON"
        );

        console.log(
            "================================"
        );

    }
);