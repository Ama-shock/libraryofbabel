import {WebGLRenderer, Scene, Fog, PerspectiveCamera, HemisphereLight, PointLight, FirstPersonControls, Camera, Clock} from 'three';
import {Hall, Library, UnitBase, Room} from './3DObjects';

function echo(...str: any[]){
    const article = document.querySelector('article');
    const p = document.createElement('p');
    p.textContent = str.join(' ');
    article && article.appendChild(p);
}
function clear(){
    const article = document.querySelector('article');
    article && article.querySelectorAll('p').forEach(p=>p.remove());
}

export default class MainScene extends Scene{
    readonly clock = new Clock();
    readonly camera: Camera;
    readonly light: PointLight;
    readonly controls: FirstPersonControls;
    constructor(readonly renderer: WebGLRenderer){
        super();
        const r3 = Math.tan(Math.PI / 3.0);
        const size = renderer.getSize();
        this.camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 12 * r3);
        this.camera.position.set(0, 4, 3);

        this.light = new PointLight(0xFFFFFF, 1, 8, 0.5);
        this.light.position.y = 4;
        this.add(this.light);
        
        const ambientLight = new HemisphereLight(0xbbbbbb, 0x888833, 1.0);
        this.add(ambientLight);

        this.fog = new Fog(0x000000, 6 * r3, 9 * r3);
        
        this.controls = new FirstPersonControls(this.camera, renderer.domElement);
        this.controls.lookSpeed = 0.1;
        this.controls.movementSpeed = 5;
        

        this.add(this.hall);
        this.current = this.hall;
    }

    render(){
        clear();
        this.controls.update(this.clock.getDelta());
        this.rebuild();
        this.renderer.render(this, this.camera);
    }

    hall = new UnitBase(Hall);
    library = new UnitBase(Library);
    current: UnitBase;
    rebuild(){
        this.camera.position.y = 4;
        let x = this.camera.position.x;
        let z = this.camera.position.z;
        echo('x', x);
        echo('z', z);
        echo('theta', this.controls.theta);
        echo('phi', Math.cos(this.controls.phi));
        if(x*x + z*z > 7*7){
            x += x > 0 ? -Room.size.x : Room.size.x;
            z += z > 0 ? -Room.size.z : Room.size.z;
            const next = this.current !== this.hall ? this.hall : this.library;
            this.remove(this.current);
            this.add(next);
            this.current = next;
        }
        this.current.update(this.controls.theta, this.controls.phi);
        this.light.position.x = this.camera.position.x = x;
        this.light.position.z = this.camera.position.z = z;
    }
    
}