import _ from 'lodash';
import {introspectionQuery} from 'graphql/utilities'
import express from 'express';
import fs from 'fs';
import {graphql} from 'graphql';
import gulp from 'gulp';
import nodemon from 'nodemon';
import path from 'path';
import Schema from './app/data';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleWare from 'webpack-hot-middleware';
import rimraf from 'rimraf';

// ------------------------------------------------------------
// Tasks

gulp.on('err', () => process.exit(0))

gulp.task('clean', done => {
  rimraf.sync('build');
  fs.mkdirSync('build');
  done();
});

gulp.task('schema-build', done => {
  graphql(Schema, introspectionQuery).then(
    (res) => {
      fs.writeFileSync(
        path.join(__dirname, 'build/relayPlugin.js'),
        `
          var makeRelayPlugin = require('babel-relay-plugin');
          var schema = ${JSON.stringify(res, null, 2)}

          module.exports = makeRelayPlugin(schema.data);
        `
      );
      done();
    }
  );
});

gulp.task('server-build', done => {
  webpack(SERVER_PROD_CONFIG).run(cb(done));
});

gulp.task('client-build', done => {
  webpack(CLIENT_PROD_CONFIG).run(cb(done));
});

gulp.task('build', ['clean', 'schema-build', 'server-build', 'client-build']);

gulp.task('server-watch', done => {
  const doneOnce = _.once(done);
  webpack(SERVER_DEV_CONFIG).watch(100, (err, stats) => {
    nodemon.restart();
    cb(doneOnce)(err, stats);
  });
});

gulp.task('client-watch', done => done(runHotServer()));

gulp.task(
  'default',
  ['schema-build', 'server-watch', 'client-watch'],
  () => {
    nodemon({
      execMap: {js: 'node'},
      script: path.join(__dirname, 'build/server'),
    }).on('restart', () => console.log('[nodemon] restart'));
});

const cb = (done, txt) => (err, stats) => {
  console.log(err || stats.toString());
  done();
}

// ------------------------------------------------------------
// Hot Loading Server

const HOT_SERVER_PORT = 3000;
const HOT_SERVER_URL = `http://localhost:${HOT_SERVER_PORT}`;

function runHotServer() {
  const opts = {
    hot: true,
    publicPath: CLIENT_DEV_CONFIG.output.publicPath,
    headers: {'Access-Control-Allow-Origin': '*'},
  };
  const app = new express();
  const compiler = webpack(CLIENT_DEV_CONFIG);
  app.use(webpackDevMiddleware(compiler, opts));
  app.use(webpackHotMiddleWare(compiler));
  app.listen(HOT_SERVER_PORT, (err) => {
    console.log(err || `[webpack-hot-devserver] running on ${HOT_SERVER_PORT}`);
  });
}

// ------------------------------------------------------------
// Webpack

const isProd = process.env.NODE_ENV === 'production';
const BABEL_QUERY = JSON.parse(fs.readFileSync('.babelrc'));
const BABEL_LOADER = {
  loader: 'babel',
  test: /\.js$/,
  exclude: /node_modules/,
  query: BABEL_QUERY,
};

// Client

const CLIENT_OUTPUT = {
  path: path.join(__dirname, 'build'),
  filename: 'client.js'
};

const CLIENT_ENTRY = './app/client.js';

const CLIENT_DEV_CONFIG = {
  entry: [
    CLIENT_ENTRY,
    `webpack-hot-middleware/client?path=${HOT_SERVER_URL}/__webpack_hmr`,
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    ...CLIENT_OUTPUT,
    publicPath: `${HOT_SERVER_URL}/build/`,
  },
  module: {
    loaders: [
      {
        ...BABEL_LOADER,
        query: {
          ...BABEL_QUERY,
          presets: [...BABEL_QUERY.presets, 'react-hmre'],
          plugins: ['./build/relayPlugin', ...BABEL_QUERY.plugins]
        },
      },
    ],
  },
}

const CLIENT_PROD_CONFIG = {
  entry: [CLIENT_ENTRY],
  output: CLIENT_OUTPUT,
  module: {
    loaders: [
      {
        ...BABEL_LOADER,
        query: {
          ...BABEL_QUERY,
          plugins: ['./build/relayPlugin', ...BABEL_QUERY.plugins]
        },
      },
    ],
  },
  plugins: [
    // perf for libraries client side
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: '"production"'},
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ],
}

// Server

const NODE_MODULES = fs.readdirSync('node_modules')
  .filter(dir => dir !== '.bin')
  .reduce(
    (res, dir) => {
      res[dir] = `commonjs ${dir}`;
      return res;
    },
    {}
  )
;

const SERVER_DEV_CONFIG = {
  entry: './app/server.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
  },
  externals: NODE_MODULES,
  module: {
    loaders: [BABEL_LOADER],
  }
};

const SERVER_PROD_CONFIG = SERVER_DEV_CONFIG;
