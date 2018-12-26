type EventHandler<E extends Event = Event> = ((ev:E)=>void)|null;
type MediaRecorderOptions = {
    mimeType?: string;
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    bitsPerSecond?: number;
};
type RecordingState = "inactive"|"recording"|"paused";

declare type BlobEvent = Event & {data: Blob, timecode: number};
declare class MediaRecorder extends EventTarget{
    static isTypeSupported(type: string):boolean;

    readonly stream: MediaStream;
    readonly mimeType: string;
    readonly state: RecordingState;
    readonly videoBitsPerSecond: number;
    readonly audioBitsPerSecond: number;

    constructor(stream: MediaStream, options?: MediaRecorderOptions);
    
    start: (timeslice?: number)=>void;
    stop: ()=>void;
    pause: ()=>void;
    resume: ()=>void;
    requestData: ()=>void;

    onstart: EventHandler;
    onstop: EventHandler;
    ondataavailable: EventHandler<BlobEvent>;
    onpause: EventHandler;
    onresume: EventHandler;
    onerror: EventHandler<ErrorEvent>;

    addEventListener(type: 'start', listener:EventHandler, options?: EventListenerOptions): void;
    addEventListener(type: 'stop', listener:EventHandler, options?: EventListenerOptions): void;
    addEventListener(type: 'dataavailable', listener:EventHandler<BlobEvent>, options?: EventListenerOptions): void;
    addEventListener(type: 'pause', listener:EventHandler, options?: EventListenerOptions): void;
    addEventListener(type: 'resume', listener:EventHandler, options?: EventListenerOptions): void;
    addEventListener(type: 'error', listener:EventHandler<ErrorEvent>, options?: EventListenerOptions): void;
}