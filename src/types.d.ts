export type ResourceCode =
  | 'view-app'
  | 'nubly-research'
  | 'data-room'
  | 'investor-relations';

export type FirestoreCollection = 'accessCodes';

export type AccessRequestObject = {
  accessCode: string;
  resource: ResourceCode;
};

export type LocalStorageKey =
  | 'nubly-research-access-granted'
  | 'nubly-view-app-access-granted'
  | 'nubly-data-room-access-granted'
  | 'investor-relations-access-granted'
  | 'permissions'
  | 'accessCode';

export interface AccessCodeFields {
  firstName: string;
  lastName: string;
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

export type ResourcePermissions = {
  'nubly-research'?: NublyResearchPermissions;
  'view-app'?: ViewAppPermissions;
  // Add more resources as needed
  [resource: string]: NublyResearchPermissions | ViewAppPermissions | undefined; // fallback for extensibility
};

export type AccessCodeObject = {
  accessCode: string;
  firstName: string;
  lastName: string;
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
