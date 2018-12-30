import {WebGLRenderer, Scene, Fog, PerspectiveCamera, HemisphereLight, FirstPersonControls, Camera, Clock} from 'three';
import {Hall, Library} from './LibraryRoom';

export default class MainScene extends Scene{
    readonly clock = new Clock();
    readonly camera: Camera;
    readonly controls: FirstPersonControls;
    constructor(readonly renderer: WebGLRenderer){
        super();
        const r3 = Math.tan(Math.PI / 3.0);
        const size = renderer.getSize();
        this.camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 12 * r3);
        this.camera.position.set(0, 2, 3);
        
        this.controls = new FirstPersonControls(this.camera);
        //controls.target.set(0, 2, 0);
        this.controls.lookSpeed = 0.1;
        this.controls.movementSpeed = 5;
        this.controls.noFly = false;
        this.controls.lookVertical = true;
        this.controls.autoForward = false;
        
        this.controls.activeLook = true; // false : 一方向しか見られない
        this.controls.domElement = renderer.domElement;
        
        // 首を上下する角度
        this.controls.constrainVertical = true;
        this.controls.verticalMin = 1.0;
        this.controls.verticalMax = 2.0;
        

        const ambientLight = new HemisphereLight(0xbbbbbb, 0x888833, 1.0);
        this.add(ambientLight);

        this.fog = new Fog(0x000000, 10 * r3, 12 * r3);

        const hall = new Hall();
        this.add(hall, hall.clone().translateY(-9.5));
        const lib = new Library();
        const room = {x: 9 + r3, y: 9, z: 3 * r3 +1};
        //this.add(lib.clone().translateZ(-room.z).translateX(room.x).rotateY(Math.PI / -3.0));
        //this.add(lib.clone().translateZ(room.z).translateX(room.x).rotateY(Math.PI / 3.0));
        this.add(hall.clone().translateZ(-room.z * 2).translateX(room.x * 2));
        //this.add(hall.clone().translateZ(room.z * 2).translateX(room.x * 2));
    }

    cr: [number,number, number] = [0,0,0];
    render(){
        this.controls.update(this.clock.getDelta());
        this.camera.position.y = 2;
        this.renderer.render(this, this.camera);
    }
}