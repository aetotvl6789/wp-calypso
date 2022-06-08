import { Card, Button } from '@automattic/components';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import './styles.scss';

interface Props {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
}
interface AddonsProps {
	cart: MinimalRequestCartProduct[];
	onToggleAddon: ( addonSlug: string ) => void;
}

const AddonsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 2rem;
	row-gap: 1rem;

	.addons__card {
		width: 100%;
	}

	h2 {
		font-weight: 500;
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

const allowedAddons = [ 'unlimited_themes', 'no-adverts/no-adverts.php', 'custom-design' ];

const Addons = ( { onToggleAddon, cart }: AddonsProps ) => {
	const translate = useTranslate();
	const productsList: Record< string, ProductListItem > = useSelector( getProductsList );
	const addons: ProductListItem[] = Object.keys( productsList ).reduce(
		( arr: ProductListItem[], key ) => {
			if ( allowedAddons.includes( key ) ) {
				arr.push( productsList[ key ] );
			}
			return arr;
		},
		[]
	);

	const getAddon = ( addon: string ) =>
		cart.find( ( product: MinimalRequestCartProduct ) => product.product_slug === addon );
	const addedText = translate( 'Added to your plan' );

	return (
		<AddonsContainer>
			{ addons.map( ( addon: ProductListItem ) => (
				<Card key={ addon.product_id } className="addons__card">
					<CardHeading tagName="h2" size={ 16 }>
						{ addon.product_name }
					</CardHeading>
					<CardHeading tagName="h6" size={ 14 }>
						{ addon.cost_display }
					</CardHeading>
					<p>{ addon.description }</p>
					<ButtonContainer>
						{ getAddon( addon.product_slug ) ? (
							<>
								<Button primary={ true } onClick={ () => onToggleAddon( addon.product_slug ) }>
									{ translate( 'Add to my plan' ) }
								</Button>
								<span>{ addedText }</span>
							</>
						) : (
							<Button onClick={ () => onToggleAddon( addon.product_slug ) }>
								{ translate( 'Remove from my plan' ) }
							</Button>
						) }
					</ButtonContainer>
				</Card>
			) ) }
		</AddonsContainer>
	);
};

export default function AddonsStep( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ cartItems, setCartItmes ] = useState< MinimalRequestCartProduct[] >( [] );

	const onToggleAddon = useCallback(
		( addonSlug: string ) => {
			const cartItem = cartItems.findIndex( ( item ) => item.product_slug === addonSlug );

			if ( cartItem !== -1 ) {
				setCartItmes( [ ...cartItems.slice( 0, cartItem ), ...cartItems.slice( cartItem + 1 ) ] );
			} else {
				const newCartItem: MinimalRequestCartProduct = {
					product_slug: addonSlug,
				};
				setCartItmes( [ ...cartItems, newCartItem ] );
			}
		},
		[ cartItems ]
	);

	const headerText = translate( 'Boost your plan with add-ons' );
	const subHeaderText =
		'Sed eros elit, vehicula eu nisi a, aliquet ullamcorper tortor. Aliquam vel augue vel magna laoreet faucibus sit amet a mauris.';

	const submitAddons = useCallback( () => {
		const step = {
			stepName: props.stepName,
			stepSectionName: props.stepSectionName,
			cartItem: cartItems,
		};

		dispatch(
			submitSignupStep( step, {
				cartItem: cartItems,
			} )
		);
	}, [ cartItems, props.stepName, props.stepSectionName, dispatch ] );

	return (
		<StepWrapper
			{ ...props }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<CalypsoShoppingCartProvider>
					<Addons onToggleAddon={ onToggleAddon } cart={ cartItems } />
				</CalypsoShoppingCartProvider>
			}
			hideSkip
			hideNext={ false }
			goToNextStep={ submitAddons }
		/>
	);
}
