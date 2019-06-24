import { Dispatch } from 'redux';

import apiFetch from 'utils/api';
import { User } from 'store/user/reducer';

interface LoginAction {
  type: 'USER_LOGGED_IN';
  payload: User;
}
interface LogoutAction {
  type: 'USER_LOGGED_OUT';
}
interface RefecthDataAction {
  type:
    | 'REFETCH_DATA_STARTED'
    | 'REFETCH_DATA_SUCCEEDED'
    | 'REFETCH_DATA_FAILED';
}
export type UserAction = LoginAction | LogoutAction | RefecthDataAction;

export const login = (payload: User): LoginAction => {
  if (window.Raven && window.Raven.isSetup()) {
    window.Raven.setUserContext(payload);
  }
  /* istanbul ignore else */
  if (payload && window.socket) {
    window.socket.subscribe({
      model: 'user',
      id: payload.id,
    });
  }
  return {
    type: 'USER_LOGGED_IN',
    payload,
  };
};

export const logout = () => (dispatch: Dispatch): Promise<any> =>
  apiFetch(window.api_urls.account_logout(), {
    method: 'POST',
  }).then(() => {
    /* istanbul ignore else */
    if (window.socket) {
      window.socket.reconnect();
    }
    if (window.Raven && window.Raven.isSetup()) {
      window.Raven.setUserContext();
    }
    return dispatch({ type: 'USER_LOGGED_OUT' });
  });

export const refetchAllData = () => async (
  dispatch: Dispatch,
): Promise<any> => {
  dispatch({ type: 'REFETCH_DATA_STARTED' });
  try {
    const payload = await apiFetch(window.api_urls.user());
    dispatch({ type: 'REFETCH_DATA_SUCCEEDED' });
    dispatch({ type: 'USER_LOGGED_OUT' });
    if (!payload) {
      return null;
    }
    return dispatch(login(payload));
  } catch (err) {
    dispatch({ type: 'REFETCH_DATA_FAILED' });
    throw err;
  }
};