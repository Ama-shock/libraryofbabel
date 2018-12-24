import {WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight, OrbitControls} from 'three';
import {Floor} from './LibraryRoom';

export default class MainScene extends Scene{
    readonly camera: PerspectiveCamera;
    constructor(readonly renderer: WebGLRenderer){
        super();
        const size = renderer.getSize();
        this.camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 10000);
        this.camera.position.set(0, 0, 0);
        
        const controls = new OrbitControls(this.camera);
        controls.target.set(0, -0.5, -3.5);
        controls.update();

        // 平行光源を作成
        const directionalLight = new DirectionalLight(0xFFFFFF);
        directionalLight.position.set(0, 0, 0);
        this.add(directionalLight);
        // 環境光を追加
        const ambientLight = new AmbientLight(0x666666);
        this.add(ambientLight);

        this.add(new Floor());
    }

    render(){
        this.renderer.render(this, this.camera);
    }
}