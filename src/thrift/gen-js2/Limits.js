//
// Autogenerated by Thrift Compiler (0.6.0-en-exported)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//


  // Define types and services

  var Thrift = require('../thrift');

  module.exports.EDAM_ATTRIBUTE_LEN_MIN = 1;

  module.exports.EDAM_ATTRIBUTE_LEN_MAX = 4096;

  module.exports.EDAM_ATTRIBUTE_REGEX = '^[^\\p{Cc}\\p{Zl}\\p{Zp}]{1,4096}$';

  module.exports.EDAM_ATTRIBUTE_LIST_MAX = 100;

  module.exports.EDAM_ATTRIBUTE_MAP_MAX = 100;

  module.exports.EDAM_GUID_LEN_MIN = 36;

  module.exports.EDAM_GUID_LEN_MAX = 36;

  module.exports.EDAM_GUID_REGEX = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  module.exports.EDAM_EMAIL_LEN_MIN = 6;

  module.exports.EDAM_EMAIL_LEN_MAX = 255;

  module.exports.EDAM_EMAIL_LOCAL_REGEX = '^[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+)*$';

  module.exports.EDAM_EMAIL_DOMAIN_REGEX = '^[A-Za-z0-9-]*[A-Za-z0-9](\\.[A-Za-z0-9-]*[A-Za-z0-9])*\\.([A-Za-z]{2,})$';

  module.exports.EDAM_EMAIL_REGEX = '^[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]*[A-Za-z0-9](\\.[A-Za-z0-9-]*[A-Za-z0-9])*\\.([A-Za-z]{2,})$';

  module.exports.EDAM_VAT_REGEX = '^(AT)?U[0-9]{8}$|^(BE)?0?[0-9]{9}$|^(BG)?[0-9]{9,10}$|^(CY)?[0-9]{8}L$|^(CZ)?[0-9]{8,10}$|^(DE)?[0-9]{9}$|^(DK)?[0-9]{8}$|^(EE)?[0-9]{9}$|^(EL|GR)?[0-9]{9}$|^(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]$|^(FI)?[0-9]{8}$|^(FR)?[0-9A-Z]{2}[0-9]{9}$|^(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})$|^(HU)?[0-9]{8}$|^(IE)?[0-9]S[0-9]{5}L$|^(IT)?[0-9]{11}$|^(LT)?([0-9]{9}|[0-9]{12})$|^(LU)?[0-9]{8}$|^(LV)?[0-9]{11}$|^(MT)?[0-9]{8}$|^(NL)?[0-9]{9}B[0-9]{2}$|^(PL)?[0-9]{10}$|^(PT)?[0-9]{9}$|^(RO)?[0-9]{2,10}$|^(SE)?[0-9]{12}$|^(SI)?[0-9]{8}$|^(SK)?[0-9]{10}$|^[0-9]{9}MVA$|^[0-9]{6}$|^CHE[0-9]{9}(TVA|MWST|IVA)$';

  module.exports.EDAM_TIMEZONE_LEN_MIN = 1;

  module.exports.EDAM_TIMEZONE_LEN_MAX = 32;

  module.exports.EDAM_TIMEZONE_REGEX = '^([A-Za-z_-]+(/[A-Za-z_-]+)*)|(GMT(-|\\+)[0-9]{1,2}(:[0-9]{2})?)$';

  module.exports.EDAM_MIME_LEN_MIN = 3;

  module.exports.EDAM_MIME_LEN_MAX = 255;

  module.exports.EDAM_MIME_REGEX = '^[A-Za-z]+/[A-Za-z0-9._+-]+$';

  module.exports.EDAM_MIME_TYPE_GIF = 'image/gif';

  module.exports.EDAM_MIME_TYPE_JPEG = 'image/jpeg';

  module.exports.EDAM_MIME_TYPE_PNG = 'image/png';

  module.exports.EDAM_MIME_TYPE_TIFF = 'image/tiff';

  module.exports.EDAM_MIME_TYPE_WAV = 'audio/wav';

  module.exports.EDAM_MIME_TYPE_MP3 = 'audio/mpeg';

  module.exports.EDAM_MIME_TYPE_AMR = 'audio/amr';

  module.exports.EDAM_MIME_TYPE_AAC = 'audio/aac';

  module.exports.EDAM_MIME_TYPE_M4A = 'audio/mp4';

  module.exports.EDAM_MIME_TYPE_MP4_VIDEO = 'video/mp4';

  module.exports.EDAM_MIME_TYPE_INK = 'application/vnd.evernote.ink';

  module.exports.EDAM_MIME_TYPE_PDF = 'application/pdf';

  module.exports.EDAM_MIME_TYPE_DEFAULT = 'application/octet-stream';

  module.exports.EDAM_MIME_TYPES = ['image/gif','image/jpeg','image/png','audio/wav','audio/mpeg','audio/amr','application/vnd.evernote.ink','application/pdf','video/mp4','audio/aac','audio/mp4'];

  module.exports.EDAM_INDEXABLE_RESOURCE_MIME_TYPES = ['application/msword','application/mspowerpoint','application/excel','application/vnd.ms-word','application/vnd.ms-powerpoint','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.apple.pages','application/vnd.apple.numbers','application/vnd.apple.keynote','application/x-iwork-pages-sffpages','application/x-iwork-numbers-sffnumbers','application/x-iwork-keynote-sffkey'];

  module.exports.EDAM_INDEXABLE_PLAINTEXT_MIME_TYPES = ['application/x-sh','application/x-bsh','application/sql','application/x-sql'];

  module.exports.EDAM_SEARCH_QUERY_LEN_MIN = 0;

  module.exports.EDAM_SEARCH_QUERY_LEN_MAX = 1024;

  module.exports.EDAM_SEARCH_QUERY_REGEX = '^[^\\p{Cc}\\p{Zl}\\p{Zp}]{0,1024}$';

  module.exports.EDAM_HASH_LEN = 16;

  module.exports.EDAM_USER_USERNAME_LEN_MIN = 1;

  module.exports.EDAM_USER_USERNAME_LEN_MAX = 64;

  module.exports.EDAM_USER_USERNAME_REGEX = '^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$';

  module.exports.EDAM_USER_NAME_LEN_MIN = 1;

  module.exports.EDAM_USER_NAME_LEN_MAX = 255;

  module.exports.EDAM_USER_NAME_REGEX = '^[^\\p{Cc}\\p{Zl}\\p{Zp}]{1,255}$';

  module.exports.EDAM_TAG_NAME_LEN_MIN = 1;

  module.exports.EDAM_TAG_NAME_LEN_MAX = 100;

  module.exports.EDAM_TAG_NAME_REGEX = '^[^,\\p{Cc}\\p{Z}]([^,\\p{Cc}\\p{Zl}\\p{Zp}]{0,98}[^,\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_NOTE_TITLE_LEN_MIN = 1;

  module.exports.EDAM_NOTE_TITLE_LEN_MAX = 255;

  module.exports.EDAM_NOTE_TITLE_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,253}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_NOTE_CONTENT_LEN_MIN = 0;

  module.exports.EDAM_NOTE_CONTENT_LEN_MAX = 5242880;

  module.exports.EDAM_APPLICATIONDATA_NAME_LEN_MIN = 3;

  module.exports.EDAM_APPLICATIONDATA_NAME_LEN_MAX = 32;

  module.exports.EDAM_APPLICATIONDATA_VALUE_LEN_MIN = 0;

  module.exports.EDAM_APPLICATIONDATA_VALUE_LEN_MAX = 4092;

  module.exports.EDAM_APPLICATIONDATA_ENTRY_LEN_MAX = 4095;

  module.exports.EDAM_APPLICATIONDATA_NAME_REGEX = '^[A-Za-z0-9_.-]{3,32}$';

  module.exports.EDAM_APPLICATIONDATA_VALUE_REGEX = '^[\\p{Space}[^\\p{Cc}]]{0,4092}$';

  module.exports.EDAM_NOTEBOOK_NAME_LEN_MIN = 1;

  module.exports.EDAM_NOTEBOOK_NAME_LEN_MAX = 100;

  module.exports.EDAM_NOTEBOOK_NAME_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,98}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_NOTEBOOK_STACK_LEN_MIN = 1;

  module.exports.EDAM_NOTEBOOK_STACK_LEN_MAX = 100;

  module.exports.EDAM_NOTEBOOK_STACK_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,98}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_PUBLISHING_URI_LEN_MIN = 1;

  module.exports.EDAM_PUBLISHING_URI_LEN_MAX = 255;

  module.exports.EDAM_PUBLISHING_URI_REGEX = '^[a-zA-Z0-9.~_+-]{1,255}$';

  module.exports.EDAM_PUBLISHING_URI_PROHIBITED = ['.','..'];

  module.exports.EDAM_PUBLISHING_DESCRIPTION_LEN_MIN = 1;

  module.exports.EDAM_PUBLISHING_DESCRIPTION_LEN_MAX = 200;

  module.exports.EDAM_PUBLISHING_DESCRIPTION_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,198}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_SAVED_SEARCH_NAME_LEN_MIN = 1;

  module.exports.EDAM_SAVED_SEARCH_NAME_LEN_MAX = 100;

  module.exports.EDAM_SAVED_SEARCH_NAME_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,98}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_USER_PASSWORD_LEN_MIN = 6;

  module.exports.EDAM_USER_PASSWORD_LEN_MAX = 64;

  module.exports.EDAM_USER_PASSWORD_REGEX = '^[A-Za-z0-9!#$%&\'()*+,./:;<=>?@^_`{|}~\\[\\]\\\\-]{6,64}$';

  module.exports.EDAM_BUSINESS_URI_LEN_MAX = 32;

  module.exports.EDAM_BUSINESS_MARKETING_CODE_REGEX_PATTERN = '[A-Za-z0-9-]{1,128}';

  module.exports.EDAM_NOTE_TAGS_MAX = 100;

  module.exports.EDAM_NOTE_RESOURCES_MAX = 1000;

  module.exports.EDAM_USER_TAGS_MAX = 100000;

  module.exports.EDAM_BUSINESS_TAGS_MAX = 100000;

  module.exports.EDAM_USER_SAVED_SEARCHES_MAX = 100;

  module.exports.EDAM_USER_NOTES_MAX = 100000;

  module.exports.EDAM_BUSINESS_NOTES_MAX = 500000;

  module.exports.EDAM_USER_NOTEBOOKS_MAX = 250;

  module.exports.EDAM_BUSINESS_NOTEBOOKS_MAX = 10000;

  module.exports.EDAM_USER_RECENT_MAILED_ADDRESSES_MAX = 10;

  module.exports.EDAM_USER_MAIL_LIMIT_DAILY_FREE = 50;

  module.exports.EDAM_USER_MAIL_LIMIT_DAILY_PREMIUM = 200;

  module.exports.EDAM_USER_UPLOAD_LIMIT_FREE = 62914560;

  module.exports.EDAM_USER_UPLOAD_LIMIT_PREMIUM = 10737418240;

  module.exports.EDAM_USER_UPLOAD_LIMIT_PLUS = 1073741824;

  module.exports.EDAM_USER_UPLOAD_SURVEY_THRESHOLD = 5368709120;

  module.exports.EDAM_USER_UPLOAD_LIMIT_BUSINESS = 10737418240;

  module.exports.EDAM_USER_UPLOAD_LIMIT_BUSINESS_PER_USER = 2147483647;

  module.exports.EDAM_NOTE_SIZE_MAX_FREE = 26214400;

  module.exports.EDAM_NOTE_SIZE_MAX_PREMIUM = 209715200;

  module.exports.EDAM_RESOURCE_SIZE_MAX_FREE = 26214400;

  module.exports.EDAM_RESOURCE_SIZE_MAX_PREMIUM = 209715200;

  module.exports.EDAM_USER_LINKED_NOTEBOOK_MAX = 100;

  module.exports.EDAM_USER_LINKED_NOTEBOOK_MAX_PREMIUM = 500;

  module.exports.EDAM_NOTEBOOK_BUSINESS_SHARED_NOTEBOOK_MAX = 5000;

  module.exports.EDAM_NOTEBOOK_PERSONAL_SHARED_NOTEBOOK_MAX = 500;

  module.exports.EDAM_NOTE_BUSINESS_SHARED_NOTE_MAX = 1000;

  module.exports.EDAM_NOTE_PERSONAL_SHARED_NOTE_MAX = 100;

  module.exports.EDAM_NOTE_CONTENT_CLASS_LEN_MIN = 3;

  module.exports.EDAM_NOTE_CONTENT_CLASS_LEN_MAX = 32;

  module.exports.EDAM_NOTE_CONTENT_CLASS_REGEX = '^[A-Za-z0-9_.-]{3,32}$';

  module.exports.EDAM_HELLO_APP_CONTENT_CLASS_PREFIX = 'evernote.hello.';

  module.exports.EDAM_FOOD_APP_CONTENT_CLASS_PREFIX = 'evernote.food.';

  module.exports.EDAM_CONTENT_CLASS_HELLO_ENCOUNTER = 'evernote.hello.encounter';

  module.exports.EDAM_CONTENT_CLASS_HELLO_PROFILE = 'evernote.hello.profile';

  module.exports.EDAM_CONTENT_CLASS_FOOD_MEAL = 'evernote.food.meal';

  module.exports.EDAM_CONTENT_CLASS_SKITCH_PREFIX = 'evernote.skitch';

  module.exports.EDAM_CONTENT_CLASS_SKITCH = 'evernote.skitch';

  module.exports.EDAM_CONTENT_CLASS_SKITCH_PDF = 'evernote.skitch.pdf';

  module.exports.EDAM_CONTENT_CLASS_PENULTIMATE_PREFIX = 'evernote.penultimate.';

  module.exports.EDAM_CONTENT_CLASS_PENULTIMATE_NOTEBOOK = 'evernote.penultimate.notebook';

  module.exports.EDAM_SOURCE_APPLICATION_POSTIT = 'postit';

  module.exports.EDAM_SOURCE_APPLICATION_MOLESKINE = 'moleskine';

  module.exports.EDAM_SOURCE_APPLICATION_EN_SCANSNAP = 'scanner.scansnap.evernote';

  module.exports.EDAM_SOURCE_APPLICATION_EWC = 'clipncite.web';

  module.exports.EDAM_SOURCE_OUTLOOK_CLIPPER = 'app.ms.outlook';

  module.exports.EDAM_NOTE_TITLE_QUALITY_UNTITLED = 0;

  module.exports.EDAM_NOTE_TITLE_QUALITY_LOW = 1;

  module.exports.EDAM_NOTE_TITLE_QUALITY_MEDIUM = 2;

  module.exports.EDAM_NOTE_TITLE_QUALITY_HIGH = 3;

  module.exports.EDAM_RELATED_PLAINTEXT_LEN_MIN = 1;

  module.exports.EDAM_RELATED_PLAINTEXT_LEN_MAX = 131072;

  module.exports.EDAM_RELATED_MAX_NOTES = 25;

  module.exports.EDAM_RELATED_MAX_NOTEBOOKS = 1;

  module.exports.EDAM_RELATED_MAX_TAGS = 25;

  module.exports.EDAM_RELATED_MAX_EXPERTS = 10;

  module.exports.EDAM_RELATED_MAX_RELATED_CONTENT = 10;

  module.exports.EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_LEN_MIN = 1;

  module.exports.EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_LEN_MAX = 200;

  module.exports.EDAM_BUSINESS_NOTEBOOK_DESCRIPTION_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,198}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_BUSINESS_PHONE_NUMBER_LEN_MAX = 20;

  module.exports.EDAM_PREFERENCE_NAME_LEN_MIN = 3;

  module.exports.EDAM_PREFERENCE_NAME_LEN_MAX = 32;

  module.exports.EDAM_PREFERENCE_VALUE_LEN_MIN = 1;

  module.exports.EDAM_PREFERENCE_VALUE_LEN_MAX = 1024;

  module.exports.EDAM_MAX_PREFERENCES = 100;

  module.exports.EDAM_MAX_VALUES_PER_PREFERENCE = 256;

  module.exports.EDAM_PREFERENCE_ONLY_ONE_VALUE_LEN_MAX = 16384;

  module.exports.EDAM_PREFERENCE_NAME_REGEX = '^[A-Za-z0-9_.-]{3,32}$';

  module.exports.EDAM_PREFERENCE_VALUE_REGEX = '^[^\\p{Cc}]{1,1024}$';

  module.exports.EDAM_PREFERENCE_ONLY_ONE_VALUE_REGEX = '^[^\\p{Cc}]{1,16384}$';

  module.exports.EDAM_PREFERENCE_SHORTCUTS = 'evernote.shortcuts';

  module.exports.EDAM_PREFERENCE_BUSINESS_DEFAULT_NOTEBOOK = 'evernote.business.notebook';

  module.exports.EDAM_PREFERENCE_BUSINESS_QUICKNOTE = 'evernote.business.quicknote';

  module.exports.EDAM_PREFERENCE_SHORTCUTS_MAX_VALUES = 250;

  module.exports.EDAM_DEVICE_ID_LEN_MAX = 32;

  module.exports.EDAM_DEVICE_ID_REGEX = '^[^\\p{Cc}]{1,32}$';

  module.exports.EDAM_DEVICE_DESCRIPTION_LEN_MAX = 64;

  module.exports.EDAM_DEVICE_DESCRIPTION_REGEX = '^[^\\p{Cc}]{1,64}$';

  module.exports.EDAM_SEARCH_SUGGESTIONS_MAX = 10;

  module.exports.EDAM_SEARCH_SUGGESTIONS_PREFIX_LEN_MAX = 1024;

  module.exports.EDAM_SEARCH_SUGGESTIONS_PREFIX_LEN_MIN = 2;

  module.exports.EDAM_FIND_CONTACT_DEFAULT_MAX_RESULTS = 100;

  module.exports.EDAM_FIND_CONTACT_MAX_RESULTS = 256;

  module.exports.EDAM_NOTE_LOCK_VIEWERS_NOTES_MAX = 150;

  module.exports.EDAM_GET_ORDERS_MAX_RESULTS = 2000;

  module.exports.EDAM_MESSAGE_BODY_LEN_MAX = 2048;

  module.exports.EDAM_MESSAGE_BODY_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,2046}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_MESSAGE_RECIPIENTS_MAX = 50;

  module.exports.EDAM_MESSAGE_ATTACHMENTS_MAX = 100;

  module.exports.EDAM_MESSAGE_ATTACHMENT_TITLE_LEN_MAX = 255;

  module.exports.EDAM_MESSAGE_ATTACHMENT_TITLE_REGEX = '^[^\\p{Cc}\\p{Z}]([^\\p{Cc}\\p{Zl}\\p{Zp}]{0,253}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_MESSAGE_ATTACHMENT_SNIPPET_LEN_MAX = 2048;

  module.exports.EDAM_MESSAGE_ATTACHMENT_SNIPPET_REGEX = '^[^\\p{Cc}\\p{Z}]([\\n[^\\p{Cc}\\p{Zl}\\p{Zp}]]{0,2046}[^\\p{Cc}\\p{Z}])?$';

  module.exports.EDAM_USER_PROFILE_PHOTO_MAX_BYTES = 716800;

  module.exports.EDAM_PROMOTION_ID_LEN_MAX = 32;

  module.exports.EDAM_PROMOTION_ID_REGEX = '^[A-Za-z0-9_.-]{1,32}$';

  module.exports.EDAM_APP_RATING_MIN = 1;

  module.exports.EDAM_APP_RATING_MAX = 5;

  module.exports.EDAM_SNIPPETS_NOTES_MAX = 24;

  module.exports.EDAM_CONNECTED_IDENTITY_REQUEST_MAX = 100;

