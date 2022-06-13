import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddOnsGrid from 'calypso/my-sites/add-ons/components/add-ons-grid';
import useAddOns, { AddOnMeta } from 'calypso/my-sites/add-ons/hooks/use-add-ons';
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
	selectedAddons: string[];
	addOns: ( AddOnMeta | null )[];
	onToggleAllAddons: ( allAddons: boolean ) => void;
	onAddAddon: ( addonSlug: string ) => void;
	onRemoveAddon: ( addonSlug: string ) => void;
}

const AddonsContainer = styled.div``;

const ToggleButton = styled.button< { isSelect: boolean } >`
	display: inline-block;
	margin: 1rem 0;
	cursor: pointer;

	&::before {
		content: ${ ( { isSelect } ) => ( isSelect ? "'-'" : "'+'" ) };
		display: inline-block;
		margin-right: 3px;
	}
`;

const Addons = ( {
	onToggleAllAddons,
	onAddAddon,
	onRemoveAddon,
	selectedAddons,
	addOns,
}: AddonsProps ) => {
	const translate = useTranslate();
	const [ allAddons, setAllAddons ] = useState< boolean >( false );

	const hasAddon = ( addon: string ) =>
		selectedAddons.find( ( product: string ) => product === addon );

	const onToggleAllClick = useCallback( () => {
		onToggleAllAddons( allAddons );
		setAllAddons( ! allAddons );
	}, [ allAddons, setAllAddons, onToggleAllAddons ] );

	const toggleText = ! allAddons
		? translate( 'Select all add-ons' )
		: translate( 'Remove all add-ons' );
	return (
		<AddonsContainer>
			<ToggleButton onClick={ onToggleAllClick } isSelect={ allAddons }>
				{ toggleText }
			</ToggleButton>
			<AddOnsGrid
				actionPrimary={ { text: translate( 'Add to my plan' ), handler: onAddAddon } }
				actionSelected={ {
					text: translate( 'Remove from my plan' ),
					handler: onRemoveAddon,
				} }
				useAddOnSelectedStatus={ ( addon: string ) => !! hasAddon( addon ) }
				addOns={ addOns }
				highlight={ false }
			/>
		</AddonsContainer>
	);
};

export default function AddonsStep( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const addOns = useAddOns();

	const [ selectedAddons, setSelectedAddons ] = useState< string[] >( [] );

	const onAddAddon = useCallback(
		( addonSlug: string ) => {
			setSelectedAddons( [ ...selectedAddons, addonSlug ] );
		},
		[ selectedAddons ]
	);

	const onRemoveAddon = useCallback(
		( addonSlug: string ) => {
			setSelectedAddons( selectedAddons.filter( ( addon ) => addon !== addonSlug ) );
		},
		[ selectedAddons ]
	);

	const onToggleAllAddons = useCallback(
		( allAddons ) => {
			if ( allAddons ) {
				setSelectedAddons( [] );
			} else {
				selectedAddons.forEach( onRemoveAddon );
				setSelectedAddons(
					addOns.filter( ( addon ) => null !== addon ).map( ( addon ) => addon.slug )
				);
			}
		},
		[ addOns, onRemoveAddon, selectedAddons ]
	);

	const headerText = translate( 'Boost your plan with add-ons' );
	const subHeaderText =
		'Sed eros elit, vehicula eu nisi a, aliquet ullamcorper tortor. Aliquam vel augue vel magna laoreet faucibus sit amet a mauris.';

	const submitAddons = useCallback( () => {
		const cartItems: MinimalRequestCartProduct[] = selectedAddons.map( ( addonSlug ) => ( {
			product_slug: addonSlug,
		} ) );
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
	}, [ dispatch, props.stepName, props.stepSectionName, selectedAddons ] );

	return (
		<StepWrapper
			{ ...props }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<CalypsoShoppingCartProvider>
					<Addons
						onToggleAllAddons={ onToggleAllAddons }
						onAddAddon={ onAddAddon }
						onRemoveAddon={ onRemoveAddon }
						selectedAddons={ selectedAddons }
						addOns={ addOns }
					/>
				</CalypsoShoppingCartProvider>
			}
			hideSkip
			hideNext={ false }
			goToNextStep={ submitAddons }
		/>
	);
}
