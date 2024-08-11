/**
	@see https://www.rfc-editor.org/rfc/rfc9110
*/

import { ALPHA, DIGIT, DQUOTE, HTAB, SP, VCHAR } from './char.ts';
import * as fc from './fc.ts';
import { _asciiCodes, _chr } from './helpers.ts';
import * as uri from './uri.ts';

/**
	BWS = OWS
	      ; "bad" whitespace
*/
export const BWS = () => fc.oneof(OWS());

/**
	OWS = *( SP / HTAB )
	      ; optional whitespace
*/
export const OWS = () => fc.stringOf(fc.oneof(SP(), HTAB()));

/**
	RWS = 1*( SP / HTAB )
	      ; required whitespace
*/
export const RWS = () => fc.stringOf(fc.oneof(SP(), HTAB()), { minLength: 1 });

/**
	Trailer = [ field-name *( OWS "," OWS field-name ) ]
*/
export const Trailer = () =>
	fc.option(
		fc.stuple(
			field_name(),
			fc.sarray(fc.stuple(OWS(), fc.constant(','), OWS(), field_name())),
		),
	);

/**
	absolute-path = 1*( "/" segment )
*/
export const absolute_path = () =>
	fc.stuple(
		fc.constant('/'),
		fc.sarray(fc.stuple(fc.constant('/'), segment())),
	);

/**
	field-content = field-vchar
	                [ 1*( SP / HTAB / field-vchar ) field-vchar ]
*/
// dprint-ignore
export const field_content = () => fc
	.stuple(
		field_vchar(),
		fc.option(
			fc.stuple(
				fc.stringOf(
					fc.oneof(SP(), HTAB(), field_vchar()),
					{ minLength: 1 }
				),
				field_vchar()
			)
		)
	)

/**
	field-name = token
*/
export const field_name = () => token();

/**
	field-value = *field-content
*/
export const field_value = () => fc.sarray(field_content());

/**
	field-vchar = VCHAR / obs-text
*/
export const field_vchar = () => fc.oneof(VCHAR(), obs_text());

/**
	first-pos = 1*DIGIT
*/
export const first_pos = () => fc.sarray(DIGIT(), { minLength: 1 });

/**
	obs-text = %x80-FF
*/
export const obs_text = () =>
	fc.constantFrom(
		...[...Array.from({ length: 0xff + 1 }).keys()]
			.filter((code) => code >= 0x80 && code <= 0xff)
			.map(_chr),
	);

/**
	qdtext = HTAB / SP / "!" / %x23-5B ; '#'-'['
	       / %x5D-7E ; ']'-'~'
	       / obs-text
*/
export const qdtext = () =>
	fc.oneof(
		HTAB(),
		SP(),
		fc.constant('!'),
		fc.constantFrom(
			..._asciiCodes.filter((code) => code >= 0x23 && code <= 0x5b).map(_chr),
		),
		fc.constantFrom(
			..._asciiCodes.filter((code) => code >= 0x5d && code <= 0x7e).map(_chr),
		),
		obs_text(),
	);

/**
	query = <query, see [URI], Section 3.4>
*/
export const query = uri.query();

/**
	quoted-pair = "\" ( HTAB / SP / VCHAR / obs-text )
*/
export const quoted_pair = () =>
	fc.stuple(fc.constant('\\'), fc.oneof(HTAB(), SP(), VCHAR(), obs_text()));

/**
	quoted-string = DQUOTE *( qdtext / quoted-pair ) DQUOTE
*/
export const quoted_string = () =>
	fc.stuple(DQUOTE(), fc.array(fc.oneof(qdtext(), quoted_pair())), DQUOTE());

/**
	qvalue = ( "0" [ "." 0*3DIGIT ] )
	       / ( "1" [ "." 0*3("0") ] )
*/
export const qvalue = () =>
	fc.oneof(
		fc.stuple(
			fc.constant('0'),
			fc.option(
				fc.stuple(fc.constant('.'), fc.stringOf(DIGIT(), { maxLength: 3 })),
			),
		),
		fc.stuple(
			fc.constant('1'),
			fc.option(
				fc.stuple(
					fc.constant('.'),
					fc.stringOf(fc.constant('0'), { maxLength: 3 }),
				),
			),
		),
	);

/**
	second = 2DIGIT
*/
export const second = () =>
	fc.stringOf(DIGIT(), { minLength: 2, maxLength: 2 });

/**
	segment = <segment, see [URI], Section 3.3>
*/
const segment = () => uri.segment();

/**
	subtype = token
*/
export const subtype = () => token();

/**
	suffix-length = 1*DIGIT
*/
export const suffix_length = () => fc.stringOf(DIGIT(), { minLength: 1 });

/**
	suffix-range = "-" suffix-length
*/
export const suffix_range = () => fc.stuple(fc.constant('-'), suffix_length());

/**
	tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+"
	      / "-" / "." / "^" / "_" / "`" / "|" / "~"
	      / DIGIT / ALPHA
	      ; any VCHAR, except delimiters
*/
export const tchar = () =>
	fc.oneof(
		fc.constant('\u0021'),
		fc.constant('\u0023'),
		fc.constant('\u0024'),
		fc.constant('\u0025'),
		fc.constant('\u0026'),
		fc.constant('\u0027'),
		fc.constant('\u002A'),
		fc.constant('\u002B'),
		fc.constant('\u002D'),
		fc.constant('\u002E'),
		fc.constant('\u005E'),
		fc.constant('\u005F'),
		fc.constant('\u0060'),
		fc.constant('\u007C'),
		fc.constant('\u007E'),
		DIGIT(),
		ALPHA(),
	);

/**
	token = 1*tchar
*/
export const token = () => fc.stringOf(tchar(), { minLength: 1 });

/**
	token68 = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" )
	          *"="
*/
export const token68 = () =>
	fc.stuple(
		fc.stringOf(
			fc.oneof(
				ALPHA(),
				DIGIT(),
				fc.constant('-'),
				fc.constant('.'),
				fc.constant('_'),
				fc.constant('~'),
				fc.constant('+'),
				fc.constant('/'),
			),
			{ minLength: 1 },
		),
		fc.sarray(fc.constant('=')),
	);

/**
	transfer-coding = token *( OWS ";" OWS transfer-parameter )
*/
export const transfer_coding = ({
	chunked,
}: {
	chunked: fc.Arbitrary<boolean>;
}) =>
	chunked.chain((chunked) =>
		fc.stuple(
			chunked ? fc.constant('chunked') : token(),
			fc.sarray(
				fc.stuple(OWS(), fc.constant(';'), OWS(), transfer_parameter()),
			),
		)
	);

/**
	transfer-parameter = token BWS "=" BWS ( token / quoted-string )
*/
export const transfer_parameter = () =>
	fc.stuple(
		token(),
		BWS(),
		fc.constant('='),
		BWS(),
		fc.oneof(token(), quoted_string()),
	);

/**
	weight = OWS ";" OWS "q=" qvalue
*/
export const weight = () =>
	fc.stuple(OWS(), fc.constant(';'), OWS(), fc.constant('q='), qvalue());

/**
	year = 4DIGIT
*/
export const year = () => fc.stringOf(DIGIT(), { minLength: 4, maxLength: 4 });
