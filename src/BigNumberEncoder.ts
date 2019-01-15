export class BigNumberEncoder extends Uint8Array{
	private readonly topMask: number;
	constructor(readonly digit: number, readonly exp: number){
		super(Math.ceil(digit / 8));
		this.topMask = (1 << (this.digit % 8 || 8)) -1;
	}
	
	clone(){
		const clone = new BigNumberEncoder(this.digit, this.exp);
		clone.set(this);
		return clone;
	}
	
	setRandom(){
		crypto.getRandomValues(this);
		this[this.length - 1] = this[this.length - 1] & this.topMask;
	}

	add(value: number, shift: number = 0): boolean{
		if(value < 0) return this.sub(-value, shift);
		let overflowed = false;
		while(value > 0xff){
			overflowed = overflowed || this.add(value & 0xff, shift);
			shift++;
			value >>= 8;
		}
		const added = this[shift] + value;
		if(shift + 1 < this.length && added > 0xff){
			this[shift] = added & 0xff;
			return overflowed || this.add(1, shift + 1);
		}
		
		if(shift + 1 == this.length){
			this[shift] = added & this.topMask;
			return overflowed || added > this.topMask;
		}

		this[shift] = added;
		return overflowed;
	}

	sub(value: number, shift: number = 0): boolean{
		if(value < 0) return this.add(-value, shift);
		let overflowed = false;
		while(value > 0xff){
			overflowed = overflowed || this.sub(value & 0xff, shift);
			shift++;
			value >>= 8;
		}

		const subbed = this[shift] - value;
		if(subbed < 0){
			if(shift + 1 < this.length){
				this[shift] = subbed + 0x100;
				return overflowed || this.sub(1, shift + 1);
			}

			this[shift] = subbed + this.topMask + 1;
			return true;
		}
		
		this[shift] = subbed;
		return overflowed;
	}

	rsaEncode(){
		this.powerModulo(this.exp);
		return this;
	}
	
	stringMapping64(map: string){
		if(map.length != 64) throw Error('invalid map length.');
		let str = '';
		let val = 0;
		let dig = 0;
		for(let pos = 0; pos < this.length; pos++){
			val += this[pos] << dig;
			str += map[val & 63];
			dig += 2;
			val = this[pos] >> (8 - dig);
			if(dig == 6){
				str += map[val & 63];
				dig = 0;
				val = 0;
			}
		}
		return str;
	}
	
	addModulo(ar: ArrayLike<number>){
		for(let i = 0; i < ar.length; i++){
			if(this.add(i, ar[i])) this.addModulo([2]);
		}
	}
	
	shiftModulo(num: number){
		for(;num--;){
			let topBit = 0;
			let newByte = 0;
			for(let i = 0; i < this.length; i++){
				newByte = (this[i] << 1 & 0xff) | topBit;
				topBit = this[i] >>> 7;
				this[i] = newByte;
			}
			
			if(topBit || newByte > this.topMask){
				this[this.length -1] = newByte & this.topMask;
				this.addModulo([2]);
			}
		}
	}
	
	multiModulo(value: ArrayLike<number>){
		const src = new BigNumberEncoder(this.digit, this.exp);
		for(let i = 0; i < value.length; i++)for(let bit = 0; bit < 8; bit++){
			if(value[i] & (1 << bit)) src.addModulo(this);
			this.shiftModulo(1);
		}
		this.set(src);
	}
	
	powerModulo(exp: number){
		const src = new Uint8Array(this);
		for(;--exp;) this.multiModulo(src);
	}
};
