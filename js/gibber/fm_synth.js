Gibber.FMPresets = {
	gong : {
		cmRatio : 1.4,
		index	: .95,
		attack	: 1,
		decay	: 5000,
	},
	drum : {
		cmRatio : 1.4,
		index	: 2,
		attack	: 1,
		decay	: 1000,
	},
	brass : {
		cmRatio : 1 / 1.0007,
		index	: 5,
		attack	: 100,
		decay	: 100,
	},
};

// TODO: modulator should use same amplitude envelope as the carrier, would probably require a custom generate method.
// or, if you keep them separate, expand envelope capabilities to be more advanced

function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that = Synth("sine");
	that.name = "FM";
	
	if(typeof arguments[0] === "string") {	// if a preset
		var preset = Gibber.FMPresets[arguments[0]];
		that.cmRatio 	= preset.cmRatio;
		that.index 		= preset.index;
		that.attack 	= preset.attack;
		that.decay 		= preset.decay;
	}else{
		that.cmRatio 	= isNaN(cmRatio) ? 2 : cmRatio;
		that.index = isNaN(index)	 ? .9 : index;
		that.attack = isNaN(attack) ? 100 : attack;
		that.decay = isNaN(decay) ? 100 : decay;
	}
	

	modFreq = that.osc.frequency * that.cmRatio;
	modAmp = that.index * that.osc.frequency;
	
	that.modulator = Sine(modFreq, modAmp);
	Gibber.genRemove(that.modulator);

	shouldUseModulatorEnvelope = (typeof shouldUseModulatorEnvelope === "undefined") ? true : shouldUseModulatorEnvelope;
	
	if(shouldUseModulatorEnvelope) {
		//that.modulator.env = Env(that.attack, that.decay);
		//that.modulator.mod("mix", that.modulator.env, "*");
	}
	
	that.mod = function(_name, _source, _type) {
		var name = (typeof Gibber.shorthands[_name] !== "undefined") ? Gibber.shorthands[_name] : _name;
		var type = (typeof _type !== "undefined") ? Gibber.automationModes[_type] : 'addition';
		
		if(typeof _source.mods === "undefined") {
			_source.mods = [];
		}
			
		_source.store = {};
		_source.modded.push(this);
		_source.param = name;
		_source.name = _name;
		_source.type = type;
			
		this.mods.push(_source);			
			
		Gibber.genRemove(_source);
		return this;
	};
	
	//that.mod("frequency", that.modulator, "+");
	/*
	note : function(n) {
		switch(typeof n) {
			case "number" :
				this.osc.frequency = n;
			break;
			case "string" :
				this.osc.frequency = teoria.note(n).fq();
			break;
			default:
				this.osc.frequency = n.fq();
				break;
		}
		this.env.triggerGate();
	},
	*/
	that.note = function(n) {
		var oscFreq;
		switch(typeof n) {
			case "number" :
				oscFreq = n;
			break;
			case "string" :
				oscFreq = teoria.note(n).fq();
			break;
			default:
				oscFreq = n.fq();
				break;
		}
		
		//console.log("cmRatio = " + this.cmRatio + " : index = " + this.index);
		this.osc.frequency = oscFreq;
		this.modulator.frequency = oscFreq * this.cmRatio;
		this.modulator.mix = oscFreq * this.index;
		//console.log("freq = " + this.modulator.frequency + " : mix = " + this.modulator.mix);
		
		this.env.triggerGate();
		//this.modulator.env.triggerGate();
	};
	
	that.generate = function() {
		var envValue = this.env.generate();
		
		var modValue = this.modulator.out() * envValue;
		var freqStore = this.osc.frequency;
		
		this.osc.frequency += modValue;
		this.value = this.osc.out();
		
		this.osc.frequency = freqStore;
		
		this.value *= envValue;
	};
	
	
	(function() {
	    var mix = that.mix;
		var fx  = that.osc.fx;
		
	    Object.defineProperties(that, {
			"mix" : {
		        get: function() {
		            return mix;
		        },
		        set: function(value) {
		            mix = value;
					this.osc.mix = value;
		        }
			},
			"fx" : {
				get : function() {
					return this.osc.fx;
				},
				set : function(_fx) {
					this.osc.fx = _fx;
				}
			},
		})
	})();
	
	
	return that;
};

/*(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){


function FMSynth(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	this.name = "FM";
	
	this.osc = Osc([440, .1, "sine"], true);
	this.env = Env();
	
	//Gibber.generators.push(this.osc);
	//this.osc.mod("mix", this.env, "*");
	
	
	
	// if(typeof arguments[0] === "string") {	// if a preset
	// 	var preset = Gibber.FMPresets[arguments[0]];
	// 	this.cmRatio 	= preset.cmRatio;
	// 	this.index 		= preset.index;
	// 	this.attack 	= preset.attack;
	// 	this.decay 		= preset.decay;
	// }else{
	// 	this.cmRatio 	= isNaN(cmRatio) ? 2 : cmRatio;
	// 	this.index = isNaN(index)	 ? .9 : index;
	// 	this.attack = isNaN(attack) ? 100 : attack;
	// 	this.decay = isNaN(decay) ? 100 : decay;
	// }
	// 
	// 	console.log("1");
	// modFreq = this.osc.frequency * this.cmRatio;
	// modAmp = this.index * this.osc.frequency;
	// 
	// 	console.log("2");
	// this.modulator = Sine();
	// //Gibber.genRemove(this.modulator);
	// 	console.log("3");
	// shouldUseModulatorEnvelope = (typeof shouldUseModulatorEnvelope === "undefined") ? true : shouldUseModulatorEnvelope;
	// 
	// if(shouldUseModulatorEnvelope) {
	// 	this.modulator.env = Env(this.attack, this.decay);
	// 	this.modulator.mod("mix", this.modulator.env, "*");
	// }
	// 	
	// 		console.log("4");
	// this.osc.mod("freq", this.modulator, "+");
	// 
	// this.note = function(n) {
	// 	var oscFreq = (typeof n === "string") ? Note.getFrequencyForNotation(n) : n;
	// 	this.osc.frequency = oscFreq;
	// 	this.modulator.frequency = oscFreq * this.cmRatio;
	// 	this.modulator.mix = oscFreq * this.index;
	// 	
	// 	this.env.triggerGate();
	// 	this.modulator.env.triggerGate();
	// 	console.log("NOTE");
	// };
	
	(function(obj) {
		var that = obj;
	    var mix = that.mix;
		var fx  = that.osc.fx;
		
	    Object.defineProperties(that, {
			"mix" : {
		        get: function() {
		            return mix;
		        },
		        set: function(value) {
		            mix = value;
					this.osc.mix = value;
		        }
			},
			"fx" : {
				get : function() {
					return this.osc.fx;
				},
				set : function(_fx) {
					this.osc.fx = _fx;
				}
			},
		})
	})(this);	
};

FMSynth.prototype.__proto__ = Synth();

FMSynth.prototype.FMPresets = {
	gong : {
		cmRatio : 1.4,
		index	: .95,
		attack	: 1,
		decay	: 5000,
	},
	drum : {
		cmRatio : 1.4,
		index	: 2,
		attack	: 1,
		decay	: 1000,
	},
	brass : {
		cmRatio : 1 / 1.0007,
		index	: 5,
		attack	: 100,
		decay	: 100,
	},
};


audioLib.generators('FMSynth', FMSynth);

audioLib.FMSynth =audioLib.generators.FMSynth;
 
}(audioLib));
audioLib.plugins('FMSynth', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
	exports.init = initPlugin;
} else {
	initPlugin(audioLib);
}

}());

function FM (waveform, volume) {
	var s = new audioLib.FMSynth(waveform, volume);
	return s;
}

*/