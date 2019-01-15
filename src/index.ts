import './extension';
import {WebGLRenderer} from 'three';
import MainScene from './MainScene';
import { Player } from './Player';
import { BookSource } from './BookSource';
import AudioContainer from './AudioContainer';

const alphabetLetters = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,&!?'-/[]\"";
const kanaLetters = " ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮﾞﾟｰ､｡｢｣!?";

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

async function start(letterSet: string){
    const renderer = new WebGLRenderer({
        canvas: document.querySelector('canvas') as HTMLCanvasElement,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(960, 720, false);

    new AudioContainer({bgm: 'sounds/monotone.mp3'}).play('bgm');
    const book = new BookSource(letterSet);
    const player = new Player(renderer);
    const scene = new MainScene(player, book);

    while(true) {
        scene.render();
        await new Promise(r=>requestAnimationFrame(r));
    }
}

window.addEventListener('load', ()=>{
    const startButtons = document.querySelectorAll('button[start]');
    startButtons.forEach(el=>el.addEventListener('click', ev=>{
        const type = (ev.target as HTMLElement).getAttribute('start');
        switch(type){
            case 'alpha':
                start(alphabetLetters);
                break;
            case 'kana':
                start(kanaLetters);
                break;
            case 'any':
                let letters = '';
                while(letters.length != 64){
                    letters = prompt(`任意の64文字を入力 (現在:${letters.length})`, letters)!;
                    if(!letters) return;
                }
                start(letters);
                break;
            default:
                return;
        }
        startButtons.forEach(el=>el.textContent = null);
    }));
}, {once: true});