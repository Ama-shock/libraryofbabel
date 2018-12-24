import {Object3D, BoxGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshBasicMaterial} from 'three';
import {wood, cloth} from './textures';

export class FloorPart extends Object3D{
    constructor(){
        super();
        const r3 = Math.tan(Math.PI / 3.0);
        
        const carpet = new PlaneGeometry(6, 1.3 * r3);
        carpet.vertices[2].x = -1.7;
        carpet.vertices[3].x = 1.7;
        carpet.rotateX(Math.PI / -2.0);
        carpet.translate(0, -0.498, -2.35 * r3);
        this.add(new Mesh(carpet, cloth));

        const floor = new BoxGeometry(6, 0.5, 1.5 * r3);
        floor.translate(0, -0.75, -2.25 * r3);
        [0, 2, 5, 7].forEach(i =>floor.vertices[i].x /= 2);
        this.add(new Mesh(floor, wood));

        const bar = new CylinderGeometry(0.1, 0.1, 3.0);
        bar.rotateZ(Math.PI / 2.0);
        bar.translate(0, 0.5, -1.6 * r3);
        this.add(new Mesh(bar, wood));
        
        const pillar = new CylinderGeometry(0.1, 0.1, 1.0);
        [-3, -2, -1, 0, 1, 2, 3].forEach(i =>{
            const p = pillar.clone();
            p.translate(i * 0.5, 0, -1.6 * r3);
            this.add(new Mesh(p, wood));
        });
    }
}

export class Floor extends Object3D{
    constructor(){
        super();
        const part = new FloorPart();
        this.add(part);
        [1, 2, 3, 4, 5].forEach(i =>{
            const p = part.clone().rotateY(Math.PI * i / 3.0);
            this.add(p);
        });

        const shelf = new BookShelf();
        this.add(shelf);
        [1, 3, 4].forEach(i =>{
            const p = shelf.clone().rotateY(Math.PI * i / 3.0);
            this.add(p);
        });
    }
}

export class BookShelf extends Object3D{
    constructor(){
        super();
        const r3 = Math.tan(Math.PI / 3.0);
        
        const base = new BoxGeometry(6, 0.6, 1);
        base.translate(0, -0.3, -3 * r3 - 0.5);
        this.add(new Mesh(base, wood));
        const top = base.clone().translate(0, 8.6, 0);
        this.add(new Mesh(top, wood));

        const inner = new BoxGeometry(6, 8, 0.1);
        inner.translate(0, 4, -3 * r3 - 1);
        this.add(new Mesh(inner, wood));

        const wall = new BoxGeometry(1/3, 8, 1);
        wall.translate(-3 + 1/6, 4, -3 * r3 - 0.5);
        this.add(new Mesh(wall, wood));
        const wall2 = wall.clone().translate(6 -1/3, 0, 0);
        this.add(new Mesh(wall2, wood));

        const particle = new BoxGeometry(6, 0.2, 0.9);
        particle.translate(0, 1, -3 * r3 - 0.6);
        this.add(new Mesh(particle, wood));
        [1, 2, 3, 4, 5, 6].forEach(i =>{
            const p = particle.clone().translate(0, i, 0);
            this.add(new Mesh(p, wood));
        });
        this.fill();
    }

    fill(){
        const r3 = Math.tan(Math.PI / 3.0);
        for(let x = 0; x < 32; x++){
            for(let y = 0; y < 8; y++){
                const book = this.getBook(this.randomColor(), [
                    -3 + 5/12 + x/6,
                    0.45 + y,
                    -3 * r3 - 0.5
                ]);
                this.add(book);
            }
        }
    }

    randomColor(){
        let col = 0;
        [0,1,2].forEach(num => {
            col *= 256;
            col += Math.floor(Math.random() * 256);
        });
        return col;
    }

    getBook(color: number, tns: [number, number, number]){
        const white = new MeshBasicMaterial({color: 0xffffff});
        const coverColor = new MeshBasicMaterial({color: color});

        const book = new Object3D();
        
        const pages = new BoxGeometry(0.14, 0.68, 0.48);
        pages.translate(tns[0], tns[1], tns[2]);
        book.add(new Mesh(pages, white));
        
        const back = new BoxGeometry(0.16, 0.7, 0.01);
        back.translate(0, 0, 0.245);
        back.translate(tns[0], tns[1], tns[2]);
        book.add(new Mesh(back, coverColor));

        const cover = new BoxGeometry(0.01, 0.7, 0.5);
        cover.translate(-0.075, 0, 0);
        cover.translate(tns[0], tns[1], tns[2]);
        book.add(new Mesh(cover, coverColor));
        const cover2 = cover.clone().translate(0.15, 0, 0);
        book.add(new Mesh(cover2, coverColor));
        return book;
    }
}