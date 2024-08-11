const {
	TextEncoder,
	TextDecoder,
} = require('fastestsmallesttextencoderdecoder');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
