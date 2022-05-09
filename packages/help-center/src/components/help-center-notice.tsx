import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AnalysisReport } from '@automattic/data-stores';

type Props = {
	ownershipResult: AnalysisReport[ 'result' ];
	isAnalysisLoading: boolean;
	userDeclaredSite: AnalysisReport[ 'site' ];
};

const responses: Record< AnalysisReport[ 'result' ], React.ReactChild > = {
	NOT_OWNED_BY_USER: (
		<p>
			{ __(
				'Your site is linked to another WordPress.com account. If you’re trying to access it, please follow our Account Recovery procedure.',
				__i18n_text_domain__
			) }
			&nbsp;{ ' ' }
			<ExternalLink href={ localizeUrl( 'https://wordpress.com/wp-login.php?action=recovery' ) }>
				{ __( 'Learn More', __i18n_text_domain__ ) }
			</ExternalLink>
		</p>
	),
	WPCOM: '',
	WPORG: (
		<p>
			{ __(
				'Your site is not hosted on our services. Support for the self-hosted version of WordPress is provided by the WordPress.org community forums, or if the problem relates to a specific plugin or theme, contact support for that product instead. If you’re not sure, share you question with a link, and we’ll point you in the right direction!',
				__i18n_text_domain__
			) }
		</p>
	),
	UNKNOWN: (
		<p>
			{ __(
				"We couldn't fetch enough information about this site to determine our ability to support you with it.",
				__i18n_text_domain__
			) }
		</p>
	),
};

export function HelpCenterOwnershipNotice( {
	ownershipResult,
	isAnalysisLoading,
	userDeclaredSite,
}: Props ) {
	if ( isAnalysisLoading || ownershipResult === 'WPCOM' ) {
		if ( ownershipResult === 'WPCOM' ) {
			return <p className="help-center-notice__positive-feedback">{ userDeclaredSite?.name }</p>;
		}
		return null;
	}
	return (
		<div className="help-center-notice__container">
			<div>
				<Icon icon="info-outline"></Icon>
			</div>
			{ responses[ ownershipResult ] }
		</div>
	);
}