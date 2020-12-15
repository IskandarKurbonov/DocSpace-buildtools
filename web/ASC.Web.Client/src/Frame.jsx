import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Router, Switch } from "react-router-dom";
import NavMenu from "@appserver/common/src/components/NavMenu";
import Main from "@appserver/common/src/components/Main";
import Box from "@appserver/components/src/components/box";
import PrivateRoute from "@appserver/common/src/components/PrivateRoute";
import PublicRoute from "@appserver/common/src/components/PublicRoute";
import ErrorBoundary from "@appserver/common/src/components/ErrorBoundary";
import history from "@appserver/common/src/history";
import toastr from "@appserver/common/src/components/Toast/toastr";
import {
  setIsLoaded,
  getUser,
  getPortalSettings,
  getModules,
  getIsAuthenticated,
} from "@appserver/common/src/store/auth/actions";
import { updateTempContent } from "@appserver/common/src/utils";

const Home = React.lazy(() => import("studio/home"));
const Login = React.lazy(() => import("login/page"));
const People = React.lazy(() => import("people/page"));
const Files = React.lazy(() => import("files/page"));

const HomeRoute = () => (
  <React.Suspense fallback={null}>
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  </React.Suspense>
);

const LoginRoute = () => (
  <React.Suspense fallback={null}>
    <ErrorBoundary>
      <Login />
    </ErrorBoundary>
  </React.Suspense>
);

const PeopleRoute = () => (
  <React.Suspense fallback={null}>
    <ErrorBoundary>
      <People />
    </ErrorBoundary>
  </React.Suspense>
);

const FilesRoute = () => (
  <React.Suspense fallback={null}>
    <ErrorBoundary>
      <Files />
    </ErrorBoundary>
  </React.Suspense>
);

const Frame = ({ items = [], page = "home", ...rest }) => {
  useEffect(() => {
    //utils.removeTempContent();

    const {
      getPortalSettings,
      getUser,
      getModules,
      setIsLoaded,
      getIsAuthenticated,
    } = rest;

    getIsAuthenticated()
      .then((isAuthenticated) => {
        if (isAuthenticated) updateTempContent(isAuthenticated);

        const requests = [];
        if (!isAuthenticated) {
          requests.push(getPortalSettings());
        } else if (
          !window.location.pathname.includes("confirm/EmailActivation")
        ) {
          requests.push(getUser());
          requests.push(getPortalSettings());
          requests.push(getModules());
        }

        return Promise.all(requests).finally(() => {
          updateTempContent();
          setIsLoaded();
        });
      })
      .catch((err) => toastr.error(err.message));
  }, []);

  return (
    <Router history={history}>
      <Box>
        <NavMenu />
        <Main>
          <Switch>
            <PrivateRoute
              exact
              path={["/", "/error=:error"]}
              component={HomeRoute}
            />
            <PrivateRoute
              path={["/products/people", "/products/people/filter"]}
              component={PeopleRoute}
            />
            <PrivateRoute
              path={["/products/files", "/products/files/filter"]}
              component={FilesRoute}
            />
            <PublicRoute
              exact
              path={[
                "/login",
                "/login/error=:error",
                "/login/confirmed-email=:confirmedEmail",
              ]}
              component={LoginRoute}
            />
          </Switch>
        </Main>
      </Box>
    </Router>
  );
};

const mapStateToProps = (state) => {
  const { modules, isLoaded, settings } = state.auth;
  const { organizationName } = settings;
  return {
    modules,
    isLoaded,
    organizationName,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getIsAuthenticated: () => getIsAuthenticated(dispatch),
    getPortalSettings: () => getPortalSettings(dispatch),
    getUser: () => getUser(dispatch),
    getModules: () => getModules(dispatch),
    setIsLoaded: () => dispatch(setIsLoaded(true)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Frame);
