import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import ActionButton from './action-button';
import type { StorageUsageLevelName } from '../storage-usage-levels';

type OwnProps = {
	usageLevel: StorageUsageLevelName;
	bytesUsed: number;
};

const ManageStorage: React.FC< OwnProps > = ( { usageLevel, bytesUsed } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_managestorage_display', {
				type: usageLevel,
				bytes_used: bytesUsed,
			} )
		);
	}, [ dispatch, usageLevel, bytesUsed ] );

	return (
		<ActionButton
			className="usage-warning__manage-storage"
			usageLevel={ usageLevel }
			actionText={ translate(
				"We're working on adding more storage options. In the meantime, manage your storage to make some room."
			) }
		/>
	);
};

export default ManageStorage;
