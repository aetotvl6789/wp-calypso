/**
 * @group calypso-release
 */

import {
	DataHelper,
	MeSidebarComponent,
	NavbarComponent,
	SecretsManager,
	TestAccount,
	TOTPClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: TOTP' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async () => {
		const totpClient = new TOTPClient(
			SecretsManager.secrets.testAccounts.totpUser.totpKey as string
		);
		await totpClient.getToken();

		page = await browser.newPage();
	} );

	it( 'Authenticate as user with TOTP 2FA code', async function () {
		testAccount = new TestAccount( 'totpUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to /me', async function () {
		const navbarComponent = new NavbarComponent( page );
		await navbarComponent.clickMe();
	} );

	it( 'Log out', async function () {
		const meSidebarComponent = new MeSidebarComponent( page );
		await meSidebarComponent.clickLogout();
	} );
} );
