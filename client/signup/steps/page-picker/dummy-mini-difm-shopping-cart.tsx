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
	font-size: 1.1em;
	padding: 20px 0;
	border-bottom: 1px solid #dcdcde;
	position: relative;
	.page-picker__title {
		flex: 1;
		word-break: break-word;
		font-size: 16px;
		@media ( max-width: 600px ) {
			display: flex;
			font-size: 0.9em;
		}
	}
	.page-picker__meta {
		color: #646970;
		font-size: 14px;
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
		.page-picker__meta {
			display: none;
		}
	}
`;

const LineItemsWrapper = styled.div`
	border-top: 1px solid #dcdcde;
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
	overflow-y: auto;
	max-height: 75vh;
	width: 85%;
	@media ( max-width: 600px ) {
		width: 100%;
		margin: 0 0px;
	}
`;

const CartTitle = styled.div`
	font-size: 1.5rem;
	line-height: 1em;
	font-family: 'Recoleta';
	margin-bottom: 5px;
	margin-top: 35px;
	@media ( max-width: 600px ) {
		font-size: 1.25rem;
		margin-top: 5px;
	}
`;

const Total = styled.div`
	font-weight: 600;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-top: 20px;

	@media ( max-width: 600px ) {
		font-size: 0.85em;
		margin-top: 10px;
	}
`;

const MobileCount = styled.span`
	display: none;
	@media ( max-width: 600px ) {
		display: block;
	}
`;
function DummyLineItem( {
	product,
	meta,
	productCount,
}: {
	product: ProductListItem | null;
	meta?: TranslateResult;
	productCount?: number;
} ) {
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) as string;

	if ( ! product ) {
		return null;
	}
	return (
		<DummyLineItemContainer>
			<div className="page-picker__title">
				{ product.product_name }
				{ productCount ? <MobileCount>&nbsp;{ `x ${ productCount }` }</MobileCount> : null }
			</div>
			<div className="page-picker__price">
				{ productCount
					? formatCurrency( product.cost * productCount, currencyCode )
					: product.cost_display }
			</div>
			{ meta && <div className="page-picker__meta">{ meta }</div> }
		</DummyLineItemContainer>
	);
}

interface CartItem {
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
	const extraPageMeta = translate( 'Extra Page: %(perPageCost)s x %(extraPageCount)s', {
		args: {
			perPageCost: extraPageProduct.cost_display,
			extraPageCount: extraPageCount,
		},
	} );
	const activePlan = isEnabled( 'plans/pro-plan' ) ? proPlan : premiumPlan;

	let displayedCartItems: CartItem[] = [
		{
			product: activePlan,
			meta: translate( 'Plan Subscription: %(planPrice)s per year', {
				args: { planPrice: formatCurrency( activePlan.cost, currencyCode ) },
			} ),
			lineCost: activePlan.cost,
		},
		{
			product: difmLiteProduct,
			lineCost: difmLiteProduct.cost,
		},
		{
			product: extraPageProduct,
			meta: extraPageMeta,
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

	if ( extraPageCount === 0 ) {
		displayedCartItems = displayedCartItems.filter(
			( p ) => p.product.product_slug !== extraPageProduct.product_slug
		);
	}

	const totalCost = displayedCartItems.reduce(
		( total, currentProduct ) => currentProduct.lineCost + total,
		0
	);
	const totalCostFormatted = formatCurrency( totalCost, currencyCode );

	return (
		<CartContainer>
			<Cart>
				<CartTitle>{ translate( 'Cart' ) }</CartTitle>
				<LineItemsWrapper>
					{ displayedCartItems.map( ( item ) => (
						<DummyLineItem
							product={ item.product }
							meta={ item.meta }
							productCount={ item.productCount }
						/>
					) ) }

					<Total>
						<div>{ translate( 'Total' ) }</div>
						<div>{ totalCostFormatted }</div>
					</Total>
				</LineItemsWrapper>
			</Cart>
		</CartContainer>
	);
}
