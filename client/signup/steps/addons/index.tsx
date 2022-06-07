import { Card, Button } from '@automattic/components';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import StepWrapper from 'calypso/signup/step-wrapper';
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
`;

const Addons = ( { onToggleAddon, cart }: AddonsProps ) => {
	const translate = useTranslate();

	const getAddon = ( addon: string ) =>
		cart.find( ( product: MinimalRequestCartProduct ) => product.product_slug === addon );
	const addedText = translate( 'Added to your plan' );

	return (
		<AddonsContainer>
			<Card>
				<h3>{ translate( 'Premium themes' ) }</h3>
				<p>
					Aliquam vel augue vel magna laoreet faucibus sit amet a mauris. Sed eros elit, vehicula eu
					nisi a, aliquet ullamcorper tortor. Learn more{ ' ' }
				</p>
				<Button onClick={ () => onToggleAddon( 'unlimited_themes' ) }>
					{ translate( 'Add to my plan' ) }
				</Button>
				{ getAddon( 'unlimited_themes' ) && <span>{ addedText }</span> }
			</Card>
			<Card>
				<h3>{ translate( 'Remove ads' ) }</h3>
				<p>
					Aliquam vel augue vel magna laoreet faucibus sit amet a mauris. Sed eros elit, vehicula eu
					nisi a, aliquet ullamcorper tortor. Learn more{ ' ' }
				</p>
				<Button onClick={ () => onToggleAddon( 'no-adverts/no-adverts.php' ) }>
					{ translate( 'Add to my plan' ) }
				</Button>
				{ getAddon( 'no-adverts/no-adverts.php' ) && <span>{ addedText }</span> }
			</Card>
			<Card>
				<h3>{ translate( 'Unlimited admin users' ) }</h3>
				<p>
					Aliquam vel augue vel magna laoreet faucibus sit amet a mauris. Sed eros elit, vehicula eu
					nisi a, aliquet ullamcorper tortor. Learn more{ ' ' }
				</p>
				<Button onClick={ () => onToggleAddon( 'unlimited-admins' ) }>
					{ translate( 'Add to my plan' ) }
				</Button>
				{ getAddon( 'unlimited-admins' ) && <span>{ addedText }</span> }
			</Card>
			<Card>
				<h3>{ translate( 'Premium design tools' ) }</h3>
				<p>
					Aliquam vel augue vel magna laoreet faucibus sit amet a mauris. Sed eros elit, vehicula eu
					nisi a, aliquet ullamcorper tortor. Learn more{ ' ' }
				</p>
				<Button onClick={ () => onToggleAddon( 'custom-design' ) }>
					{ translate( 'Add to my plan' ) }
				</Button>
				{ getAddon( 'custom-design' ) && <span>{ addedText }</span> }
			</Card>
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
