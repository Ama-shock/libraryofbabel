
export default class Dialog{
    private static _instance?: Dialog;
    static get instance(){
        if(!this._instance){
            this._instance = new Dialog();
        }
        return this._instance;
    }

    readonly dom: HTMLElement;
    private constructor(){
        this.dom = document.querySelector('#dialog') as HTMLElement;
        if(!this.dom) throw new Error('Cannot get Dialog dom.');

        const ok = this.dom.querySelector('#ok') as HTMLButtonElement;
        ok.addEventListener('click', ()=>this.exit(this.value));
        const cancel = this.dom.querySelector('#cancel') as HTMLButtonElement;
        cancel.addEventListener('click', ()=>this.exit(null));
    }

    get message(){
        const p = this.dom.querySelector('p')!;
        return p.textContent;
    }
    set message(msg: string|null){
        const p = this.dom.querySelector('p')!;
        p.textContent = msg;
    }
    
    get type(){
        const input = this.dom.querySelector('input')!;
        return input.type;
    }
    set type(type: string){
        const input = this.dom.querySelector('input')!;
        input.type = type;
    }
    
    get value(){
        const input = this.dom.querySelector('input')!;
        return input.value;
    }
    set value(value: string){
        const input = this.dom.querySelector('input')!;
        input.value = value;
    }

    private resolve?: (value:string|null)=>void;
    open(){
        this.dom.setAttribute('show', '');
        return new Promise<string|null>(r=>this.resolve = r);
    }
    private exit(value: string|null){
        this.dom.removeAttribute('show');
        if(!this.resolve) return;
        this.resolve(value);
        delete this.resolve;
    }
}