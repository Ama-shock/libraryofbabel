
export default class MediaRecordHandler{
    private recorder?: MediaRecorder;
    private chunks: Blob[] = [];
    constructor(private period?: number){
        if(!MediaRecorder) throw Error('MediaRecorder is not Supported.');
    }

    private isSupport(type: string){
        return type && MediaRecorder.isTypeSupported(type);
    }

    private _type?: string;
    get type(): string{
        if(this._type) return this._type;
        let data = this.chunks[0];
        if(data && this.isSupport(data.type)) return data.type;
        return 'video/webm';
    }
    set type(type: string){
        if(this.isSupport(type)) this._type = type;
    }

    async record(stream: MediaStream): Promise<void>{
        await this.stop();
        this.recorder = new MediaRecorder(stream);
        this.recorder.addEventListener('dataavailable', ev=>this.chunks.push(ev.data));
        this.recorder.start(this.period);
    }

    async stop(): Promise<void>{
        if(!this.recorder) return;
        const rec = this.recorder;
        delete this.recorder;
        return new Promise<void>(res=>{
            rec.addEventListener('stop', ()=>res());
            rec.stop();
        });
    }

    get data(): Blob{
        return new Blob(this.chunks, {type: this.type});
    }

    async exit(): Promise<Blob>{
        await this.stop();
        let data = this.data;
        this.chunks = [];
        return data;
    }
}