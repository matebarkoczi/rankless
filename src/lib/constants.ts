export const APP_NAME = 'Rankless';
const LOCAL = false;
export const STORE_URL = LOCAL ? 'http://0.0.0.0:8000' : 'https://tmp-borza-public-cyx.s3.amazonaws.com/quercus-basis-v5';

export const INSTITUTION_TYPE = 'institutions';
export const CONCEPT_TYPE = 'main-concepts';
export const SUBCONCEPT_TYPE = 'sub-concepts'
export const SOURCE_TYPE = 'sources';
export const COUNTRY_TYPE = 'countries';


export type EntityType =
    typeof INSTITUTION_TYPE |
    typeof CONCEPT_TYPE |
    typeof SUBCONCEPT_TYPE |
    typeof COUNTRY_TYPE


export const DEFAULT_LIMIT_N = 10;
export const MAX_LEVEL_COUNT = 4;
