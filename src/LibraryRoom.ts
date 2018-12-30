import {Matrix4, Object3D, Geometry, BoxGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshLambertMaterial, PointLight} from 'three';
import {wood, cloth, paper} from './textures';

const r3 = Math.tan(Math.PI / 3.0);

export class Floor extends Object3D{
    constructor(){
        super();
        const carpet = new PlaneGeometry(6, 1.3 * r3);
        carpet.vertices[2].x = -1.7;
        carpet.vertices[3].x = 1.7;
        carpet.rotateX(Math.PI / -2.0);
        carpet.translate(0, 0, -2.35 * r3);

        const floor = new BoxGeometry(6, 0.5, 1.5 * r3);
        floor.translate(0, -0.251, -2.25 * r3);
        [0, 2, 5, 7].forEach(i =>floor.vertices[i].x /= 2);

        const carpets = new Geometry();
        const floors = new Geometry();
        [0, 1, 2, 3, 4, 5].forEach(i =>{
            const trans = new Matrix4().makeRotationY(Math.PI * i / 3.0);
            carpets.merge(carpet, trans);
            floors.merge(floor, trans);
        });

        this.add(new Mesh(carpets, cloth));
        this.add(new Mesh(floors, wood));
    }
}

export class Handrail extends Object3D{
    constructor(){
        super();

        const rail = new Geometry();
        const bar = new CylinderGeometry(0.1, 0.1, 3.0);
        bar.rotateZ(Math.PI / 2.0);
        bar.translate(0, 1, -1.6 * r3);
        rail.merge(bar);
        
        const pillar = new CylinderGeometry(0.1, 0.1, 1.0).translate(0, 0.5, -1.6 * r3);
        [-3, -2, -1, 0, 1, 2, 3].forEach(i =>{
            rail.merge(pillar, new Matrix4().makeTranslation(i * 0.5, 0, 0));
        });
        
        const geo = new Geometry();
        [0, 1, 2, 3, 4, 5].forEach(i =>{
            const trans = new Matrix4().makeRotationY(Math.PI * i / 3.0);
            geo.merge(rail, trans);
        });
        this.add(new Mesh(geo, wood));
    }
}

export class Library extends Object3D{
    constructor(){
        super();
        const floor = new Floor();
        const rail = new Handrail();
        this.add(floor, rail);

        const shelf = new BookShelf();
        [1, 2, 4, 5].forEach(i =>{
            const p = shelf.clone().rotateY(Math.PI * i / 3.0);
            this.add(p);
        });
    }
}

export class BookShelf extends Object3D{
    constructor(){
        super();
        const z = -3 * r3;
        const geo = new Geometry();
        const base = new BoxGeometry(6, 0.6, 1);
        geo.merge(base, new Matrix4().makeTranslation(0, 0.3, z - 0.5));
        geo.merge(base, new Matrix4().makeTranslation(0, 8.8, z - 0.5));

        const inner = new BoxGeometry(6, 8, 0.1);
        geo.merge(inner, new Matrix4().makeTranslation(0, 4.5, z - 1));

        const wall = new BoxGeometry(1/3, 8, 1);
        geo.merge(wall, new Matrix4().makeTranslation(-3 + 1/6, 4.5, z - 0.5));
        geo.merge(wall, new Matrix4().makeTranslation(3 - 1/6, 4.5, z - 0.5));

        const particle = new BoxGeometry(6, 0.2, 0.9);
        for(let i = 0; i < 7; i++){
            geo.merge(particle, new Matrix4().makeTranslation(0, i + 1.5, z - 0.6));
        }
        
        this.add(new Mesh(geo, wood));
        this.fill();
    }

    fill(){
        let [cover, page] = this.createBookGeo();
        const covers = new Geometry();
        const pages = new Geometry();
        for(let x = 0; x < 32; x++){
            for(let y = 0; y < 8; y++){
                const trans = new Matrix4().makeTranslation(-3 + 5/12 + x/6, 0.95 + y, 0);
                covers.merge(cover, trans);
                pages.merge(page, trans);
            }
        }
        this.add(new Mesh(covers, new MeshLambertMaterial({color: 0x4c6cb3})));
        this.add(new Mesh(pages, new MeshLambertMaterial({color: 0xffffff})));
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


export class Path extends Object3D{
    constructor(){
        super();
        const floor = new PlaneGeometry(6, 2).rotateX(Math.PI / -2).translate(0, 0, -3 * r3 -1);
        this.add(new Mesh(floor, cloth));
        const cealing = new PlaneGeometry(6, 2).rotateX(Math.PI / 2).translate(0, 9, -3 * r3 -1);
        this.add(new Mesh(cealing, wood));

        const wall = new PlaneGeometry(2, 9).rotateY(Math.PI / 2).translate(-3, 4.5, -3 * r3 -1);
        this.add(new Mesh(wall, paper));

        const wall2 = new PlaneGeometry(2, 9).rotateY(Math.PI / -2).translate(3, 4.5, -3 * r3 -1);
        this.add(new Mesh(wall2, paper));

        const light = new PointLight(0xFFFFFF, 1, 4, 1.0).translateY(2).translateZ(-3 * r3 -1);
        this.add(light.clone().translateX(2.8));
        this.add(light.translateX(-2.8));
    }
}

export class Hall extends Object3D{
    constructor(){
        super();
        const part = new Floor();
        [0, 1, 2, 3, 4, 5].forEach(i =>{
            const p = part.clone().rotateY(Math.PI * i / 3.0);
            this.add(p);
        });

        const path = new Path();
        [1, 2, 4, 5].forEach(i =>{
            const p = path.clone().rotateY(Math.PI * i / 3.0);
            this.add(p);
        });

        const wall = new Mesh(new PlaneGeometry(6, 9).translate(0, 4.5, -3 * r3), paper);
        this.add(wall);
        this.add(wall.clone().rotateY(Math.PI));

        this.add(new Stair());
    }
}

export class Stair extends Object3D{
    constructor(){
        super();
        const geo = new Geometry();
        geo.merge(new CylinderGeometry(0.2, 0.2, 9.5).translate(0, 4.25, 0));
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
            geo.merge(f);
            steps.merge(f, new Matrix4().makeTranslation(0, i * 0.5 - 2, 0));
        });
        
        [1, 2, 3, 4, 5].forEach(r =>{
            geo.merge(steps.translate(0, 2, 0), new Matrix4().makeRotationY(-Math.PI * r / 3));
            geo.merge(pillars, new Matrix4().makeRotationY(Math.PI * r / 3));
        });

        this.add(new Mesh(geo, wood));
    }
}

export class Unit extends Object3D{
    constructor(){
        super();
        this.add(new Hall());

        const lib = new Library().translateZ(-3 * r3 -1).translateX(9 + r3).rotateY(Math.PI / -3.0);
        this.add(lib);
        const lib2 = new Library().translateZ(3 * r3 +1).translateX(9 + r3).rotateY(Math.PI / 3.0);
        this.add(lib2);
    }
}
