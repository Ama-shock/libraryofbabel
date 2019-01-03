import { PerspectiveCamera, WebGLRenderer, Scene, Vector3, Clock, PointLight } from "three";
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

    private moving: boolean = false;
    private control = {x: 0, y: 0};
    private onTouch(ev: TouchEvent|MouseEvent){
		ev.preventDefault();
        ev.stopPropagation();
        this.moving = true;
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
        this.moving = false;
    }
    
    lookSpeed = 1;
    movementSpeed = 5;
    theta = 0;
    phi = 0;
    move(){
        const delta = this.clock.getDelta();
        if(this.moving){
            if(this.control.x < -0.6) this.theta -= this.lookSpeed * delta;
            if(this.control.x > 0.6) this.theta += this.lookSpeed * delta;
            this.theta %= Math.PI * 2;
            if(this.theta < 0) this.theta += Math.PI * 2;

            if(this.control.y < -0.6) this.phi -= this.lookSpeed * delta;
            if(this.control.y > 0.6) this.phi += this.lookSpeed * delta;
            this.phi = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, this.phi));

            if(
                -0.8 < this.control.x && this.control.x < 0.8 &&
                -0.8 < this.control.y && this.control.y < 0.8
            ){
                this.position.x += Math.cos(this.theta) * this.movementSpeed * delta;
                this.position.z += Math.sin(this.theta) * this.movementSpeed * delta;
            }
        }
        
        const target = new Vector3();
		target.x = this.position.x + 100 * Math.cos(this.theta) * Math.cos(this.phi);
		target.z = this.position.z + 100 * Math.sin(this.theta) * Math.cos(this.phi);
		target.y = this.position.y + 100 * Math.sin(this.phi);

		this.lookAt(target);
    }

    intoScene(scene: Scene, pos: Vector3, lookAt?: {theta: number, phi: number}){
        if(this.scene) this.scene.remove(this.light);
        this.position.set(pos.x, pos.y, pos.z);
        if(lookAt){
            this.theta = lookAt.theta;
            this.phi = lookAt.phi;
        }
        this.scene = scene;
        this.scene.add(this.light);
        this.move();
    }

    render(){
        if(!this.scene) return;
        this.light.position.set(this.position.x, this.position.y, this.position.z);
        this.renderer.render(this.scene, this);
    }
}