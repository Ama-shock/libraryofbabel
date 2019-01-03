import {Matrix4, Object3D, Geometry, BoxGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshLambertMaterial, PointLight, MeshBasicMaterial, Group, MeshPhongMaterial, Vector3, Raycaster} from 'three';
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

export class WallGeometry extends Geometry{
    constructor(){
        super();
        this.merge(new PlaneGeometry(6, 3, 12, 6), new Matrix4().makeTranslation(0, 7.5, -3 * r3));
        this.merge(new PlaneGeometry(1.5, 6, 3, 12), new Matrix4().makeTranslation(2.25, 3, -3 * r3));
        this.merge(new PlaneGeometry(1.5, 6, 3, 12), new Matrix4().makeTranslation(-2.25, 3, -3 * r3));
    }
}

export class DoorGeometry extends Geometry{
    constructor(){
        super();
        this.merge(new BoxGeometry(2.54, 5.74, 0.2), new Matrix4().makeTranslation(0, 2.93, -3 * r3));
        this.merge(new BoxGeometry(3.4, 0.4, 0.4), new Matrix4().makeTranslation(0, 6, -3 * r3));

        const pillar = new BoxGeometry(0.4, 5.8, 0.4);
        this.merge(pillar, new Matrix4().makeTranslation(-1.5, 2.9, -3 * r3));
        this.merge(pillar, new Matrix4().makeTranslation(1.5, 2.9, -3 * r3));
    }

    static knob(){
        const geo = new Geometry();

        geo.merge(new CylinderGeometry(0.02, 0.02, 0.5).translate(-1.3, 1.5, -3 * r3 + 0.1));
        geo.merge(new CylinderGeometry(0.02, 0.02, 0.5).translate(-1.3, 5.0, -3 * r3 + 0.1));
        geo.merge(new CylinderGeometry(0.05, 0.05, 0.5).rotateZ(Math.PI / 2).translate(1, 3, -3 * r3 + 0.3));
        geo.merge(new CylinderGeometry(0.03, 0.03, 0.3).rotateX(Math.PI / 2).translate(1.1, 3, -3 * r3 + 0.15));
        geo.merge(new BoxGeometry(0.3, 0.6, 0.05), new Matrix4().makeTranslation(1.1, 2.8, -3 * r3 + 0.125));

        return geo;
    }
}

export class StairGeometry extends Geometry{
    constructor(){
        super();
        const floor = new BoxGeometry(0.85, 0.5, 1.7 * r3).translate(-1.275, -0.25, -0.85 * r3);
        const steps = new Geometry();
        
        [0, 1, 2, 3].forEach(i=>{
            const f = floor.clone().translate(i * 0.85, 0, 0);
            [0, 2, 5, 7].forEach(i =>f.vertices[i].x = 0);
            this.merge(f);
            steps.merge(f, new Matrix4().makeTranslation(0, i * 0.5 - 2, 0));
        });
        
        [1, 2, 3, 4, 5].forEach(r =>{
            this.merge(steps.translate(0, 2, 0), new Matrix4().makeRotationY(-Math.PI * r / 3));
        });
    }

    static pillars(){
        const geo = new Geometry();
        geo.merge(new CylinderGeometry(0.2, 0.2, 9.5).translate(0, 4.25, 0));
        const pillar = new CylinderGeometry(0.12, 0.12, 9).translate(-1.5, 4.5, -1.6 * r3);
        geo.merge(pillar);
        const pillars = new Geometry();
        [0, 1, 2, 3].forEach(i =>{
            pillars.merge(pillar, new Matrix4().makeTranslation(i * 3/4, 0, 0));
        });
        geo.merge(new HexGeometry(pillars, [1, 2, 3, 4, 5]));

        return geo;
    }
    
    static radian(pos: Vector3){
        let rad = Math.atan(pos.z / pos.x);
        if(pos.x < 0) rad += Math.PI;
        rad += Math.PI * 8/3;
        return rad % (Math.PI * 2);
    }

    static height(pos: Vector3){
        const rad = this.radian(pos);
        return rad < Math.PI/3 ? 0 : 9.5 * (rad/Math.PI - 1/3) * 3/5;
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
    paperGeo = new Geometry();
    carpetGeo = new Geometry();
    carpetMesh: Mesh;
    constructor(){
        super();
        this.woodGeo.merge(new FloorGeometry());
        this.carpetGeo.merge(new CarpetGeometry());
        this.setup();
        this.carpetMesh = new Mesh(this.carpetGeo, cloth);
        this.add(
            new Mesh(this.woodGeo, wood),
            new Mesh(this.paperGeo, paper),
            this.carpetMesh
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

    isAboveCarpet(position: Vector3, range: number = 5){
        const ray = new Raycaster(position, new Vector3(0, -1, 0), 0, range);
        const list = ray.intersectObjects([this.carpetMesh]);
        return !!list.find(int=> int.object === this.carpetMesh);
    }
}

export class Hall extends Room{
    stairMesh!: Mesh;
    setup(){
        this.stairMesh = new Mesh(new StairGeometry(), wood);
        this.add(this.stairMesh);
        
        const wall = new WallGeometry();
        this.paperGeo.merge(wall);
        this.paperGeo.merge(wall, new Matrix4().makeRotationY(Math.PI));
        
        this.woodGeo.merge(StairGeometry.pillars());

        const door = new DoorGeometry();
        this.woodGeo.merge(door);
        this.woodGeo.merge(door, new Matrix4().makeRotationY(Math.PI));

        const knob = DoorGeometry.knob();
        knob.merge(knob, new Matrix4().makeRotationY(Math.PI));
        this.add(new Mesh(knob, new MeshPhongMaterial({color: 0xaaaaaa})));

        [1, 2, 4, 5].forEach(i => this.setPathGeometry(i));
    }

    setPathGeometry(rotate: number){
        const trans = new Matrix4().makeRotationY(Math.PI * rotate / 3.0);
        const floor = new PlaneGeometry(6, 2).rotateX(Math.PI / -2).translate(0, 0, -3 * r3 -1);
        this.carpetGeo.merge(floor, trans);
        
        const cealing = new PlaneGeometry(6, 2).rotateX(Math.PI / 2).translate(0, 9, -3 * r3 -1);
        this.woodGeo.merge(cealing, trans);

        const wall = new PlaneGeometry(2, 9, 8, 18).rotateY(Math.PI / 2).translate(-3, 4.5, -3 * r3 -1);
        const wall2 = new PlaneGeometry(2, 9, 8, 18).rotateY(Math.PI / -2).translate(3, 4.5, -3 * r3 -1);
        this.paperGeo.merge(wall, trans);
        this.paperGeo.merge(wall2, trans);
    }
    
    isAboveStair(position: Vector3, range: number = 5){
        const ray = new Raycaster(position, new Vector3(0, -1, 0), 0, range);
        const list = ray.intersectObjects([this.stairMesh]);
        return !!list.find(int=> int.object === this.stairMesh);
    }

    static stairHeight(pos: Vector3){
        return StairGeometry.height(pos);
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

export class Unit<T extends Library|Hall> extends Group{
    constructor(readonly base: T){
        super();
        this.add(this.base);
        this.add(this.base.clone().translateY(-Room.size.y));
        this.add(this.base.clone().translateY(Room.size.y));
        this.base.illuminateLamps();
    }
}

