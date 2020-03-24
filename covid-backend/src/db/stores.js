import { Store } from './storage';
/**
 * @typedef {import('./storage').DynamoStore<K,V>} DynamoStore<K,V>
 * @template K, V
 */

/**
 * @typedef {"dontHave" | "mayHave" | "have" | "had" | "N/A"} CovidStatusValue
 * 
 * @typedef CovidStatus
 * @property {CovidStatusValue} status Covid Status Value
 * @property {?Date} since Date since such status
 * 
 * @typedef CovidRiskScore
 * @property {number} value Covid risk score value.
 * @property {?Date} date Date for the risk value. Not WHEN it was calculated, but the date at which the value is valid.
 * 
 * @typedef User
 * @property {string} id The user's ID
 * @property {string} email The user's email
 * @property {?string} name The user's full name
 * @property {?string} givenName The user's first name
 * @property {?string} familyName The user's last name
 * @property {?string} picture The URL of the user's profile picture
 * @property {?string} locale The user's locale, represented by a BCP 47 language tag
 * @property {?Array<string>} dataHashes Hashes for each data package uploaded by the user
 * @property {?Array<CovidStatus>} covidStatuses Covid statuses reported by the user
 * @property {?Array<CovidRiskScore>} riskScores User Covid risk scores in ascending chronological order (last is newest).
 */

 /**
 * @type {DynamoStore<string, User>}
 * @desc key: User ID created by Google Sign in
 * */
export const users = new Store('Users');

export const initStores = async () => {
  await users.init();
};