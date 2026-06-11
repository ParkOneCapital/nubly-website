export declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, string | number | boolean | undefined>,
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}

export type SectionId =
  | 'home'
  | 'savings'
  | 'investing'
  | 'chat'
  | 'notifications'
  | 'end'
  | 'faqs';

export type ResourceCode =
  | 'view-app'
  | 'nubly-research'
  | 'data-room'
  | 'feedback';

export type FirestoreCollection =
  | 'accessCodes'
  | 'feedback'
  | 'signUps'
  | 'researchLogins'
  | 'viewAppLogins'
  | 'researchInteractions';

export type AccessRequestObject = {
  accessCode: string;
  resource: ResourceCode;
};

export type LocalStorageKey =
  | 'nubly-research-access-granted'
  | 'nubly-view-app-access-granted'
  | 'nubly-data-room-access-granted'
  | 'nubly-feedback-access-granted'
  | 'permissions'
  | 'accessCode';

export type LocalStorageValueMap = {
  'nubly-research-access-granted': 'true';
  'nubly-view-app-access-granted': 'true';
  'nubly-data-room-access-granted': 'true';
  'nubly-feedback-access-granted': 'true';
  permissions: ResourcePermissions;
  accessCode: AccessCodeObject;
};

/** Response shape from the verifyAccess Firebase function. */
export type VerifyAccessResponse = {
  hasPermission?: boolean;
  error?: string;
  /** Intentional API spelling — matches backend field name. */
  permisions?: ResourcePermissions;
  accessCode?: AccessCodeObject;
};

export interface AccessCodeFields {
  firstName: string;
  lastName: string;
  email?: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  permissions: ResourcePermissions;
}

export type AccessCodeDocument = AccessCodeFields & {
  id: string;
};

export type NublyResearchPermissions = {
  [documentName: string]: DocumentPermission;
};

export type DocumentPermission = {
  view?: boolean;
  download?: boolean;
};

export type ViewAppPermissions = {
  view?: boolean;
};

export type FeedbackPermissions = {
  access?: boolean;
};

export type ResourcePermissions = {
  'nubly-research'?: NublyResearchPermissions;
  'view-app'?: ViewAppPermissions;
  feedback?: FeedbackPermissions;
  // Add more resources as needed
  [resource: string]:
    | NublyResearchPermissions
    | ViewAppPermissions
    | FeedbackPermissions
    | Record<string, unknown>
    | undefined; // fallback for extensibility
};

export type AccessCodeObject = {
  accessCode: string;
  firstName: string;
  lastName: string;
  email?: string;
};

export type FeedbackQuestionType = 'single_select' | 'text';

export type FeedbackResponseItem = {
  type: FeedbackQuestionType;
  value: string;
};

/** Keys are generic question ids (e.g. q1, q2), not semantic names. */
export type FeedbackResponses = Record<string, FeedbackResponseItem>;

export type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type FeedbackDocument = {
  accessCode: string;
  firstName: string;
  lastName: string;
  email: string;
  surveyVersion: string;
  responses: FeedbackResponses;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
};

/**
 * accessCode: {
 *  bob123: {
 *    firstName: 'Bob',
 *    lastName: 'Smith',
 *    code: 'bob123',
 *    createdAt: '2021-01-01',
 *    updatedAt: '2021-01-01',
 *    permissions: {
 *      'nubly-research': {
 *        access: true,
 *        'baas-overview': {
 *          view: true,
 *          download: true,
 *        },
 *        'baas-transformation-strategy': {
 *          view: true,
 *          download: true,
 *        },
 *      },
 *      'view-app': {
 *        access: true,
 *        view: true,
 *      },
 *    },
 *  }
 * }
 *
 */
