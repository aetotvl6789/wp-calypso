import { isEnabled } from '@automattic/calypso-config';
import {
	WPCOM_DIFM_EXTRA_PAGE,
	WPCOM_DIFM_LITE,
	PLAN_PREMIUM,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const CartContainer = styled.div`
	position: relative;
	@media ( max-width: 600px ) {
		z-index: 177;
		margin-bottom: 61px;
		position: fixed;
		background: white;
		width: 100%;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	margin-bottom: 48px;
`;
const Cart = styled.div`
	position: initial;

	@media ( max-width: 600px ) {
		padding: 10px 15px 10px;
		width: 100%;
		border-top: 1px solid #dcdcde;
	}
`;
const DummyLineItemContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: 400;
	color: #2c3338;
	font-size: 14px;
	padding: 16px 0;
	border-bottom: 1px solid #dcdcde;
	position: relative;
	.page-picker__title {
		flex: 1;
		word-break: break-word;
		@media ( max-width: 600px ) {
			display: flex;
			font-size: 0.9em;
		}
	}
	.page-picker__price {
		font-weight: 500;
	}
	.page-picker__meta {
		color: #646970;
		font-size: 12px;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-content: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 2px 10px;
	}
	span {
		position: relative;
	}

	@media ( max-width: 600px ) {
		font-size: 0.9em;
		padding: 2px 0;
		border: none;

		.page-picker__meta {
			display: none;
		}
	}
`;

const LineItemsWrapper = styled.div`
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
	overflow-y: auto;
	max-height: 75vh;
	width: 100%;
	max-width: 365px;
	border-bottom: 1px solid #dcdcde;
	@media ( max-width: 600px ) {
		margin: 0 0px;
		border: none;
	}
`;

const Total = styled.div`
	font-weight: 500;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 30px 0;
	div {
		display: flex;
		align-items: center;
		&.value {
			font-family: Recoleta;
			font-size: 32px;
			font-weight: 400;
			@media ( max-width: 600px ) {
				font-size: 16px;
			}
		}
	}

	@media ( max-width: 600px ) {
		font-size: 16px;
		margin-top: 6px;
		padding: 0;
		padding-top: 6px;
		border-top: 1px solid #eee;
	}
`;

function DummyLineItem( {
	product,
	meta,
	productCount,
	name,
}: {
	product: ProductListItem | null;
	meta?: TranslateResult;
	productCount?: number;
	name?: string;
} ) {
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) as string;

	if ( ! product ) {
		return null;
	}
	return (
		<DummyLineItemContainer>
			<div className="page-picker__title">{ name ?? product.product_name }</div>
			<div className="page-picker__price">
				{ productCount !== undefined
					? formatCurrency( product.cost * productCount, currencyCode, { precision: 0 } )
					: formatCurrency( product.cost, currencyCode, { precision: 0 } ) }
			</div>
			{ meta && <div className="page-picker__meta">{ meta }</div> }
		</DummyLineItemContainer>
	);
}

interface CartItem {
	name?: string;
	product: ProductListItem;
	meta?: TranslateResult;
	productCount?: number;
	lineCost: number;
}

export default function DummyMiniDIFMShoppingCart( {
	selectedPages,
	newOrExistingSiteChoice,
	isPaidPlan,
}: {
	selectedPages: string[];
	newOrExistingSiteChoice: string;
	isPaidPlan: boolean;
} ) {
	const translate = useTranslate();
	const FREE_PAGES = 5;

	const extraPageProduct = useSelector( ( state ) =>
		getProductBySlug( state, WPCOM_DIFM_EXTRA_PAGE )
	) as ProductListItem;
	const difmLiteProduct = useSelector( ( state ) =>
		getProductBySlug( state, WPCOM_DIFM_LITE )
	) as ProductListItem;
	const proPlan = useSelector( ( state ) =>
		getProductBySlug( state, PLAN_WPCOM_PRO )
	) as ProductListItem;
	const premiumPlan = useSelector( ( state ) =>
		getProductBySlug( state, PLAN_PREMIUM )
	) as ProductListItem;
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) as string;

	const extraPageCount = Math.max( 0, selectedPages.length - FREE_PAGES );
	const activePlan = isEnabled( 'plans/pro-plan' ) ? proPlan : premiumPlan;

	let displayedCartItems: CartItem[] = [
		{
			name: 'Website Design Service',
			product: difmLiteProduct,
			lineCost: difmLiteProduct.cost,
			meta: translate( 'One-time fee' ),
		},
		{
			product: activePlan,
			meta: translate( 'Plan Subscription: %(planPrice)s per year', {
				args: { planPrice: formatCurrency( activePlan.cost, currencyCode ) },
			} ),
			lineCost: activePlan.cost,
		},

		{
			name: `${ extraPageCount } ${
				extraPageCount === 1 ? translate( 'Extra Page' ) : translate( 'Extra Pages' )
			}`,
			product: extraPageProduct,
			meta: translate( '%(perPageCost)s Per Page', {
				args: {
					perPageCost: extraPageProduct.cost_display,
				},
			} ),
			lineCost: extraPageProduct.cost * extraPageCount,
			productCount: extraPageCount,
		},
	];

	// Hide pro plan if existing site has a paid plan
	if ( newOrExistingSiteChoice !== 'new-site' && isPaidPlan ) {
		displayedCartItems = displayedCartItems.filter(
			( p ) => p.product.product_slug !== activePlan.product_slug
		);
	}

	const totalCost = displayedCartItems.reduce(
		( total, currentProduct ) => currentProduct.lineCost + total,
		0
	);
	const totalCostFormatted = formatCurrency( totalCost, currencyCode, { precision: 0 } );

	return (
		<CartContainer>
			<Cart>
				<LineItemsWrapper>
					{ displayedCartItems.map( ( item ) => (
						<DummyLineItem { ...item } />
					) ) }

					<Total>
						<div>{ translate( 'Total' ) }</div>
						<div className="page-picker__value">{ totalCostFormatted }</div>
					</Total>
				</LineItemsWrapper>
			</Cart>
		</CartContainer>
	);
}
