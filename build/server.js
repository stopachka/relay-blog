/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _express = __webpack_require__(1);

	var _express2 = _interopRequireDefault(_express);

	var _fs = __webpack_require__(2);

	var _fs2 = _interopRequireDefault(_fs);

	var _expressGraphql = __webpack_require__(3);

	var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

	var _path = __webpack_require__(4);

	var _path2 = _interopRequireDefault(_path);

	var _react = __webpack_require__(5);

	var _react2 = _interopRequireDefault(_react);

	var _data = __webpack_require__(6);

	var _data2 = _interopRequireDefault(_data);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var app = (0, _express2.default)();

	app.use('/graphql', (0, _expressGraphql2.default)({
	  schema: _data2.default,
	  graphiql: true,
	  formatError: function formatError(_ref) {
	    var message = _ref.message;
	    var locations = _ref.locations;
	    var stack = _ref.stack;

	    return { message: message, locations: locations, stack: stack };
	  }
	}));

	// ------------------------------------------------------------
	// Static

	app.get('/client.js', function (req, res) {
	  res.sendFile('client.js', { root: 'build' });
	});

	app.get('/favicon.ico', function (req, res) {
	  res.status(500).send('uh oh');
	});

	app.get('/:params?*', function (req, res) {
	  res.status(200).send('\n    <!doctype html>\n    <html>\n      <head>\n        <meta charset="utf-8">\n        <meta name="viewport" content="width=device-width, initial-scale=1">\n        <script tpye="text/javascript">\n          window.MTIConfig = {EnableCustomFOUTHandler: true};\n        </script>\n        <script\n          type="text/javascript"\n          src="http://fast.fonts.net/jsapi/15046032-4cb8-4f35-b794-7d6caf755c60.js">\n        </script>\n      </head>\n      <body>\n        <div id="react-root"></div>\n        <script\n          src="' + (
	  // stopachka(TODO) ahh need a cfg, or inital state
	  process.env.NODE_ENV === 'production' ? '../../client.js' : 'http://localhost:3000/build/client.js') + '">\n        </script>\n      </body>\n    </html>\n  ');
	});

	console.log('listening!');
	app.listen(process.env.PORT || 5000);

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express-graphql");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _lodash = __webpack_require__(7);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _knex = __webpack_require__(8);

	var _knex2 = _interopRequireDefault(_knex);

	var _graphql = __webpack_require__(9);

	var _graphqlRelay = __webpack_require__(10);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// ------------------------------------------------------------
	// Database

	var knex = (0, _knex2.default)(configFor(process.env.NODE_ENV));

	function getPosts(knex) {
	  return knex.from('posts').orderBy('id', 'desc');
	}

	function getPost(knex, id) {
	  return knex.select().from('posts').where('id', id).first();
	}

	function createPost(knex, vMap) {
	  return knex.from('posts').insert(vMap).returning('*').then(function (x) {
	    return x[0];
	  });
	}

	function getViewer() {
	  return {
	    posts: []
	  };
	};

	function configFor(env) {
	  switch (env) {
	    case 'production':
	      return {
	        client: 'pg',
	        connection: process.env.DATABASE_URL
	      };
	    default:
	      return {
	        client: 'pg',
	        connection: 'postgres://localhost/blogDev',
	        debug: true
	      };
	  }
	}

	// ------------------------------------------------------------
	// Node Definitions

	var _nodeDefinitions = (0, _graphqlRelay.nodeDefinitions)(function (globalId) {
	  var _fromGlobalId2 = (0, _graphqlRelay.fromGlobalId)(globalId);

	  var type = _fromGlobalId2.type;
	  var id = _fromGlobalId2.id;

	  switch (type) {
	    case 'Viewer':
	      return getViewer(id);
	    case 'Post':
	      return getPost(knex, id);
	  }
	}, function (obj) {
	  if (x.posts) {
	    return VIEWER_TYPE;
	  } else {
	    return POST_TYPE;
	  }
	});

	var nodeInterface = _nodeDefinitions.nodeInterface;
	var nodeField = _nodeDefinitions.nodeField;

	// ------------------------------------------------------------
	// Types

	var POST_TYPE = new _graphql.GraphQLObjectType({
	  name: 'Post',
	  fields: {
	    id: (0, _graphqlRelay.globalIdField)('User'),
	    title: {
	      type: _graphql.GraphQLString,
	      resolve: function resolve(x) {
	        return x.title;
	      }
	    },
	    content: {
	      type: _graphql.GraphQLString,
	      resolve: function resolve(x) {
	        return x.content;
	      }
	    }
	  },
	  interfaces: [nodeInterface]
	});

	var _connectionDefinition = (0, _graphqlRelay.connectionDefinitions)({ name: 'Post', nodeType: POST_TYPE });

	var postConnection = _connectionDefinition.connectionType;


	var VIEWER_TYPE = new _graphql.GraphQLObjectType({
	  name: 'Viewer',
	  fields: {
	    id: (0, _graphqlRelay.globalIdField)('Viewer'),
	    posts: {
	      type: postConnection,
	      args: _graphqlRelay.connectionArgs,
	      resolve: function resolve(_, args) {
	        return getPosts(knex).then(function (posts) {
	          return (0, _graphqlRelay.connectionFromArray)(posts, args);
	        });
	      }
	    }
	  },
	  interfaces: [nodeInterface]
	});

	var QUERY_TYPE = new _graphql.GraphQLObjectType({
	  name: 'Query',
	  fields: {
	    node: nodeField,
	    viewer: {
	      type: VIEWER_TYPE,
	      resolve: getViewer
	    },
	    post: {
	      type: POST_TYPE,
	      args: {
	        globalId: { type: _graphql.GraphQLString }
	      },
	      resolve: function resolve(_, _ref) {
	        var globalId = _ref.globalId;

	        var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(globalId);

	        var id = _fromGlobalId.id;

	        return getPost(knex, id);
	      }
	    }
	  }
	});

	// ------------------------------------------------------------
	// Mutations

	var CREATE_POST_MUTATION = (0, _graphqlRelay.mutationWithClientMutationId)({
	  name: 'CreatePost',
	  inputFields: {
	    title: { type: _graphql.GraphQLString },
	    content: { type: _graphql.GraphQLString }
	  },
	  outputFields: {
	    post: {
	      type: POST_TYPE,
	      resolve: function resolve(post) {
	        return post;
	      }
	    }
	  },
	  mutateAndGetPayload: function mutateAndGetPayload(_ref2) {
	    var globalId = _ref2.globalId;
	    var title = _ref2.title;
	    var content = _ref2.content;

	    return createPost(knex, { title: title, content: content });
	  }
	});

	var MUTATION_TYPE = new _graphql.GraphQLObjectType({
	  name: 'Mutation',
	  fields: { createPost: CREATE_POST_MUTATION }
	});

	var SCHEMA = new _graphql.GraphQLSchema({
	  query: QUERY_TYPE,
	  mutation: MUTATION_TYPE
	});

	exports.default = SCHEMA;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("knex");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("graphql");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("graphql-relay");

/***/ }
/******/ ]);