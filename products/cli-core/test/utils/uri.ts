/**
	@see https://www.rfc-editor.org/rfc/rfc3986
*/

import { ALPHA, DIGIT, HEXDIG } from './char.ts';
import * as fc from './fc.ts';
import { _chr } from './helpers.ts';

/**
	URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
*/
export const URI = () =>
	fc.stuple(
		scheme(),
		fc.constant(':'),
		hier_part(),
		fc.option(query().map((q) => `?${q}`)),
		fc.option(fragment().map((f) => `#${f}`)),
	);

/**
	hier-part = "//" authority path-abempty
	          / path-absolute
	          / path-rootless
	          / path-empty
*/
export const hier_part = () =>
	fc.oneof(
		fc.stuple(fc.constant('//'), authority(), path_abempty()),
		path_absolute(),
		path_rootless(),
		path_empty(),
	);

/**
	URI-reference = URI / relative-ref
*/
export const URI_reference = () => fc.oneof(URI(), relative_ref());

/**
	absolute-URI = scheme ":" hier-part [ "?" query ]
*/
export const absolute_URI = () =>
	fc.stuple(
		scheme(),
		fc.constant(':'),
		hier_part(),
		fc.option(query().map((q) => `?${q}`)),
	);

/**
	relative-ref = relative-part [ "?" query ] [ "#" fragment ]
*/
export const relative_ref = () =>
	fc.stuple(
		relative_part(),
		query().map((q) => `?${q}`),
		fragment().map((f) => `#${f}`),
	);

/**
	relative-part = "//" authority path-abempty
	              / path-absolute
	              / path-rootless
	              / path-empty
*/
export const relative_part = () =>
	fc.oneof(
		fc.stuple(fc.constant('//'), authority(), path_abempty()),
		path_absolute(),
		path_rootless(),
		path_empty(),
	);

/**
	scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
*/
export const scheme = () =>
	fc.stuple(
		ALPHA(),
		fc.sarray(
			fc.oneof(
				ALPHA(),
				DIGIT(),
				fc.constant('+'),
				fc.constant('-'),
				fc.constant('.'),
			),
		),
	);

/**
	authority = [ userinfo "@" ] host [ ":" port ]
*/
export const authority = () =>
	fc.stuple(
		fc.option(userinfo().map((ui) => `${ui}@`)),
		host(),
		fc.option(port().map((p) => `:${p}`)),
	);

/**
	userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
*/
export const userinfo = () =>
	fc.sarray(
		fc.oneof(unreserved(), pct_encoded(), sub_delims(), fc.constant(':')),
	);

/**
	host = IP-literal / IPv4address / reg-name
*/
export const host = () => fc.oneof(IP_literal(), IPv4address(), reg_name());

/**
	port = *DIGIT
*/
export const port = () => fc.sarray(DIGIT());

/**
	IP-literal = "[" ( IPv6address / IPvFuture  ) "]"
*/
export const IP_literal = () =>
	fc.stuple(
		fc.constant('['),
		fc.oneof(IPv6address(), IPvFuture()),
		fc.constant(']'),
	);

/**
	IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
*/
export const IPvFuture = () =>
	fc.stuple(
		fc.constant('v'),
		fc.sarray(HEXDIG(), { minLength: 1 }),
		fc.constant('.'),
		fc.sarray(fc.oneof(unreserved(), sub_delims(), fc.constant(':'))),
	);

/**
	IPv6address =                            6( h16 ":" ) ls32
	            /                       "::" 5( h16 ":" ) ls32
	            / [               h16 ] "::" 4( h16 ":" ) ls32
	            / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
	            / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
	            / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
	            / [ *4( h16 ":" ) h16 ] "::"              ls32
	            / [ *5( h16 ":" ) h16 ] "::"              h16
	            / [ *6( h16 ":" ) h16 ] "::"
*/
// dprint-ignore
export const IPv6address = () => fc.ipV6()

/**
	h16 = 1*4HEXDIG
*/
export const h16 = () => fc.sarray(HEXDIG(), { minLength: 1, maxLength: 4 });

/**
	ls32 = ( h16 ":" h16 ) / IPv4address
*/
export const ls32 = () =>
	fc.oneof(fc.stuple(h16(), fc.constant(':'), h16()), IPv4address());

/**
	IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
*/
export const IPv4address = () => fc.ipV4();

/**
	dec-octet = DIGIT                 ; 0-9
	          / %x31-39 DIGIT         ; 10-99
	          / "1" 2DIGIT            ; 100-199
	          / "2" %x30-34 DIGIT     ; 200-249
	          / "25" %x30-35          ; 250-255
*/
export const dec_octet = () =>
	fc.oneof(
		DIGIT(),
		fc.stuple(fc.integer({ min: 0x31, max: 0x39 }).map(_chr), DIGIT()),
		fc.stuple(fc.constant('1'), DIGIT(), DIGIT()),
		fc.stuple(
			fc.constant('2'),
			fc.integer({ min: 0x30, max: 0x34 }).map(_chr),
			DIGIT(),
		),
		fc.stuple(
			fc.constant('25'),
			fc.integer({ min: 0x30, max: 0x35 }).map(_chr),
		),
	);

/**
	reg-name = *( unreserved / pct-encoded / sub-delims )
*/
export const reg_name = () =>
	fc.sarray(fc.oneof(unreserved(), pct_encoded(), sub_delims()));

/**
	path = path-abempty    ; begins with "/" or is empty
	     / path-absolute   ; begins with "/" but not "//"
	     / path-noscheme   ; begins with a non-colon segment
	     / path-rootless   ; begins with a segment
	     / path-empty      ; zero characters
*/
export const path = () =>
	fc.oneof(
		path_abempty(),
		path_absolute(),
		path_noscheme(),
		path_rootless(),
		path_empty(),
	);

/**
	path-abempty  = *( "/" segment )
*/
export const path_abempty = () =>
	fc.sarray(fc.stuple(fc.constant('/'), segment()));

/**
	path-absolute = "/" [ segment-nz *( "/" segment ) ]
*/
export const path_absolute = () =>
	fc.stuple(
		fc.constant('/'),
		fc.option(fc.stuple(segment_nz(), fc.array(segment().map((s) => `/${s}`)))),
	);

/**
	path-noscheme = segment-nz-nc *( "/" segment )
*/
export const path_noscheme = () =>
	fc.stuple(segment_nz_nc(), fc.sarray(segment().map((s) => `/${s}`)));

/**
	path-rootless = segment-nz *( "/" segment )
*/
export const path_rootless = () =>
	fc.stuple(segment_nz(), fc.sarray(segment().map((s) => `/${s}`)));

/**
	path-empty    = 0<pchar>
*/
export const path_empty = () => fc.constant('');

/**
	segment = *pchar
*/
export const segment = () => fc.sarray(pchar());

/**
	segment-nz = 1*pchar
*/
export const segment_nz = () => fc.sarray(pchar(), { minLength: 1 });

/**
	segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
	              ; non-zero-length segment without any colon ":"
*/
export const segment_nz_nc = () =>
	fc.sarray(
		fc.stuple(unreserved(), pct_encoded(), sub_delims(), fc.constant('@')),
		{ minLength: 1 },
	);

/**
	pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
*/
export const pchar = () =>
	fc.oneof(
		unreserved(),
		pct_encoded(),
		sub_delims(),
		fc.constant(':'),
		fc.constant('@'),
	);

/**
	query = *( pchar / "/" / "?" )
*/
export const query = () =>
	fc.sarray(fc.oneof(pchar(), fc.constant('/'), fc.constant('?')));

/**
	fragment = *( pchar / "/" / "?" )
*/
export const fragment = () =>
	fc.sarray(fc.oneof(pchar(), fc.constant('/'), fc.constant('?')));

/**
	pct-encoded = "%" HEXDIG HEXDIG
*/
export const pct_encoded = () =>
	fc.stuple(fc.constant('%'), HEXDIG(), HEXDIG());

/**
	unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
*/
export const unreserved = () =>
	fc.oneof(
		ALPHA(),
		DIGIT(),
		fc.constant('-'),
		fc.constant('.'),
		fc.constant('_'),
		fc.constant('~'),
	);

/**
	reserved = gen-delims / sub-delims
*/
export const reserved = () => fc.oneof(gen_delims(), sub_delims());

/**
	gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"
*/
export const gen_delims = () =>
	fc.oneof(
		fc.constant(':'),
		fc.constant('/'),
		fc.constant('?'),
		fc.constant('#'),
		fc.constant('['),
		fc.constant(']'),
		fc.constant('@'),
	);

/**
	sub-delims = "!" / "$" / "&" / "'" / "(" / ")"
	           / "*" / "+" / "," / ";" / "="
*/
export const sub_delims = () =>
	fc.oneof(
		fc.constant('!'),
		fc.constant('$'),
		fc.constant('&'),
		fc.constant("'"),
		fc.constant('('),
		fc.constant(')'),
		fc.constant('*'),
		fc.constant('+'),
		fc.constant(','),
		fc.constant(';'),
		fc.constant('='),
	);
