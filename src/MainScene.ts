import {WebGLRenderer, Scene, Fog, PerspectiveCamera, HemisphereLight, PointLight, FirstPersonControls, Camera, Clock, Vector3} from 'three';
import {Hall, Library, Unit, Room} from './3DObjects';

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

    current: Unit;
    unitHall = new Unit(Hall);
    unitLibraryS = new Unit(Library).rotateY(Math.PI / 3);
    unitLibraryR = new Unit(Library).rotateY(Math.PI / -3);
    hall = new Hall();
    libraryS = new Library().rotateY(Math.PI / 3);
    libraryR = new Library().rotateY(Math.PI / -3);

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
        
        this.current = this.unitHall;
        this.add(
            this.unitHall,
            this.unitLibraryS,
            this.unitLibraryR,
            this.hall,
            this.libraryS,
            this.libraryR
        );
    }

    render(){
        clear();
        this.controls.update(this.clock.getDelta());
        this.reposition();
        this.rebuild();
        this.renderer.render(this, this.camera);
    }

    get theta(){
        const theta = this.controls.theta % (Math.PI * 2);
        return theta < 0 ? theta + Math.PI * 2 : theta;
    }

    reposition(){
        let x = this.camera.position.x;
        let z = this.camera.position.z;
        echo('x', x);
        echo('z', z);
        echo('theta', this.theta);
        if(x*x + z*z > 7*7){
            x += x > 0 ? -Room.size.x : Room.size.x;
            z += z > 0 ? -Room.size.z : Room.size.z;
            this.current = this.current !== this.unitHall ? this.unitHall : x * z > 0 ? this.unitLibraryS : this.unitLibraryR;
        }
        this.light.position.x = this.camera.position.x = x;
        this.light.position.z = this.camera.position.z = z;
        this.camera.position.y = 4;
    }

    rebuild(){
        switch(this.current){
            case this.unitHall: return this.rebuildHall();
            case this.unitLibraryS: return this.rebuildLibraryS();
            case this.unitLibraryR: return this.rebuildLibraryR();
        }
    }
    
    inHalf(shift: number = 0){
        return (this.theta - shift + Math.PI * 2) % (Math.PI * 2) < Math.PI;
    }
    private rebuildHall(){
        this.unitHall.position.x = 0;
        this.unitHall.position.z = 0;

        const s = this.inHalf(Math.PI / -3) ? 1 : -1;
        this.unitLibraryS.position.x = Room.size.x * s;
        this.unitLibraryS.position.z = Room.size.z * s;
        this.libraryS.position.x = -Room.size.x * s;
        this.libraryS.position.z = -Room.size.z * s;
        
        const r = this.inHalf(Math.PI / 3) ? 1 : -1;
        this.unitLibraryR.position.x = -Room.size.x * r;
        this.unitLibraryR.position.z = Room.size.z * r;
        this.libraryR.position.x = Room.size.x * r;
        this.libraryR.position.z = -Room.size.z * r;
        
        this.hall.position.x = Room.size.x * 2 * (this.camera.position.x > 0 ? 1 : -1);
        this.hall.position.z = Room.size.z * 2 * (this.camera.position.z > 0 ? 1 : -1);
    }
    private rebuildLibraryS(){
        this.unitLibraryS.position.x = 0;
        this.unitLibraryS.position.z = 0;

        const d = this.inHalf(Math.PI / -3) ? 1 : -1;
        this.unitHall.position.x = Room.size.x * d;
        this.unitHall.position.z = Room.size.z * d;
        this.hall.position.x = -Room.size.x * d;
        this.hall.position.z = -Room.size.z * d;
        
        this.libraryS.position.x = Room.size.x * 2 * d;
        this.libraryS.position.z = Room.size.z * 2 * d;

        this.libraryR.position.x = Room.size.x * 2 * d;
        this.libraryR.position.z = 0;

        this.unitLibraryR.position.x = 0;
        this.unitLibraryR.position.z = Room.size.z * 2 * d;
    }
    
    private rebuildLibraryR(){
        this.unitLibraryR.position.x = 0;
        this.unitLibraryR.position.z = 0;

        const d = this.inHalf(Math.PI / 3) ? 1 : -1;
        this.unitHall.position.x = -Room.size.x * d;
        this.unitHall.position.z = Room.size.z * d;
        this.hall.position.x = Room.size.x * d;
        this.hall.position.z = -Room.size.z * d;
        
        this.libraryR.position.x = -Room.size.x * 2 * d;
        this.libraryR.position.z = Room.size.z * 2 * d;

        this.libraryS.position.x = -Room.size.x * 2 * d;
        this.libraryS.position.z = 0;

        this.unitLibraryS.position.x = 0;
        this.unitLibraryS.position.z = Room.size.z * 2 * d;
    }
    
}