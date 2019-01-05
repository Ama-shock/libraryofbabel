import { PerspectiveCamera, WebGLRenderer, Scene, Vector3, Clock, PointLight, Vector2, Raycaster, Object3D, Mesh } from "three";
const r3 = Math.tan(Math.PI / 3.0);

export class Player extends PerspectiveCamera{
    readonly clock = new Clock();
    readonly renderer: WebGLRenderer;
    readonly light: PointLight;
    scene?: Scene;

    constructor(renderer: WebGLRenderer){
        super(45, renderer.getSize().width / renderer.getSize().height, 0.1, 12 * r3);
        this.renderer = renderer;
        this.light = new PointLight(0xFFFFFF, 1, 8, 0.5);

        this.setEvent();
    }

    private setEvent(){
        const el = this.renderer.domElement;
        el.addEventListener('contextmenu', ev=>this.onTouch(ev));
        el.addEventListener('mousedown', ev=>this.onTouch(ev));
        el.addEventListener('touchstart', ev=>this.onTouch(ev));
        el.addEventListener('mousemove', ev=>this.onMove(ev));
        el.addEventListener('touchmove', ev=>this.onMove(ev));
        document.addEventListener('mouseup', ev=>this.onLeave(ev));
        document.addEventListener('touchend', ev=>this.onLeave(ev));
        document.addEventListener('touchcancel', ev=>this.onLeave(ev));
    }

    touching: boolean = false;
    control = new Vector2(0, 0);
    private onTouch(ev: TouchEvent|MouseEvent){
		ev.preventDefault();
        ev.stopPropagation();
        this.touching = true;
        this.onMove(ev);
    }
    private onMove(ev: TouchEvent|MouseEvent){
        const pos = (ev instanceof TouchEvent) ? ev.touches[0] : ev;
        const el = this.renderer.domElement;
        this.control.x = (pos.pageX - el.offsetLeft) / el.offsetWidth *2 -1;
        this.control.y = -(pos.pageY - el.offsetTop) / el.offsetHeight *2 +1;
    }
    private onLeave(ev: TouchEvent|MouseEvent){
		ev.preventDefault();
		ev.stopPropagation();
        this.touching = false;
    }
    
    lookSpeed = 1;
    movementSpeed = 5;
    theta = 0;
    phi = 0;
    direct(delta: number){
        if(this.control.x < -0.6) this.theta -= this.lookSpeed * delta;
        if(this.control.x > 0.6) this.theta += this.lookSpeed * delta;
        this.theta %= Math.PI * 2;
        if(this.theta < 0) this.theta += Math.PI * 2;

        if(this.control.y < -0.6) this.phi -= this.lookSpeed * delta;
        if(this.control.y > 0.6) this.phi += this.lookSpeed * delta;
        this.phi = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, this.phi));
    }

    next(delta: number){
        this.direct(delta);
        const pos = this.position.clone();
        if(
            -0.8 < this.control.x && this.control.x < 0.8 &&
            -0.8 < this.control.y && this.control.y < 0.8
        ){
            pos.x += Math.cos(this.theta) * this.movementSpeed * delta;
            pos.z += Math.sin(this.theta) * this.movementSpeed * delta;
        }
        return pos;
    }

    move(pos: Vector3){
        this.position.set(pos.x, pos.y, pos.z);
        this.light.position.set(this.position.x, this.position.y, this.position.z);
        return this;
    }

    look(lookTo: {theta?: number, phi?: number} = {}){
        if('theta' in lookTo) this.theta = lookTo.theta!;
        if('phi' in lookTo) this.theta = lookTo.phi!;
        this.lookAt(new Vector3(
		    this.position.x + 100 * Math.cos(this.theta) * Math.cos(this.phi),
		    this.position.y + 100 * Math.sin(this.phi),
		    this.position.z + 100 * Math.sin(this.theta) * Math.cos(this.phi)
        ));
        return this;
    }
    
    update(repos?: (next: Vector3)=>Vector3){
        const delta = this.clock.getDelta();
        if(!this.touching) return;
        let next = this.next(delta);
        if(repos) next = repos(next);
        return this.move(next).look();
    }

    intoScene(scene: Scene, pos: Vector3, lookTo?: {theta?: number, phi?: number}){
        if(this.scene) this.scene.remove(this.light);
        this.move(pos);
        this.scene = scene;
        this.scene.add(this.light);
        this.look(lookTo);
    }

    render(){
        if(!this.scene) return;
        this.renderer.render(this.scene, this);
    }

    
    private caster = new Raycaster();
    cast(list: Object3D[]){
        this.caster.setFromCamera(this.control, this);
        const intersects = this.caster.intersectObjects(list);
        return intersects[0] && intersects[0].object;
    }
}