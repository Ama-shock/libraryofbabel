import {Object3D, BoxGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshLambertMaterial, PointLight} from 'three';
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
        this.add(new Mesh(carpet, cloth));

        const floor = new BoxGeometry(6, 0.5, 1.5 * r3);
        floor.translate(0, -0.251, -2.25 * r3);
        [0, 2, 5, 7].forEach(i =>floor.vertices[i].x /= 2);
        this.add(new Mesh(floor, wood));
    }
}

export class Handrail extends Object3D{
    constructor(){
        super();

        const bar = new CylinderGeometry(0.1, 0.1, 3.0);
        bar.rotateZ(Math.PI / 2.0);
        bar.translate(0, 1, -1.6 * r3);
        this.add(new Mesh(bar, wood));
        
        const pillar = new Mesh(new CylinderGeometry(0.1, 0.1, 1.0).translate(0, 0.5, -1.6 * r3), wood);
        this.add(pillar);
        [-3, -2, -1, 1, 2, 3].forEach(i =>{
            this.add(pillar.clone().translateX(i * 0.5));
        });
    }
}

export class Library extends Object3D{
    constructor(){
        super();
        const floor = new Floor();
        const rail = new Handrail();
        this.add(floor, rail);
        [1, 2, 3, 4, 5].forEach(i =>{
            this.add(
                floor.clone().rotateY(Math.PI * i / 3.0),
                rail.clone().rotateY(Math.PI * i / 3.0)
            );
        });

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
        
        const base = new BoxGeometry(6, 0.6, 1);
        base.translate(0, 0.3, -3 * r3 - 0.5);
        this.add(new Mesh(base, wood));
        const top = base.clone().translate(0, 8.5, 0);
        this.add(new Mesh(top, wood));

        const inner = new BoxGeometry(6, 8, 0.1);
        inner.translate(0, 4.5, -3 * r3 - 1);
        this.add(new Mesh(inner, wood));

        const wall = new BoxGeometry(1/3, 8, 1);
        wall.translate(-3 + 1/6, 4.5, -3 * r3 - 0.5);
        this.add(new Mesh(wall, wood));
        const wall2 = wall.clone().translate(6 -1/3, 0, 0);
        this.add(new Mesh(wall2, wood));

        const particle = new BoxGeometry(6, 0.2, 0.9);
        particle.translate(0, 1.5, -3 * r3 - 0.6);
        this.add(new Mesh(particle, wood));
        [1, 2, 3, 4, 5, 6].forEach(i =>{
            const p = particle.clone().translate(0, i, 0);
            this.add(new Mesh(p, wood));
        });
        
        this.fill();
    }

    fill(){
        for(let x = 0; x < 32; x++){
            for(let y = 0; y < 8; y++){
                const book = this.getBook();
                book.translateX(-3 + 5/12 + x/6);
                book.translateY(0.95 + y);
                this.add(book);
            }
        }
    }

    private book?: Object3D;
    getBook(){
        if(!this.book){
            this.book = new Object3D();
            
            const pages = new BoxGeometry(0.14, 0.68, 0.48);
            this.book.add(new Mesh(pages, new MeshLambertMaterial({color: 0xffffff})));
            
            const coverColor = new MeshLambertMaterial({color: 0x4c6cb3});
            const back = new Mesh(
                new BoxGeometry(0.06, 0.7, 0.01).translate(0, 0, 0.26),
                coverColor);
    
            const cover = new Mesh(
                new BoxGeometry(0.01, 0.7, 0.5).translate(-0.075, 0, 0),
                coverColor);

            this.book.add(
                back.clone().rotateY(-0.2),
                back.clone().rotateY(0.2),
                back,
                cover.clone(),
                cover.translateX(0.15)
            );

            this.book.translateZ(-3 * r3 - 0.5);
        }

        const book = this.book.clone();
        return book;
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
        this.add(new Mesh(new CylinderGeometry(0.2, 0.2, 9.5).translate(0, 4.25, 0), wood));
        const pillar = new Mesh(new CylinderGeometry(0.12, 0.12, 9).translate(0, 4.5, -1.6 * r3), wood);
        const pillars = new Object3D();
        [1, 2, 3, 4].forEach(i =>{
            pillars.add(pillar.clone().translateX(i * 3 / 4 -1.5));
        });

        const floor = new BoxGeometry(0.8, 0.5, 1.6 * r3).translate(-1.2, -0.25, -0.8 * r3);
        const steps = [0, 1, 2, 3].map(i=>{
            const f = floor.clone().translate(i * 0.8, 0, 0);
            [0, 2, 5, 7].forEach(i =>f.vertices[i].x = 0);
            const m = new Mesh(f, wood);
            this.add(m);
            return m;
        });
        
        [1, 2, 3, 4, 5].forEach(r =>{
            steps.forEach((step, s)=>{
                this.add(step.clone().rotateY(-Math.PI * r / 3).translateY(s*0.5 + r*2 - 2));
            });
            this.add(pillars.clone().rotateY(Math.PI * r / 3));
        });
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
