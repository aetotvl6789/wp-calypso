/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer, SubTitle, Title } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { delay } from 'lodash';
import React, { useEffect, useState } from 'react';
import AnalysisProgress from 'calypso/blocks/import-light/analysis-progress';
import Capture from 'calypso/blocks/import-light/capture';
import Colors from 'calypso/blocks/import-light/colors';
import Summary from 'calypso/blocks/import-light/summary';
import DocumentHead from 'calypso/components/data/document-head';
import { ANALYZER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ProgressState } from './types';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const ImportLight: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const { navigation } = props;

	const [ url, setUrl ] = useState( '' );
	const [ progressState, setProgressState ] = useState< ProgressState >( 'capture' );
	const { analyzeColors } = useDispatch( ANALYZER_STORE );
	const colorsData = useSelect( ( select ) => select( ANALYZER_STORE ).getSiteColors( url ) );
	const fetchingColorsInProgress = useSelect( ( select ) =>
		select( ANALYZER_STORE ).isSiteColorsInAnalysis()
	);

	useEffect( () => {
		if ( progressState === 'scanning' && ! fetchingColorsInProgress ) setProgressState( 'colors' );
	} );

	function onUrlEnter( url: string ) {
		setUrl( url );
		analyzeColors( url );
		setProgressState( 'scanning' );
	}

	function onColorAnimationFinish() {
		delay( () => setProgressState( 'summary' ), 2000 );
	}

	function renderStepContent() {
		let percentage = 2;

		if ( progressState === 'scanning' ) percentage = 33;
		else if ( progressState === 'colors' ) percentage = 67;
		else percentage = 99;

		switch ( progressState ) {
			case 'scanning':
			case 'colors':
				return (
					<AnalysisProgress percentage={ percentage }>
						<Title>{ __( 'Scanning your site' ) }</Title>
						{ progressState === 'scanning' && <SubTitle>{ url }</SubTitle> }
						{ progressState === 'colors' && (
							<Colors
								colors={ colorsData?.logo || [] }
								onColorAnimationFinish={ onColorAnimationFinish }
							/>
						) }
					</AnalysisProgress>
				);

			case 'summary':
				return <Summary />;

			case 'capture':
			default:
				return <Capture onInputEnter={ onUrlEnter } />;
		}
	}

	return (
		<>
			<DocumentHead title={ __( 'Import light' ) } />

			<StepContainer
				stepName={ 'import-step' }
				className={ 'import__onboarding-page' }
				hideSkip={ false }
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ __( 'Skip this step' ) }
				isFullLayout={ true }
				stepContent={ renderStepContent() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default ImportLight;
