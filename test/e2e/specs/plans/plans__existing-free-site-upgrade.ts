/**
 * @group calypso-pr
 */

import {
	DataHelper,
	CheckoutThankYouPage,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import type { NewSiteResponse } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle(
		'Plans: Upgrade exising WordPress.com Free site to WordPress.com Pro'
	),
	function () {
		const blogName = DataHelper.getBlogName();
		let siteCreatedFlag: boolean;
		let newSiteDetails: NewSiteResponse;
		let restAPIClient: RestAPIClient;
		let page: Page;

		// Pre-hook to set up the test site
		beforeAll( async function () {
			const credentials = DataHelper.getAccountCredential( 'simpleSiteFreePlanUser' );
			restAPIClient = new RestAPIClient( credentials );

			const response = await restAPIClient.createSite( {
				name: blogName,
				title: blogName,
			} );

			console.log( response );
			console.log(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.body.blog_details.site_slug }` )
			);

			if ( ! response.body.success ) {
				throw new Error( `Failed to create new site via REST API.\nHTTP response: ${ response }` );
			}
			newSiteDetails = response;
			siteCreatedFlag = response.body.success;
		} );

		// Pre-hook to authenticate as user
		beforeAll( async function () {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Upgrade to WordPress.com Pro', function () {
			let cartCheckoutPage: CartCheckoutPage;
			let plansPage: PlansPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				console.log( 'switch to site' );
				await page.goto(
					DataHelper.getCalypsoURL( `/plans/${ newSiteDetails.body.blog_details.site_slug }` )
				);
			} );

			it( 'View available plans', async function () {
				plansPage = new PlansPage( page, 'current' );
				await plansPage.showPlanComparison();
			} );

			it( 'Click button to upgrade to WordPress.com Pro', async function () {
				await plansPage.selectPlan( 'Pro' );
			} );

			it( 'WordPress.com Pro is added to cart', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com Pro` );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase();
			} );

			it( 'Enter billing and payment details', async function () {
				await cartCheckoutPage.selectSavedCard( 'End to End Testing' );
			} );

			it( 'View new features', async function () {
				const checkoutThankYouPage = new CheckoutThankYouPage( page );
				await checkoutThankYouPage.clickButton( 'View my new features' );
			} );
		} );

		describe( 'Validate WordPress.com Pro functionality', function () {
			let sidebarComponent: SidebarComponent;

			it( 'Sidebar states user is on WordPress.com Pro plan', async function () {
				sidebarComponent = new SidebarComponent( page );
				const plan = await sidebarComponent.getCurrentPlanName();
				expect( plan ).toBe( 'Pro' );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( 'Plans page states user is on WordPress.com Pro plan', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.validateActivePlan( 'Pro' );
			} );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			const response = await restAPIClient.deleteSite( {
				url: newSiteDetails.body.blog_details.url,
				id: newSiteDetails.body.blog_details.id,
				name: newSiteDetails.body.blog_details.blogname,
			} );

			// If the response is `null` then no action has been
			// performed.
			if ( response ) {
				// The only correct response is the string
				// "deleted".
				if ( response.status !== 'deleted' ) {
					console.warn(
						`Failed to delete siteID ${ newSiteDetails.body.blog_details.id }.\nExpected: "deleted", Got: ${ response.status }`
					);
				} else {
					console.log( `Successfully deleted siteID ${ newSiteDetails.body.blog_details.id }.` );
				}
			}
		} );
	}
);
