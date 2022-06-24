import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddOnsGrid from 'calypso/my-sites/add-ons/components/add-ons-grid';
import useAddOns, { AddOnMeta } from 'calypso/my-sites/add-ons/hooks/use-add-ons';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import NavigationLink from 'calypso/signup/navigation-link';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import './styles.scss';

interface Props {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	flowName: string;
	positionInFlow: number;
	defaultDependencies: object;
	forwardUrl: string;
}
interface AddOnsProps {
	selectedAddOns: string[];
	addOns: ( AddOnMeta | null )[];
	onToggleAllAddOns: ( allAddOns: boolean ) => void;
	onAddAddon: ( addonSlug: string ) => void;
	onRemoveAddon: ( addonSlug: string ) => void;
}

const ToggleButton = styled.button< { isSelect: boolean } >`
	display: inline-block;
	margin: 1.5rem 0;
	cursor: pointer;
	text-decoration: underline;
	font-size: 1rem;
	font-weight: 500;
`;

const AddOns = ( {
	onToggleAllAddOns,
	onAddAddon,
	onRemoveAddon,
	selectedAddOns,
	addOns,
}: AddOnsProps ) => {
	const translate = useTranslate();
	const shouldSelectAllAddons = selectedAddOns.length > 0;

	const hasAddon = useCallback(
		( addon: string ) => selectedAddOns.some( ( product: string ) => product === addon ),
		[ selectedAddOns ]
	);

	const onToggleAllClick = useCallback( () => {
		onToggleAllAddOns( shouldSelectAllAddons );
	}, [ shouldSelectAllAddons, onToggleAllAddOns ] );

	const getAddOnSelectedStatus = useCallback(
		( addon: string ) => {
			const selected = hasAddon( addon );
			return {
				selected,
				text: translate( 'Added to your plan' ),
			};
		},
		[ hasAddon, translate ]
	);

	const toggleText = ! shouldSelectAllAddons
		? '+ ' + translate( 'Select all add-ons' )
		: '- ' + translate( 'Remove all add-ons' );
	return (
		<>
			<ToggleButton onClick={ onToggleAllClick } isSelect={ shouldSelectAllAddons }>
				{ toggleText }
			</ToggleButton>
			<AddOnsGrid
				actionPrimary={ { text: translate( 'Add to my plan' ), handler: onAddAddon } }
				actionSelected={ {
					text: translate( 'Remove add-on' ),
					handler: onRemoveAddon,
				} }
				useAddOnSelectedStatus={ getAddOnSelectedStatus }
				addOns={ addOns }
				highlightFeatured={ true }
			/>
		</>
	);
};

export default function AddOnsStep( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const addOns = useAddOns();

	const [ selectedAddOns, setSelectedAddOns ] = useState< string[] >( [] );

	const onAddAddon = useCallback(
		( addonSlug: string ) => {
			setSelectedAddOns( [ ...selectedAddOns, addonSlug ] );
		},
		[ selectedAddOns ]
	);

	const onRemoveAddon = useCallback(
		( addonSlug: string ) => {
			setSelectedAddOns( selectedAddOns.filter( ( addon ) => addon !== addonSlug ) );
		},
		[ selectedAddOns ]
	);

	const onToggleAllAddOns = useCallback(
		( shouldSelectAllAddons ) => {
			if ( shouldSelectAllAddons ) {
				setSelectedAddOns( [] );
			} else {
				selectedAddOns.forEach( onRemoveAddon );
				setSelectedAddOns( addOns.map( ( addon ) => ( addon ? addon.productSlug : '' ) ) );
			}
		},
		[ addOns, onRemoveAddon, selectedAddOns ]
	);

	const headerText = translate( 'Boost your plan with add-ons' );
	const subHeaderText =
		'Sed eros elit, vehicula eu nisi a, aliquet ullamcorper tortor. Aliquam vel augue vel magna laoreet faucibus sit amet a mauris.';
	const continueText = selectedAddOns.length
		? translate( 'Go to checkout' )
		: translate( 'Continue' );

	const submitAddOns = useCallback( () => {
		const cartItems: MinimalRequestCartProduct[] = selectedAddOns.map( ( addonSlug ) => ( {
			product_slug: addonSlug,
		} ) );
		const step = {
			stepName: props.stepName,
			stepSectionName: props.stepSectionName,
			cartItem: cartItems,
		};

		dispatch(
			submitSignupStep( step, {
				cartItem: cartItems.length ? cartItems : undefined,
			} )
		);
	}, [ dispatch, props.stepName, props.stepSectionName, selectedAddOns ] );

	return (
		<StepWrapper
			{ ...props }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<CalypsoShoppingCartProvider>
					<AddOns
						onToggleAllAddOns={ onToggleAllAddOns }
						onAddAddon={ onAddAddon }
						onRemoveAddon={ onRemoveAddon }
						selectedAddOns={ selectedAddOns }
						addOns={ addOns }
					/>
				</CalypsoShoppingCartProvider>
			}
			hideSkip
			headerButton={
				<NavigationLink
					direction="forward"
					labelText={ continueText }
					forwardIcon={ null }
					primary={ false }
					borderless={ false }
					{ ...props }
					goToNextStep={ submitAddOns }
				/>
			}
		/>
	);
}
