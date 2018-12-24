import './extension';
import {WebGLRenderer, GridHelper} from 'three';
import MainScene from './MainScene';

window.addEventListener('load', async()=>{
    const renderer = new WebGLRenderer({
        canvas: document.querySelector('canvas') as HTMLCanvasElement
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(960, 540);

    const scene = new MainScene(renderer);
    scene.add(new GridHelper(100, 100));

    while(true) {
        scene.render();
        await new Promise(r=>requestAnimationFrame(r));
    }
}, {once: true});