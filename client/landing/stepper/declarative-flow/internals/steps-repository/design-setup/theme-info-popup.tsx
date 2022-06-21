import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useThemeDetails } from '../../../../hooks/use-theme-details';
import './theme-info-popup.scss';

interface Plugin {
	id: number;
	name: string;
	icon: string; // TODO - This needs to be an image name or something
}

interface ThemeInfoPopupProps {
	slug: string;
}

interface PluginListProps {
	plugins: Plugin[];
}

interface Feature {
	name: string;
}

interface FeaturesProps {
	features: Feature[];
}

interface DescriptionProps {
	author: string;
	author_uri: string;
	description: string;
}

const ThemeInfoPopup = ( { slug }: ThemeInfoPopupProps ) => {
	const theme = useThemeDetails( slug );
	console.log( 'theme', theme );

	const ThemeDescription = ( { author_uri, author, description }: DescriptionProps ) => {
		return (
			<div className="theme-info-popup__description popup-item">
				<h1>
					Brought to you by
					<a href={ author_uri } target="_blank" rel="noopener noreferrer">
						{ author }
					</a>
				</h1>
				<p className="theme-info-popup__description">{ description }</p>
			</div>
		);
	};

	const ThemeFeatures = ( { features }: FeaturesProps ) => {
		return (
			<>
				{ features.length > 0 && (
					<div className="theme-info-popup__features-wrap popup-item">
						<h2>Features</h2>
						<div className="theme-info-popup__features">
							{ features.map( ( feature, idx ) => {
								return (
									<div className="theme-info-popup__feature" key={ idx }>
										{ feature.name }
									</div>
								);
							} ) }
						</div>
					</div>
				) }
			</>
		);
	};

	const SupportLinks = () => {
		return (
			<div className="theme-info-popup__support-links popup-item">
				<h2>Support</h2>
				<p>
					<a href="https://wordpress.com/help/contact/">Contact us</a> or visit the{ ' ' }
					<a href="https://en.forums.wordpress.com/forum/themes">support forum</a>
				</p>
			</div>
		);
	};

	if ( ! theme ) {
		return <LoadingEllipsis />;
	}

	const { author, author_uri, description } = theme;
	const features = theme.taxonomies.features;

	return (
		<div className="theme-info-popup">
			<ThemeDescription author_uri={ author_uri } author={ author } description={ description } />
			<SupportLinks />
			<ThemeFeatures features={ features } />
		</div>
	);
};

export default ThemeInfoPopup;
