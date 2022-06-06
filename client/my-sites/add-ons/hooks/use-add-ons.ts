import { useSelector } from 'react-redux';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

export interface AddOn {
	slug: string;
	name: string;
	description: string;
	cost: number;
	highlight?: boolean;
	icon?: string;
}

// these are pulled from API in the hook below
const addOnsActive = [
	{
		slug: 'no-adverts/no-adverts.php',
		highlight: false,
		nameOverride: 'Remove Ads',
	},
];

// memoize on products list
const useAddOns = () => {
	return useSelector( ( state ) => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.slug );

			// will not render anything if product not fetched from API
			// - can remove and update `adOnsActive` with description, name, etc. to still render
			// - probably need some sort of placeholder in the add-ons page instead
			if ( ! product ) {
				return null;
			}

			return {
				slug: addOn.slug,
				name: addOn.nameOverride || product?.product_name,
				description: product?.description,
				cost: product?.cost,
				highlight: addOn.highlight,
			} as AddOn;
		} );
	} );
};

export default useAddOns;
