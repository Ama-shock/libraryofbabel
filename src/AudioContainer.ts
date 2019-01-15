
type UrlList = {[key: string]: string|URL};
type BufferList<L> = {[K in keyof L]: Promise<AudioBuffer>};
type PlayList<L> = {[K in keyof L]?: Promise<AudioBufferSourceNode>};

export default class AudioContainer<L extends UrlList> {
    private readonly bufferList: BufferList<L>;
    private readonly playList: PlayList<L>;
    private readonly context: AudioContext;

    constructor(readonly urlList: L){
        this.context = new AudioContext();
        let buffers = {} as BufferList<L>;
        for(let key in urlList){
            buffers[key] = this.loadAudioBuffer(urlList[key]);
        }
        this.bufferList = buffers;
        this.playList = {};
    }

    private async loadAudioBuffer(url: string|URL): Promise<AudioBuffer> {
        let path = url instanceof URL ? url.href : url;
        let response = await fetch(path);
        let arrBuf = await response.arrayBuffer();
        return this.context.decodeAudioData(arrBuf);
    }

    private source(buff: AudioBuffer): AudioBufferSourceNode{
        let src = this.context.createBufferSource();
        src.buffer = buff;
        src.connect(this.context.destination);
        return src;
    }

    private async loop(key: keyof L): Promise<AudioBufferSourceNode>{
        let buff = await this.bufferList[key];
        let src = this.source(buff);
        src.loop = true;
        src.start(0);
        return src;
    }

    async once(key: keyof L): Promise<Event>{
        let buff = await this.bufferList[key];
        return new Promise<Event>(res=>{
            let src = this.source(buff);
            src.onended = res;
            src.start(0);
        });
    }
    
    async play(key: keyof L): Promise<boolean>{
        if(this.playList[key]) return false;
        let p = this.loop(key);
        this.playList[key] = p;
        return !!await p;
    }

    async stop(key: keyof L): Promise<boolean>{
        let p = this.playList[key] as Promise<AudioBufferSourceNode>;
        if(!p) return false;
        delete this.playList[key];
        let n = await p;
        n.stop();
        return true;
    }
}