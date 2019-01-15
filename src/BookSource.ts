
import {BigNumberEncoder} from './BigNumberEncoder';

export class BookSource{
    private raw: BigNumberEncoder[][];
    readonly domElement: HTMLDivElement;
    readonly leftPage: HTMLDivElement;
    readonly rightPage: HTMLDivElement;

    constructor(readonly letterSet: string){
        if(letterSet.length != 64) throw new Error('Invalid number of letter set.');
        this.raw = [];
        for(let i = 0; i < 160; i++){
            const row: BigNumberEncoder[] = [];
            this.raw.push(row);
            for(let j = 0; j < 160; j++){
                const enc = new BigNumberEncoder(107, 5);
                enc.setRandom();
                row.push(enc);
            }
        }
        this.raw[0][0][0] = 0;
        this.raw[0][0][1] &= 0xfc;
        
        this.domElement = document.querySelector('#book') as HTMLDivElement;
        this.leftPage = this.domElement.querySelector('[page="left"]') as HTMLDivElement;
        this.rightPage = this.domElement.querySelector('[page="right"]') as HTMLDivElement;

        this.leftPage.addEventListener('click', ev=>this.page -= 2);
        this.rightPage.addEventListener('click', ev=>this.page += 2);
    }

    add(x: number, y: number, shift: number, value: number){
        if(!this.raw[x][y].add(value, shift)) return;
        y++;
        if(y == 160){
            x++;
            y = 0;
        }
        if(x == 160){
            x = 0;
        }
        this.raw[x][y].add(1);
    }

    moveRoom(z: number, x:number, y:number){
        z && this.add(0, 0, 1, z * 4);
        x && this.add(0, 1, 0, x);
        y && this.add(1, 0, 0, y);
    }

    private ca: BigNumberEncoder[][] = [[], []];
    openBook(shelfNo: number, bookNo:number){
        this.ca = [[], []];
        const enc = new BigNumberEncoder(1280, 5);
        const head = [enc.clone(), enc.clone()];
        for(let r = 0; r < 160; r++){
            head[0][r] = this.raw[r][0][0];
            head[1][r] = this.raw[r][0][1];
        }
        head[0][0] = bookNo;
        head[1][0] &= shelfNo;
        head[0].rsaEncode();
        head[1].rsaEncode();
        
        for(let r = 0; r < 160; r++){
            this.ca[0][r] = enc.clone();
            this.ca[1][r] = enc.clone();
            this.ca[0][r][0] = head[0][r];
            this.ca[1][r][0] = head[1][r];
            for(let c = 1; c < 160; c++){
                this.ca[0][r][c] = this.raw[r][c][0];
                this.ca[1][r][c] = this.raw[r][c][1];
            }
            this.ca[0][r].rsaEncode();
            this.ca[1][r].rsaEncode();
        }
        
        this.domElement.setAttribute('show', '');
        this.page = 1;
    }

    close(){
        this.domElement.removeAttribute('show');
    }

    get isOpened(){
        return this.domElement.hasAttribute('show');
    }

    private _page = 0;
    get page(){return this._page}
    set page(p: number){
        this._page = Math.max(1, Math.min(639, p));
        if(this._page % 2 == 0) this._page--;
        this.setPage(this.leftPage, this._page -1);
        this.setPage(this.rightPage, this._page);
    }

    private setPage(dom: HTMLElement, page: number){
        while(dom.firstChild) dom.firstChild.remove();
        let str = '';
        const r = Math.floor(page / 4);
        const p = (page % 4) * 40;
        for(let c = p; c < p + 40; c++){
            const tmp = this.raw[r][c].clone();
            tmp[0] = this.ca[0][r][c];
            tmp[1] = this.ca[1][r][c];
            tmp.rsaEncode();
            str += tmp.stringMapping64(this.letterSet);
        }
        for(let i = 0; i < str.length; i++){
            const letter = document.createElement('p');
            letter.textContent = str[i];
            dom.appendChild(letter);
        }
        const pageNo = document.createElement('span');
        pageNo.textContent = (page + 1).toString();
        dom.appendChild(pageNo);
    }
    
}