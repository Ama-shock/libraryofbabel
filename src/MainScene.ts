import {Scene, Fog, HemisphereLight, Vector3, Raycaster} from 'three';
import {Hall, Library, Unit, Room, BookSelector} from './3DObjects';
import { Player } from './Player';
import { BookSource } from './BookSource';
import Dialog from './Dialog';

const r3 = Math.tan(Math.PI / 3.0);
export default class MainScene extends Scene{
    current: Unit<any>;
    unitHall = new Unit(new Hall);
    unitLibraryS = new Unit(new Library).rotateY(Math.PI / 3);
    unitLibraryR = new Unit(new Library).rotateY(Math.PI / -3);
    hall = new Hall();
    libraryS = new Library().rotateY(Math.PI / 3);
    libraryR = new Library().rotateY(Math.PI / -3);
    bookSelectors: BookSelector[];
    openButton: HTMLButtonElement;
    jumpButton: HTMLButtonElement;

    constructor(readonly player: Player, readonly bookSource: BookSource){
        super();
        this.fog = new Fog(0x000000, 6 * r3, 9 * r3);
        
        const ambientLight = new HemisphereLight(0xbbbbbb, 0x888833, 1.0);
        
        this.bookSelectors = [0, 1, 2, 3, 4, 5].map(r=>{
            const selector = new BookSelector();
            selector.rotateY(Math.PI * r / 3);
            this.add(selector);
            return selector;
        });

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

        this.openButton = document.querySelector('#open') as HTMLButtonElement;
        this.jumpButton = document.querySelector('#jump') as HTMLButtonElement;
        this.openButton.onclick = ()=>this.bookOpen();
        this.jumpButton.onclick = async()=>{
            const current = this.bookSource.page.toString();
            const dialog = Dialog.instance;
            dialog.message = `ページ ${current}/640`;
            dialog.value = current;
            dialog.type = 'number';
            const page = parseInt((await dialog.open()) || '');
            if(page) this.bookSource.page = page;
        };

        player.intoScene(this, new Vector3(0, 4, -2 * r3));
    }

    render(){
        const prev = this.player.position.clone();
        this.player.update(next=>this.reposition(prev, next));
        this.bookSelect();
        this.rebuild();
        this.player.render();
    }

    getEnableShelfs(){
        const l = this.bookSelectors;
        if(this.current == this.unitLibraryS) return [l[0], l[2], l[3], l[5]];
        if(this.current == this.unitLibraryR) return [l[0], l[1], l[3], l[4]];
        return [];
    }
    selectedShelf?: BookSelector;
    bookSelect(){
        if(this.player.touching){
            this.bookClear();
            this.selectedShelf = this.getEnableShelfs().find(selector=>{
                return selector.select(this.player) > -1;
            });
            if(this.selectedShelf) this.openButton.textContent = 'Open';
        }

        if(!this.selectedShelf) return -1;
        this.selectedShelf.update();
        return this.selectedShelf.selectedId;
    }
    bookClear(){
        this.selectedShelf && this.selectedShelf.clear();
        this.openButton.textContent = null;
    }
    bookOpen(){
        if(this.bookSource.isOpened){
            this.bookSource.close();
            this.openButton.textContent = 'Open';
            this.jumpButton.textContent = null;
            return;
        }
        if(this.selectedShelf){
            const shelfNo = this.getEnableShelfs().indexOf(this.selectedShelf);
            this.bookSource.openBook(shelfNo, this.selectedShelf.selectedId);
            this.openButton.textContent = 'Close';
            this.jumpButton.textContent = 'Jump Page';
        }
    }

    isAboveCarpet(pos: Vector3){
        return this.unitHall.base.isAboveCarpet(pos) ||
            this.unitLibraryS.base.isAboveCarpet(pos) ||
            this.unitLibraryR.base.isAboveCarpet(pos) ||
            this.hall.isAboveCarpet(pos);
    }

    isAboveStair(pos: Vector3){
        return this.current == this.unitHall && this.unitHall.base.isAboveStair(pos);
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
        if(!this.isAboveCarpet(next)) return prev;

        if(next.x*next.x + next.z*next.z > 7*7){
            this.selectedShelf && this.selectedShelf.clear();
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
        return next;
    }

    moveRoom(z: number, x:number, y:number){
        this.bookSource.moveRoom(z, x, y);
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