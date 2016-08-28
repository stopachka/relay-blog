import {App, PostIndex, PostShow, PostNew} from './components';
import Relay, {isContainer, RootContainer} from 'react-relay';
import {match, browserHistory, Router, Route, IndexRoute} from 'react-router';
import {Provider} from 'react-redux';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const ViewerQuery = {
  viewer(Component, params) {
    return Relay.QL`
      query {
        viewer {
          ${Component.getFragment('viewer', params)}
        }
      }
    `;
  },
};

const PostQuery = {
  post(Component) {
    return Relay.QL`
      query {
        post(globalId: $id) {
          ${Component.getFragment('post')}
        }
      }
    `;
  },
};


const routes =  (
  <Route path="/" component={App}>
    <IndexRoute
      name="posts-index"
      component={PostIndex}
      queries={ViewerQuery}
    />
    <Route
      name="post-show"
      path="post/:id"
      component={PostShow}
      queries={PostQuery}
    />
    <Route
      name="post-new"
      path="new"
      component={PostNew}
      queries={ViewerQuery}
    />
  </Route>
);

export function useRelay(Component, props) {
  const pass = localStorage.getItem('pass');
  if (!isContainer(Component)) return <Component {...props}  pass={pass} />
  const {location, params, route} = props;
  const {name, queries} = route;
  const relayParams = {
    ...params,
    first: location.query.first ? +location.query.first : 10
  }
  return (
    <RootContainer
      Component={Component}
      renderFetched={
        (data) => <Component {...props} {...data} pass={pass} />
      }
      route={{name, params: relayParams, queries}}
    />
  );
}

match({history: browserHistory, routes}, (err, redirect, props) => {
  ReactDOM.render(
    <Router
      createElement={useRelay}
      {...props}
    />,
    document.getElementById('react-root'),
  );
});
