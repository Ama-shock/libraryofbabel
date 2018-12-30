import {Matrix4, Object3D, Geometry, BoxGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshLambertMaterial, PointLight, MeshBasicMaterial, Group} from 'three';
import {wood, cloth, paper} from './textures';

const r3 = Math.tan(Math.PI / 3.0);
export class HexGeometry extends Geometry{
    constructor(part: Geometry, rotates: number[] = [0, 1, 2, 3, 4, 5]){
        super();
        rotates.forEach(i =>{
            const trans = new Matrix4().makeRotationY(Math.PI * i / 3.0);
            this.merge(part, trans);
        });
    }
}

export class FloorGeometry extends HexGeometry{
    constructor(){
        let part = new BoxGeometry(6, 0.5, 1.5 * r3);
        part.translate(0, -0.251, -2.25 * r3);
        [0, 2, 5, 7].forEach(i =>part.vertices[i].x /= 2);
        super(part);
    }
}

export class CarpetGeometry extends HexGeometry{
    constructor(){
        let part = new PlaneGeometry(6, 1.3 * r3);
        part.vertices[2].x = -1.7;
        part.vertices[3].x = 1.7;
        part.rotateX(Math.PI / -2.0);
        part.translate(0, 0, -2.35 * r3);
        super(part);
    }
}

export class HandrailGeometry extends HexGeometry{
    constructor(){
        let part = new Geometry();
        const bar = new CylinderGeometry(0.1, 0.1, 3.0);
        bar.rotateZ(Math.PI / 2.0);
        bar.translate(0, 1, -1.6 * r3);
        part.merge(bar);
        
        const pillar = new CylinderGeometry(0.1, 0.1, 1.0).translate(0, 0.5, -1.6 * r3);
        [-3, -2, -1, 0, 1, 2, 3].forEach(i =>{
            part.merge(pillar, new Matrix4().makeTranslation(i * 0.5, 0, 0));
        });
        super(part);
    }
}

export class BookShelfGeometry extends Geometry{
    constructor(){
        super();
        const z = -3 * r3;
        const base = new BoxGeometry(6, 0.6, 1);
        this.merge(base, new Matrix4().makeTranslation(0, 0.3, z - 0.5));
        this.merge(base, new Matrix4().makeTranslation(0, 8.8, z - 0.5));

        const inner = new BoxGeometry(6, 8, 0.1);
        this.merge(inner, new Matrix4().makeTranslation(0, 4.5, z - 1));

        const wall = new BoxGeometry(1/3, 8, 1);
        this.merge(wall, new Matrix4().makeTranslation(-3 + 1/6, 4.5, z - 0.5));
        this.merge(wall, new Matrix4().makeTranslation(3 - 1/6, 4.5, z - 0.5));

        const particle = new BoxGeometry(6, 0.2, 0.9);
        for(let i = 0; i < 7; i++){
            this.merge(particle, new Matrix4().makeTranslation(0, i + 1.5, z - 0.6));
        }
    }

}

export class BooksGeometry extends Geometry{
    pages: Geometry;
    constructor(){
        super();
        let [cover, page] = this.createBookGeo();
        this.pages = new Geometry();
        for(let x = 0; x < 32; x++){
            for(let y = 0; y < 8; y++){
                const trans = new Matrix4().makeTranslation(-3 + 5/12 + x/6, 0.95 + y, 0);
                this.merge(cover, trans);
                this.pages.merge(page, trans);
            }
        }
    }

    private createBookGeo(){
        const z = -3 * r3 - 0.5;
        const page = new BoxGeometry(0.14, 0.68, 0.48).translate(0, 0, z);
        
        const cover = new Geometry();
        const back = new BoxGeometry(0.06, 0.7, 0.01).translate(0, 0, 0.26);
        cover.merge(back);
        cover.merge(back, new Matrix4().makeRotationY(-0.2));
        cover.merge(back, new Matrix4().makeRotationY(0.2));

        const front = new BoxGeometry(0.01, 0.7, 0.5);
        cover.merge(front, new Matrix4().makeTranslation(-0.075, 0, 0));
        cover.merge(front, new Matrix4().makeTranslation(0.075, 0, 0));
        cover.translate(0, 0, z);
        return [cover, page];
    }
}

export class StairGeometry extends Geometry{
    constructor(){
        super();
        this.merge(new CylinderGeometry(0.2, 0.2, 9.5).translate(0, 4.25, 0));
        const pillar = new CylinderGeometry(0.12, 0.12, 9).translate(0, 4.5, -1.6 * r3);
        const pillars = new Geometry();
        [1, 2, 3, 4].forEach(i =>{
            pillars.merge(pillar, new Matrix4().makeTranslation(i * 3 / 4 -1.5, 0, 0));
        });

        const floor = new BoxGeometry(0.8, 0.5, 1.6 * r3).translate(-1.2, -0.25, -0.8 * r3);
        const steps = new Geometry();
        [0, 1, 2, 3].forEach(i=>{
            const f = floor.clone().translate(i * 0.8, 0, 0);
            [0, 2, 5, 7].forEach(i =>f.vertices[i].x = 0);
            this.merge(f);
            steps.merge(f, new Matrix4().makeTranslation(0, i * 0.5 - 2, 0));
        });
        
        [1, 2, 3, 4, 5].forEach(r =>{
            this.merge(steps.translate(0, 2, 0), new Matrix4().makeRotationY(-Math.PI * r / 3));
            this.merge(pillars, new Matrix4().makeRotationY(Math.PI * r / 3));
        });
    }
}

export class Lamp extends Object3D{
    static readonly distance = 5.8;
    static readonly height = 6;

    constructor(){
        super();
        const body = new CylinderGeometry(0.25, 0, 0.25).translate(0, -0.125, 0);
        body.merge(new CylinderGeometry(0, 0.25, 0.25).translate(0, 0.125, 0));
        body.translate(Lamp.distance/2, Lamp.height, r3 * Lamp.distance/2);
        const material = new MeshBasicMaterial({color: 0xffffbb, opacity: 0.2});
        this.add(new Mesh(body, material));
    }

    illuminate(){
        const light = new PointLight(0xFFFFFF, 1, 1, 1.0);
        light.translateX(Lamp.distance/2).translateY(Lamp.height).translateZ(r3 * Lamp.distance/2);
        this.add(light);
    }
}

export abstract class Room extends Object3D{
    static readonly size = {x: 9 + r3, y: 9.5, z: 3 * r3 +1};
    abstract setup(): void;

    woodGeo = new Geometry();
    clothGeo = new Geometry();
    paperGeo = new Geometry();
    constructor(){
        super();
        this.woodGeo.merge(new FloorGeometry());
        this.clothGeo.merge(new CarpetGeometry());
        this.setup();
        this.add(
            new Mesh(this.woodGeo, wood),
            new Mesh(this.clothGeo, cloth),
            new Mesh(this.paperGeo, paper)
        );
        this.setLamp();
    }

    lamps: Lamp[] = [];
    setLamp(rotates: number[] = [0, 1, 2, 3, 4, 5]){
        this.lamps.forEach(l=>this.remove(l));

        const light = new Lamp();
        this.lamps = rotates.map(i =>{
            const lamp = light.clone().rotateY(Math.PI * i / 3.0);
            this.add(lamp);
            return lamp;
        });
    }

    illuminateLamps(){
        this.lamps.forEach(l=>l.illuminate());
    }
}

export class Hall extends Room{
    setup(){
        this.woodGeo.merge(new StairGeometry());
        
        const wall = new PlaneGeometry(6, 9, 12, 18).translate(0, 4.5, -3 * r3);
        this.paperGeo.merge(wall);
        this.paperGeo.merge(wall, new Matrix4().makeRotationY(Math.PI));
        
        [1, 2, 4, 5].forEach(i => this.setPathGeometry(i));
    }

    setPathGeometry(rotate: number){
        const trans = new Matrix4().makeRotationY(Math.PI * rotate / 3.0);
        const floor = new PlaneGeometry(6, 2).rotateX(Math.PI / -2).translate(0, 0, -3 * r3 -1);
        this.clothGeo.merge(floor, trans);
        
        const cealing = new PlaneGeometry(6, 2).rotateX(Math.PI / 2).translate(0, 9, -3 * r3 -1);
        this.woodGeo.merge(cealing, trans);

        const wall = new PlaneGeometry(2, 9, 8, 18).rotateY(Math.PI / 2).translate(-3, 4.5, -3 * r3 -1);
        const wall2 = new PlaneGeometry(2, 9, 8, 18).rotateY(Math.PI / -2).translate(3, 4.5, -3 * r3 -1);
        this.paperGeo.merge(wall, trans);
        this.paperGeo.merge(wall2, trans);
    }

}

export class Library extends Room{
    setup(){
        this.woodGeo.merge(new HandrailGeometry());
        
        const rotates = [1, 2, 4, 5];
        this.woodGeo.merge(new HexGeometry(new BookShelfGeometry(), rotates));
        
        const books = new BooksGeometry();
        const coverMesh = new Mesh(new HexGeometry(books, rotates), new MeshLambertMaterial({color: 0x4c6cb3}));
        const pageMesh = new Mesh(new HexGeometry(books.pages, rotates), new MeshLambertMaterial({color: 0xffffff}));
        this.add(coverMesh, pageMesh);
    }

}

export class Unit extends Group{
    base: Library|Hall;
    constructor(private Type: typeof Library|typeof Hall){
        super();
        this.base = new Type();
        this.add(this.base);
        this.add(this.base.clone().translateY(-Room.size.y));
        this.add(this.base.clone().translateY(Room.size.y));
    }
}

export class UnitBase extends Unit{
    constructor(Type: typeof Library|typeof Hall){
        super(Type);
        this.base.illuminateLamps();
    }

    lat: number = 0;
    lon: number = 0;
    update(theta: number, phi: number){
        const lon = Math.cos(phi);
        this.lon = lon;
    }
}
export class HallBase extends Group{

    update(theta: number, phi: number){

    }
}

export class LibraryBase extends Group{
    constructor(){
        super();
        this.add(new Library());
        const lib = new Library();
        this.add(lib.clone().translateZ(-Room.size.z).translateX(Room.size.x).rotateY(Math.PI / -3.0));
        this.add(lib.translateZ(Room.size.z).translateX(Room.size.x).rotateY(Math.PI / 3.0));
    }
}
