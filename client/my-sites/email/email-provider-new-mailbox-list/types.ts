import type { TranslateResult } from 'i18n-calypso';

export type Nullable< T > = T | null;
export type StringOrBoolean = string | boolean;

export interface MailboxField {
	value: StringOrBoolean;
	error: Nullable< TranslateResult >;
}

export interface Mailbox {
	alternativeEmail: MailboxField;
	domain: MailboxField;
	firstName: MailboxField;
	isAdmin: MailboxField;
	lastName: MailboxField;
	mailbox: MailboxField;
	password: MailboxField;
	uuid: string;
}

export type { TranslateResult };