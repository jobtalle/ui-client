import {FC, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useAuth} from 'react-oidc-context';

import {useStore} from 'shared/hooks';
import {ROUTES} from 'core/constants';

const LoginCallback: FC = () => {
  const {loginStore} = useStore().authStore_OLD;
  const {search} = useLocation();
  const history = useHistory();
  const auth = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(search as string);
    if (urlParams.get('error')) {
      loginStore.setIsSessionExpired(true);
      history.push(ROUTES.login);
    }
  }, [history, loginStore, search]);

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      // @ts-ignore: state has type unknown
      const origin = auth.user?.state?.from || ROUTES.base;
      history.push(origin);
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, history]);

  return <></>;
};
export default LoginCallback;
