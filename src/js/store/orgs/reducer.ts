import { ObjectsAction } from '@/store/actions';
import { OrgsAction } from '@/store/orgs/actions';
import { LogoutAction } from '@/store/user/actions';
import {
  OBJECT_TYPES,
  ObjectTypes,
  ORG_TYPES,
  OrgTypes,
} from '@/utils/constants';

export interface Org {
  id: string;
  task: string;
  org_type: OrgTypes;
  owner: string;
  last_modified_at: string | null;
  expires_at: string | null;
  latest_commit: string;
  latest_commit_url: string;
  latest_commit_at: string | null;
  url: string | null;
  has_changes: boolean;
}

export interface OrgsByTask {
  [ORG_TYPES.DEV]: Org | null;
  [ORG_TYPES.QA]: Org | null;
}

export interface OrgState {
  [key: string]: OrgsByTask;
}

const defaultState = {};

const reducer = (
  orgs: OrgState = defaultState,
  action: ObjectsAction | LogoutAction | OrgsAction,
) => {
  switch (action.type) {
    case 'USER_LOGGED_OUT':
      return defaultState;
    case 'FETCH_OBJECTS_SUCCEEDED': {
      const {
        response,
        objectType,
        filters: { task },
      } = action.payload;
      if (objectType === OBJECT_TYPES.ORG && task) {
        return {
          ...orgs,
          [task]: {
            [ORG_TYPES.DEV]:
              (response &&
                (response as Org[]).find(
                  org => org.org_type === ORG_TYPES.DEV,
                )) ||
              null,
            [ORG_TYPES.QA]:
              (response &&
                (response as Org[]).find(
                  org => org.org_type === ORG_TYPES.QA,
                )) ||
              null,
          },
        };
      }
      return orgs;
    }
    case 'CREATE_OBJECT_SUCCEEDED': {
      const {
        object,
        objectType,
      }: { object: Org; objectType: ObjectTypes } = action.payload;
      if (objectType === OBJECT_TYPES.ORG && object) {
        const taskOrgs = orgs[object.task] || {
          [ORG_TYPES.DEV]: null,
          [ORG_TYPES.QA]: null,
        };
        return {
          ...orgs,
          [object.task]: {
            ...taskOrgs,
            [object.org_type]: object,
          },
        };
      }
      return orgs;
    }
    case 'SCRATCH_ORG_PROVISIONED': {
      const org = action.payload;
      const taskOrgs = orgs[org.task] || {
        [ORG_TYPES.DEV]: null,
        [ORG_TYPES.QA]: null,
      };
      return {
        ...orgs,
        [org.task]: {
          ...taskOrgs,
          [org.org_type]: org,
        },
      };
    }
    case 'SCRATCH_ORG_PROVISION_FAILED': {
      const org = action.payload;
      const taskOrgs = orgs[org.task] || {
        [ORG_TYPES.DEV]: null,
        [ORG_TYPES.QA]: null,
      };
      return {
        ...orgs,
        [org.task]: {
          ...taskOrgs,
          [org.org_type]: null,
        },
      };
    }
  }
  return orgs;
};

export default reducer;