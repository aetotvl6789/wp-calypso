/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import {
	getCurrentUserCurrencyCode,
	getCurrentUserLocale,
} from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
} from 'calypso/lib/gsuite/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import { getAnnualPrice, getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	emailManagementForwarding,
	emailManagementNewGSuiteAccount,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import gSuiteLogo from 'calypso/assets/images/email-providers/gsuite.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import TitanProviderDetails from 'calypso/my-sites/email/email-providers-comparison/titan-provider-details';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProvidersComparison extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		isGSuiteSupported: PropTypes.bool.isRequired,
	};

	state = {
		isFetchingProvisioningURL: false,
	};

	goToEmailForwarding = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'email-forwarding' } );
		page( emailManagementForwarding( selectedSiteSlug, domain.name, currentRoute ) );
	};

	goToAddGSuite = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;

		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'gsuite' } );

		const planType = config.isEnabled( 'google-workspace-migration' ) ? 'starter' : 'basic';

		page(
			emailManagementNewGSuiteAccount( selectedSiteSlug, domain.name, planType, currentRoute )
		);
	};

	onAddTitanClick = () => {
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'titan' } );

		if ( config.isEnabled( 'titan/phase-2' ) ) {
			const { domain, currentRoute, selectedSiteSlug } = this.props;
			page( emailManagementNewTitanAccount( selectedSiteSlug, domain.name, currentRoute ) );
		} else {
			if ( this.state.isFetchingProvisioningURL ) {
				return;
			}

			const { domain, translate } = this.props;
			this.setState( { isFetchingProvisioningURL: true } );
			this.fetchTitanOrderProvisioningURL( domain.name ).then( ( { error, provisioningURL } ) => {
				this.setState( { isFetchingProvisioningURL: false } );
				if ( error ) {
					this.props.errorNotice(
						translate( 'An unknown error occurred. Please try again later.' )
					);
				} else {
					window.location.href = provisioningURL;
				}
			} );
		}
	};

	fetchTitanOrderProvisioningURL = ( domain ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getTitanOrderProvisioningURL( domain, ( serverError, result ) => {
				resolve( {
					error: serverError,
					provisioningURL: serverError ? null : result.provisioning_url,
				} );
			} );
		} );
	};

	renderHeaderSection() {
		const { domain, translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is the domain name, e.g example.com',
		};

		return (
			<PromoCard
				isPrimary
				title={ translate( 'Get your own @%(domainName)s email address', translateArgs ) }
				image={ image }
				className="email-providers-comparison__action-panel"
			>
				<p>
					{ translate(
						'Pick one of our flexible options to connect your domain with email ' +
							'and start getting emails @%(domainName)s today.',
						translateArgs
					) }
				</p>
			</PromoCard>
		);
	}

	renderForwardingDetails( className ) {
		const { domain, translate } = this.props;

		const buttonLabel =
			domain.emailForwardsCount > 0
				? translate( 'Manage email forwarding' )
				: translate( 'Add email forwarding' );

		return (
			<EmailProviderDetails
				title={ translate( 'Email Forwarding' ) }
				description={ translate(
					'Use your custom domain in your email address and forward all your mail to another address.'
				) }
				image={ { path: forwardingIcon } }
				features={ [
					translate( 'No billing' ),
					translate( 'Receive emails sent to your custom domain' ),
				] }
				buttonLabel={ buttonLabel }
				onButtonClick={ this.goToEmailForwarding }
				className={ className }
			/>
		);
	}

	renderTitanDetails( className ) {
		const { currencyCode, titanMailProduct } = this.props;

		return (
			<TitanProviderDetails
				className={ className }
				currencyCode={ currencyCode }
				onAddTitanClick={ this.onAddTitanClick }
				titanMailProduct={ titanMailProduct }
			/>
		);
	}

	renderGSuiteDetails( className ) {
		const { currencyCode, gSuiteProduct, translate } = this.props;

		let title = translate( 'G Suite by Google' );
		let description = translate(
			"We've partnered with Google to offer you email, storage, docs, calendars, and more."
		);
		let logo = gSuiteLogo;
		let buttonLabel = translate( 'Add G Suite' );

		if ( config.isEnabled( 'google-workspace-migration' ) ) {
			title = getGoogleMailServiceFamily();
			description = translate(
				'The best way to create, communicate, and collaborate. An integrated workspace that is simple and easy to use.'
			);
			logo = googleWorkspaceIcon;
			buttonLabel = translate( 'Add %(googleMailService)s', {
				args: {
					googleMailService: getGoogleMailServiceFamily(),
				},
				comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
			} );
		}

		return (
			<EmailProviderDetails
				title={ title }
				description={ description }
				image={ { path: logo } }
				features={ [
					translate( 'Annual billing' ),
					translate( 'Send and receive from your custom domain' ),
					translate( '30GB storage' ),
					translate( 'Email, calendars, and contacts' ),
					translate( 'Video calls, docs, spreadsheets, and more' ),
					translate( 'Work from anywhere on any device – even offline' ),
				] }
				formattedPrice={ translate( '{{price/}} /user /year', {
					components: {
						price: <span>{ getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
				} ) }
				discount={
					hasDiscount( gSuiteProduct )
						? translate( 'First year %(discountedPrice)s', {
								args: {
									discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
								},
								comment: '%(discountedPrice)s is a formatted price, e.g. $75',
						  } )
						: null
				}
				buttonLabel={ buttonLabel }
				onButtonClick={ this.goToAddGSuite }
				className={ classNames( className, 'gsuite' ) }
			/>
		);
	}

	render() {
		const { isGSuiteSupported } = this.props;
		const isTitanSupported = config.isEnabled( 'titan/phase-2' );
		const cardClassName = classNames( [
			isGSuiteSupported ? null : 'no-gsuite',
			isTitanSupported ? null : 'no-titan',
		] );
		return (
			<>
				{ this.renderHeaderSection() }
				<div className="email-providers-comparison__providers">
					{ this.renderForwardingDetails( cardClassName ) }
					{ isTitanSupported && this.renderTitanDetails( cardClassName ) }
					{ isGSuiteSupported && this.renderGSuiteDetails( cardClassName ) }
					<TrackComponentView
						eventName="calypso_email_providers_comparison_page_view"
						eventProperties={ { is_gsuite_supported: isGSuiteSupported } }
					/>
				</div>
			</>
		);
	}
}

export default connect(
	( state ) => {
		const productSlug = config.isEnabled( 'google-workspace-migration' )
			? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GSUITE_BASIC_SLUG;

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentUserLocale: getCurrentUserLocale( state ),
			gSuiteProduct: getProductBySlug( state, productSlug ),
			titanMailProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
			currentRoute: getCurrentRoute( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( EmailProvidersComparison ) );
