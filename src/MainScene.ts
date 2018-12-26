import {WebGLRenderer, Scene, Fog, PerspectiveCamera, HemisphereLight, DirectionalLight, OrbitControls, Camera} from 'three';
import {Hall, Library} from './LibraryRoom';

export default class MainScene extends Scene{
    readonly camera: PerspectiveCamera;
    constructor(readonly renderer: WebGLRenderer){
        super();
        const r3 = Math.tan(Math.PI / 3.0);
        const size = renderer.getSize();
        this.camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 12 * r3);
        this.camera.position.set(0, 2, 3);
        
        const controls = new OrbitControls(this.camera);
        controls.target.set(0, 2, 0);
        controls.update();

        const ambientLight = new HemisphereLight(0xbbbbbb, 0x888833, 1.0);
        this.add(ambientLight);

        this.fog = new Fog(0x000000, 10 * r3, 12 * r3);

        const hall = new Hall();
        this.add(hall, hall.clone().translateY(-9.5));
        const lib = new Library();
        const room = {x: 9 + r3, y: 9, z: 3 * r3 +1};
        this.add(lib.clone().translateZ(-room.z).translateX(room.x).rotateY(Math.PI / -3.0));
        this.add(lib.clone().translateZ(room.z).translateX(room.x).rotateY(Math.PI / 3.0));
        this.add(hall.clone().translateZ(-room.z * 2).translateX(room.x * 2));
        //this.add(hall.clone().translateZ(room.z * 2).translateX(room.x * 2));
    }

    cr: [number,number, number] = [0,0,0];
    render(){
        let r = this.camera.rotation;
        if(r.x != this.cr[0] || r.y != this.cr[1] || r.z != this.cr[2]){
            //console.log(Math.floor(r.x*100), Math.floor(r.y*100), Math.floor(r.z*100));
            this.cr = [r.x, r.y, r.z];
        }
        this.renderer.render(this, this.camera);
    }
}