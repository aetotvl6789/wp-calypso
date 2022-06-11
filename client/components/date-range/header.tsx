import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
	onApplyClick: () => void;
	onCancelClick: () => void;
	applyButtonText: string | null | undefined;
	cancelButtonText: string | null | undefined;
}

const DateRangeHeader: FunctionComponent< Props > = ( {
	onCancelClick = noop,
	onApplyClick = noop,
	cancelButtonText,
	applyButtonText,
} ) => {
	const translate = useTranslate();

	return (
		<div className="date-range__popover-header">
			<Button
				className="date-range__cancel-btn"
				onClick={ onCancelClick }
				compact
				aria-label="Cancel"
			>
				{ cancelButtonText || translate( 'Cancel' ) }
			</Button>
			<Button
				className="date-range__apply-btn"
				onClick={ onApplyClick }
				primary
				compact
				aria-label="Apply"
			>
				{ applyButtonText || translate( 'Apply' ) }
			</Button>
		</div>
	);
};

export default DateRangeHeader;
