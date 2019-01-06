import './extension';
import {WebGLRenderer, GridHelper} from 'three';
import MainScene from './MainScene';
import { Player } from './Player';

Object.defineProperty(self, 'capture', {value: ()=>{
    let canvas = document.querySelector('canvas') as any;
    let anchor = document.createElement('a');
    anchor.target = '_blank';
    anchor.download = 'canvas.png';
    anchor.href = canvas.toDataURL();
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}});

window.addEventListener('load', async()=>{
    const renderer = new WebGLRenderer({
        canvas: document.querySelector('canvas') as HTMLCanvasElement,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(640, 480);

    const player = new Player(renderer);
    const scene = new MainScene(player);

    while(true) {
        scene.render();
        await new Promise(r=>requestAnimationFrame(r));
    }
}, {once: true});