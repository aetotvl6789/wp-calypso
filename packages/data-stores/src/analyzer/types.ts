import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

interface Color {
	name: string;
	hex: string;
}

export interface ColorsData {
	background: Color[];
	link: Color[];
	text: Color[];
	preferred_palette: {
		background: Color;
		link: Color;
		text: Color;
	};
}

export interface AnalyzeColorsResponse {
	url: string;
	status: string;
	colors: ColorsData;
}

type SiteUrl = string;
export type ColorsState = {
	analyzing?: boolean;
	colors?: { [ key: SiteUrl ]: ColorsData };
};

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
