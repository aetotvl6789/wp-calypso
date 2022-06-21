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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

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
	.title {
		flex: 1;
		word-break: break-word;
		font-size: 16px;
	}
	.meta {
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
`;

const LineItemsWrapper = styled.div`
	border-top: 1px solid #dcdcde;
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
	overflow-y: auto;
	max-height: 75vh;
	width: 85%;
`;

const CartTitle = styled.div`
	font-size: 1.5rem;
	line-height: 1em;
	font-family: 'Recoleta';
	margin-bottom: 5px;
	margin-top: 35px;
`;

const Total = styled.div`
	font-weight: 600;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-top: 20px;
`;
function DummyLineItem( {
	product,
	meta,
	productCount = 1,
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
			<div className="page-picker__title">{ product.product_name }</div>
			<div className="page-picker__price">
				{ formatCurrency( product.cost * productCount, currencyCode ) }
			</div>
			{ meta && <div className="page-picker__meta">{ meta }</div> }
		</DummyLineItemContainer>
	);
}

export default function DummyMiniDIFMShoppingCart( {
	selectedPages,
}: {
	selectedPages: string[];
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestProductsList() );
	}, [ dispatch ] );

	const FREE_PAGES = 5;

	const exptraPageProduct = useSelector( ( state ) =>
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
			perPageCost: exptraPageProduct.cost_display,
			extraPageCount: extraPageCount,
		},
	} );
	const activePlan = isEnabled( 'plans/pro-plan' ) ? proPlan : premiumPlan;
	const totalCost =
		activePlan.cost + difmLiteProduct.cost + exptraPageProduct.cost * extraPageCount;
	const totalCostFormatted = formatCurrency( totalCost, currencyCode );
	return (
		<>
			<CartTitle>{ translate( 'Cart' ) }</CartTitle>
			<LineItemsWrapper>
				{
					<DummyLineItem
						product={ activePlan }
						meta={ translate( 'Plan Subscription: %(planPrice)s per year', {
							args: { planPrice: formatCurrency( activePlan.cost, currencyCode ) },
						} ) }
					/>
				}

				{ difmLiteProduct && <DummyLineItem product={ difmLiteProduct } /> }
				{ extraPageCount > 0 && (
					<DummyLineItem
						product={ exptraPageProduct }
						meta={ extraPageMeta }
						productCount={ extraPageCount }
					/>
				) }

				<Total>
					<div>{ translate( 'Total' ) }</div>
					<div>{ totalCostFormatted }</div>
				</Total>
			</LineItemsWrapper>
		</>
	);
}
