import './extension';
import {WebGLRenderer, GridHelper} from 'three';
import MainScene from './MainScene';

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
    renderer.setSize(960, 540);

    const scene = new MainScene(renderer);
    //scene.add(new GridHelper(100, 100));

    while(true) {
        scene.render();
        await new Promise(r=>requestAnimationFrame(r));
    }
}, {once: true});