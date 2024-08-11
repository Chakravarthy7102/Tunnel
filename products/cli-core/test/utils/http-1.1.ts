/* eslint-disable unicorn/no-object-as-default-parameter -- TODO */

/**
	@see https://www.rfc-editor.org/rfc/rfc9112
*/

import { CRLF, DIGIT, HTAB, OCTET, SP, VCHAR } from './char.ts';
import * as fc from './fc.ts';
import * as http from './http.ts';
import * as uri from './uri.ts';

/**
	BWS = <BWS, see [HTTP], Section 5.6.3>
*/
const BWS = http.BWS;

/**
	HTTP-message = start-line CRLF *( field-line CRLF ) CRLF [ message-body ]
*/
export const HTTP_message = ({
	chunked,
	bodyChunkSize,
	numTrailers,
}: {
	chunked: fc.Arbitrary<boolean>;
	bodyChunkSize: fc.Arbitrary<number>;
	numTrailers: fc.Arbitrary<number>;
}) =>
	chunked.chain((chunked) => {
		if (chunked) {
			return fc.stuple(
				start_line(),
				CRLF(),
				fc.sarray(fc.stuple(field_line(), CRLF())),
				fc.stuple(
					field_line({
						fieldName: fc.mixedCase(fc.constant('transfer-encoding')),
						fieldValue: Transfer_Encoding({ chunked: fc.constant(true) }),
					}),
					CRLF(),
				),
				fc.sarray(fc.stuple(field_line(), CRLF())),
				CRLF(),
				chunked_body({ chunkSize: bodyChunkSize, numTrailers }),
			);
		} else {
			const nonTransferChunkedHeaders = fc.sarray(
				fc.stuple(
					// Make sure the header isn't transfer encoding
					field_line({
						fieldName: field_name().filter(
							(name) => name !== 'transfer-encoding',
						),
					}),
					CRLF(),
				),
			);
			return fc.stuple(
				start_line(),
				CRLF(),
				nonTransferChunkedHeaders,
				// We should also test with a transfer-encoding header that's not chunked
				fc.option(
					fc.stuple(
						field_line({
							fieldName: fc.mixedCase(fc.constant('transfer-encoding')),
							fieldValue: Transfer_Encoding({ chunked: fc.constant(true) }),
						}),
						CRLF(),
					),
				),
				nonTransferChunkedHeaders,
				CRLF(),
				fc.option(message_body()),
			);
		}
	});

/**
	HTTP-name = %x48.54.54.50 ; HTTP
*/
export const HTTP_name = () => fc.constant('HTTP');

/**
	HTTP-version = HTTP-name "/" DIGIT "." DIGIT
*/
export const HTTP_version = () =>
	fc.stuple(HTTP_name(), fc.constant('/'), DIGIT(), fc.constant('.'), DIGIT());

/**
	OWS = <OWS, see [HTTP], Section 5.6.3>
*/
const OWS = http.OWS;

/**
	RWS = <RWS, see [HTTP], Section 5.6.3>
*/
const RWS = http.RWS;

/**
	Transfer-Encoding = [ transfer-coding *( OWS "," OWS transfer-coding ) ]
*/
export const Transfer_Encoding = ({
	chunked,
}: {
	chunked: fc.Arbitrary<boolean>;
}) => {
	const tCodingsList = ({ chunked }: { chunked: fc.Arbitrary<boolean> }) =>
		fc.sarray(
			fc.stuple(OWS(), fc.constant(','), OWS(), transfer_coding({ chunked })),
		);

	return chunked.chain((chunked) => {
		if (chunked) {
			return fc.stuple(
				// There could be random transfer codings before
				fc.option(
					fc.stuple(
						transfer_coding({ chunked: fc.boolean() }),
						tCodingsList({ chunked: fc.boolean() }),
					),
				),
				// But at least one of the transfer encodings has to be chunked
				fc.stuple(fc.option(transfer_coding({ chunked: fc.constant(true) }))),
				// There could be random transfer codings after
				tCodingsList({ chunked: fc.boolean() }),
			);
		} else {
			return fc.option(
				fc.stuple(
					transfer_coding({ chunked: fc.constant(false) }),
					tCodingsList({ chunked: fc.constant(false) }),
				),
				{ nil: '' },
			);
		}
	});
};

/**
	absolute-URI = <absolute-URI, see [URI], Section 4.3>
*/
const absolute_URI = () => uri.absolute_URI();

/**
	absolute-form = absolute-URI
*/
export const absolute_form = () => absolute_URI();

/**
	absolute-path = <absolute-path, see [HTTP], Section 4.1>
*/
const absolute_path = () => http.absolute_path();

/**
	asterisk-form = "*"
*/
export const asterisk_form = () => fc.constant('*');

/**
	authority = <authority, see [URI], Section 3.2>
*/
export const authority = () => uri.authority();

/**
	authority-form = uri-host ":" port
*/
export const authority_form = () =>
	fc.stuple(uri_host(), fc.constant(':'), port());

/**
	chunk = chunk-size [ chunk-ext ] CRLF chunk-data CRLF
*/
export const chunk = ({ chunkSize }: { chunkSize: fc.Arbitrary<number> }) =>
	chunkSize
		.filter((chunkSize) => chunkSize > 0)
		.chain((chunkSize) =>
			fc.stuple(
				fc.constant(chunkSize.toString(16)),
				fc.option(chunk_ext()),
				CRLF(),
				chunk_data({ chunkSize }),
				CRLF(),
			)
		);

/**
	chunk-data = 1*OCTET
*/
export const chunk_data = ({ chunkSize }: { chunkSize: number }) =>
	fc.sarray(OCTET(), { minLength: chunkSize, maxLength: chunkSize });

/**
	chunk-ext = *( BWS ";" BWS chunk-ext-name [ BWS "=" BWS chunk-ext-val ] )
*/
export const chunk_ext = () =>
	fc.sarray(
		fc.stuple(
			BWS(),
			fc.constant(';'),
			BWS(),
			chunk_ext_name(),
			fc.option(fc.stuple(BWS(), fc.constant('='), BWS(), chunk_ext_val())),
		),
	);

/**
	chunk-ext-name = token
*/
export const chunk_ext_name = () => token();

/**
	chunk-ext-val = token / quoted-string
*/
export const chunk_ext_val = () => fc.oneof(token(), quoted_string());

/**
	chunk-size = 1*HEXDIG
*/
export const chunk_size = () => fc.hexa();

/**
	chunked-body = *chunk last-chunk trailer-section CRLF
*/
export const chunked_body = ({
	chunkSize,
	numTrailers,
}: {
	chunkSize: fc.Arbitrary<number>;
	numTrailers: fc.Arbitrary<number>;
}) =>
	fc.stuple(
		fc.sarray(chunk({ chunkSize })),
		last_chunk(),
		trailer_section({ numTrailers }),
		CRLF(),
	);

/**
	field-line = field-name ":" OWS field-value OWS
*/
const field_line = (
	{
		fieldName = field_name(),
		fieldValue = field_value(),
	}: {
		fieldName?: fc.Arbitrary<string>;
		fieldValue?: fc.Arbitrary<string>;
	} = { fieldName: field_name(), fieldValue: field_value() },
) => fc.stuple(fieldName, fc.constant(':'), OWS(), fieldValue, OWS());

/**
	field-name = <field-name, see [HTTP], Section 5.1>
*/
const field_name = http.field_name;

/**
	field-value = <field-value, see [HTTP], Section 5.5>
*/
const field_value = http.field_value;

/**
	last-chunk = 1*"0" [ chunk-ext ] CRLF
*/
export const last_chunk = () =>
	fc.stuple(
		fc.stringOf(fc.constant('0'), { minLength: 1 }),
		fc.option(chunk_ext()),
		CRLF(),
	);

/**
	message-body = *OCTET
*/
export const message_body = () => fc.stringOf(OCTET());

/**
	method = token
*/
export const method = () => token();

/**
	obs-fold = OWS CRLF RWS
*/
export const obs_fold = () => fc.stuple(OWS(), CRLF(), RWS());

/**
	obs-text = <obs-text, see [HTTP], Section 5.6.4>
*/
const obs_text = http.obs_text;

/**
	origin-form = absolute-path [ "?" query ]
*/
export const origin_form = () =>
	fc.stuple(absolute_path(), fc.option(fc.stuple(fc.constant('?'), query())));

/**
	port = <port, see [URI], Section 3.2.3>
*/
const port = uri.port;

/**
	query = <query, see [URI], Section 3.4>
*/
const query = uri.query;

/**
	quoted-string = <quoted-string, see [HTTP], Section 5.6.4>
*/
const quoted_string = http.quoted_string;

/**
	reason-phrase = 1*( HTAB / SP / VCHAR / obs-text )
*/
export const reason_phrase = () =>
	fc.stringOf(fc.oneof(HTAB(), SP(), VCHAR(), obs_text()), { minLength: 1 });

/**
	request-line = method SP request-target SP HTTP-version
*/
export const request_line = () =>
	fc.stuple(method(), SP(), request_target(), SP(), HTTP_version());

/**
	request-target = origin-form / absolute-form / authority-form / asterisk-form
*/
export const request_target = () =>
	fc.oneof(origin_form(), absolute_form(), authority_form(), asterisk_form());

export const start_line = () => fc.oneof(request_line(), status_line());

/**
	status-code = 3DIGIT
*/
export const status_code = () =>
	fc.stringOf(DIGIT(), { minLength: 3, maxLength: 3 });

/**
	status-line = HTTP-version SP status-code SP [ reason-phrase ]
*/
export const status_line = () =>
	fc.stuple(
		HTTP_version(),
		SP(),
		status_code(),
		SP(),
		fc.option(reason_phrase()),
	);

/**
	token = <token, see [HTTP], Section 5.6.2>
*/
const token = http.token;

/**
	trailer-section = *( field-line CRLF )
*/
export const trailer_section = ({
	numTrailers,
}: {
	numTrailers: fc.Arbitrary<number>;
}) =>
	numTrailers.chain((numTrailers) =>
		fc.sarray(fc.stuple(field_line(), CRLF()), {
			minLength: numTrailers,
			maxLength: numTrailers,
		})
	);

const transfer_coding = http.transfer_coding;

const uri_host = uri.host;
