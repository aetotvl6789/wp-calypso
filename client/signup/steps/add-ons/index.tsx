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

const AddOnsContainer = styled.div``;

const ToggleButton = styled.button< { isSelect: boolean } >`
	display: inline-block;
	margin: 1.5rem 0;
	cursor: pointer;
	border-bottom: solid 1px #000;

	&::before {
		content: ${ ( { isSelect } ) => ( isSelect ? "'-'" : "'+'" ) };
		display: inline-block;
		margin-right: 3px;
	}
`;

const AddOns = ( {
	onToggleAllAddOns,
	onAddAddon,
	onRemoveAddon,
	selectedAddOns,
	addOns,
}: AddOnsProps ) => {
	const translate = useTranslate();
	const [ allAddOns, setAllAddOns ] = useState< boolean >( false );

	const hasAddon = ( addon: string ) =>
		selectedAddOns.find( ( product: string ) => product === addon );

	const onToggleAllClick = useCallback( () => {
		onToggleAllAddOns( allAddOns );
		setAllAddOns( ! allAddOns );
	}, [ allAddOns, setAllAddOns, onToggleAllAddOns ] );

	const toggleText = ! allAddOns
		? translate( 'Select all add-ons' )
		: translate( 'Remove all add-ons' );
	return (
		<AddOnsContainer>
			<ToggleButton onClick={ onToggleAllClick } isSelect={ allAddOns }>
				{ toggleText }
			</ToggleButton>
			<AddOnsGrid
				actionPrimary={ { text: translate( 'Add to my plan' ), handler: onAddAddon } }
				actionSelected={ {
					text: translate( 'Remove add-on' ),
					handler: onRemoveAddon,
				} }
				useAddOnSelectedStatus={ ( addon: string ) => !! hasAddon( addon ) }
				addOns={ addOns }
				highlight={ false }
			/>
		</AddOnsContainer>
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
		( allAddOns ) => {
			if ( allAddOns ) {
				setSelectedAddOns( [] );
			} else {
				selectedAddOns.forEach( onRemoveAddon );
				setSelectedAddOns( addOns.map( ( addon ) => ( addon ? addon.slug : '' ) ) );
			}
		},
		[ addOns, onRemoveAddon, selectedAddOns ]
	);

	const headerText = translate( 'Boost your plan with add-ons' );
	const subHeaderText =
		'Sed eros elit, vehicula eu nisi a, aliquet ullamcorper tortor. Aliquam vel augue vel magna laoreet faucibus sit amet a mauris.';

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
				cartItem: cartItems,
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
					labelText={ translate( 'Continue' ) }
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
