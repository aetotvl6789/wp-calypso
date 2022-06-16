/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */
import { select, dispatch } from '@wordpress/data';
import { register } from '..';

let store: ReturnType< typeof register >;

beforeAll( () => {
	store = register();
} );

describe( 'selectors', () => {
	it( 'resolves the state via an API call', async () => {
		const data = { message: 'test' };

		expect( select( store ).getStepData() ).toEqual( null );

		dispatch( store ).setStepData( data );
		expect( select( store ).getStepData() ).toEqual( data );

		dispatch( store ).clearStepData();
		expect( select( store ).getStepData() ).toEqual( null );
	} );
} );
