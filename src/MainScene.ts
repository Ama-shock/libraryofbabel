import {Scene, Fog, HemisphereLight, Vector3, Raycaster} from 'three';
import {Hall, Library, Unit, Room} from './3DObjects';
import { Player } from './Player';

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

const r3 = Math.tan(Math.PI / 3.0);
export default class MainScene extends Scene{
    current: Unit<any>;
    unitHall = new Unit(new Hall);
    unitLibraryS = new Unit(new Library).rotateY(Math.PI / 3);
    unitLibraryR = new Unit(new Library).rotateY(Math.PI / -3);
    hall = new Hall();
    libraryS = new Library().rotateY(Math.PI / 3);
    libraryR = new Library().rotateY(Math.PI / -3);

    constructor(readonly player: Player){
        super();
        this.fog = new Fog(0x000000, 6 * r3, 9 * r3);
        
        const ambientLight = new HemisphereLight(0xbbbbbb, 0x888833, 1.0);
        
        this.add(
            ambientLight,
            this.unitHall,
            this.unitLibraryS,
            this.unitLibraryR,
            this.hall,
            this.libraryS,
            this.libraryR
        );
        this.current = this.unitHall;

        player.intoScene(this, new Vector3(0, 4, -2 * r3));
    }

    render(){
        clear();
        const prev = this.player.position.clone();
        this.player.update(next=>this.reposition(prev, next));
        
        this.rebuild();

        echo(this.roomNo);
        this.player.render();
    }

    isAboveCarpet(pos: Vector3){
        return this.unitHall.base.isAboveCarpet(pos) ||
        this.unitLibraryS.base.isAboveCarpet(pos) ||
        this.unitLibraryR.base.isAboveCarpet(pos) ||
        this.hall.isAboveCarpet(pos) ||
        this.libraryS.isAboveCarpet(pos) ||
        this.libraryR.isAboveCarpet(pos);
    }

    isAboveStair(pos: Vector3){
        return this.unitHall.base.isAboveStair(pos);
    }

    height(pos: Vector3){
        return this.isAboveCarpet(pos) ? 0 : Hall.stairHeight(pos);
    }

    enterable(prev: Vector3, next: Vector3){
        if(!this.isAboveCarpet(next) && !this.isAboveStair(next)) return false;
        if(this.isAboveStair(prev) && this.isAboveStair(next)) return true;
        const p = this.isAboveCarpet(prev) ? 0 : Hall.stairHeight(prev);
        const n = this.isAboveCarpet(next) ? 0 : Hall.stairHeight(next);
        return !p && !n;
    }
    
    reposition(prev: Vector3, next: Vector3){
        if(this.isAboveStair(prev)){
            if(this.isAboveCarpet(next)) return Hall.stairHeight(prev) ? prev : next;
            next.y = Hall.stairHeight(next) +4;
            if(!this.isAboveStair(next)) return prev;
            if(next.y - prev.y > 8) this.moveRoom(0,0,-1);
            if(next.y - prev.y < -8) this.moveRoom(0,0,1);
            return next;
        }

        if(this.isAboveStair(next)) return Hall.stairHeight(next) ? prev : next;

        if(next.x*next.x + next.z*next.z > 7*7){
            next.x += next.x > 0 ? -Room.size.x : Room.size.x;
            next.z += next.z > 0 ? -Room.size.z : Room.size.z;
            switch(this.current){
                case this.unitHall:
                if(next.x > 0){
                    if(next.z > 0){
                        this.current = this.unitLibraryS;
                    }else{
                        this.current = this.unitLibraryR;
                        this.moveRoom(1, 0, 0);
                    }
                }else{
                    if(next.z > 0){
                        this.current = this.unitLibraryR;
                        this.moveRoom(0, 1, 0);
                    }else{
                        this.current = this.unitLibraryS;
                        this.moveRoom(1, 1, 0);
                    }
                }
                break;

                case this.unitLibraryS:
                if(next.x > 0) this.moveRoom(-1, -1, 0);
                this.current = this.unitHall;
                break;

                case this.unitLibraryR:
                if(next.x > 0) this.moveRoom(0, -1, 0);
                else this.moveRoom(-1, 0, 0);
                this.current = this.unitHall;
                break;
            }
        }

        return this.isAboveCarpet(next) ? next : prev;
    }

    roomNo = [0,0,0];
    moveRoom(z: number, x:number, y:number){
        this.roomNo[0] += z;
        this.roomNo[1] += x;
        this.roomNo[2] += y;
    }

    rebuild(){
        switch(this.current){
            case this.unitHall: return this.rebuildHall();
            case this.unitLibraryS: return this.rebuildLibraryS();
            case this.unitLibraryR: return this.rebuildLibraryR();
        }
    }
    
    inHalf(shift: number = 0){
        return (this.player.theta - shift + Math.PI * 2) % (Math.PI * 2) < Math.PI;
    }
    private rebuildHall(){
        this.unitHall.position.set(0, 0, 0);

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
        
        this.hall.position.x = Room.size.x * 2 * (this.player.position.x > 0 ? 1 : -1);
        this.hall.position.z = Room.size.z * 2 * (this.player.position.z > 0 ? 1 : -1);
    }
    private rebuildLibraryS(){
        this.unitLibraryS.position.set(0, 0, 0);

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
        this.unitLibraryR.position.set(0, 0, 0);

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