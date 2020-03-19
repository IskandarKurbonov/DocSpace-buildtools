import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import { fetchMyFolder, fetchRootFolders, fetchFiles } from "./store/files/actions";
import config from "../package.json";
import "./custom.scss";
import App from "./App";

import * as serviceWorker from "./serviceWorker";
import { store as commonStore, constants, ErrorBoundary, history, api } from "asc-web-common";
import { getFilterByLocation } from "./helpers/converters";
const { setIsLoaded, getUserInfo, setCurrentProductId, setCurrentProductHomePage, getPortalPasswordSettings, getPortalCultures } = commonStore.auth.actions;
const { AUTH_KEY } = constants;
const { FilesFilter } = api;

const token = localStorage.getItem(AUTH_KEY);

if (token) {
  getUserInfo(store.dispatch)
    .then(() => getPortalPasswordSettings(store.dispatch))
    .then(() => getPortalCultures(store.dispatch))
    .then(() => fetchMyFolder(store.dispatch))
    .then(() => fetchRootFolders(store.dispatch))
    .then(() => {
      const re = new RegExp(`${config.homepage}((/?)$|/filter)`, "gm");
      const match = window.location.pathname.match(re);

      if (match && match.length > 0) {
        const newFilter = getFilterByLocation(window.location);
        if (newFilter) {
          return Promise.resolve(newFilter);
        }
        else {
          return Promise.resolve(FilesFilter.getDefault());
        }
      }
      else {
        return Promise.resolve(FilesFilter.getDefault());
      }
    })
    .then(filter => {
      if (filter && filter.authorType) {
        const newFilter = filter;
        const authorType = newFilter.authorType
        const indexOfUnderscore = authorType.indexOf('_');
        const type = authorType.slice(0, indexOfUnderscore);
        const itemId = authorType.slice(indexOfUnderscore + 1);
        if (!itemId) {
          newFilter.authorType = null;
          return Promise.resolve(newFilter);
        }
        else {
          const result = {
            type,
            itemId,
            filter: newFilter
          }
          return Promise.resolve(result);
        }
      }
      else {
        return Promise.resolve(filter);
      }
    })
    .then(data => {
      if (data instanceof FilesFilter) return Promise.resolve(data);
      const { filter, itemId, type } = data;
      const newFilter = filter ? filter.clone() : FilesFilter.getDefault();
      switch (type) {
        case 'group':
          return Promise.all([api.groups.getGroup(itemId), newFilter]);
        case 'user':
          return Promise.all([api.people.getUserById(itemId), newFilter]);
        default:
          return Promise.resolve(newFilter);
      }
    })
    .then(data => {
      if (data instanceof FilesFilter) return Promise.resolve(data);
      const result = data[0];
      const filter = data[1];
      const type = result.displayName ? 'user' : 'group';
      const selectedItem = {
        key: result.id,
        label: type === 'user' ? result.displayName : result.name,
        type
      };
      filter.selectedItem = selectedItem;
      return Promise.resolve(filter);
    })
    .then(filter => {
      const folderId = window.location.hash.slice(1) || '@my';
      return fetchFiles(folderId, filter, store.dispatch);
    })
    .then(() => {
      store.dispatch(setCurrentProductHomePage(config.homepage));
      store.dispatch(setCurrentProductId("e67be73d-f9ae-4ce1-8fec-1880cb518cb4"));
      store.dispatch(setIsLoaded(true));
    });
}
else {
  store.dispatch(setIsLoaded(true));
};

ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();