import _ from 'lodash';
import createKnex from 'knex';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {
  fromGlobalId,
  globalIdField,
  nodeDefinitions,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  mutationWithClientMutationId
} from 'graphql-relay';

// ------------------------------------------------------------
// Database

const knex = createKnex(configFor(process.env.NODE_ENV));

function getPosts(knex) {
  return knex.from('posts').orderBy('id', 'desc');
}

function getPost(knex, id) {
  return knex.select().from('posts').where('id', id).first();
}

function createPost(knex, vMap) {
  return knex
    .from('posts')
    .insert(vMap)
    .returning('*')
    .then(x => x[0])
  ;
}

function getViewer() {
  return {
    posts: [],
  };
};

function configFor(env) {
  switch (env) {
    case 'production':
      return {
        client: 'pg',
        connection: process.env.DATABASE_URL,
      };
    default:
      return {
        client: 'pg',
        connection: 'postgres://localhost/blogDev',
        debug: true,
      };
  }
}

// ------------------------------------------------------------
// Node Definitions

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type, id} = fromGlobalId(globalId);
    switch (type) {
      case 'Viewer':
        return getViewer(id);
      case 'Post':
        return getPost(knex, id);
    }
  },
  (obj) => {
    if (x.posts) {
      return VIEWER_TYPE;
    } else {
      return POST_TYPE;
    }
  },
);

// ------------------------------------------------------------
// Types

const POST_TYPE = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: globalIdField('User'),
    title: {
      type: GraphQLString,
      resolve(x) { return x.title },
    },
    content: {
      type: GraphQLString,
      resolve(x) { return x.content },
    },
  },
  interfaces: [nodeInterface],
});

const {connectionType: postConnection} = connectionDefinitions(
  {name: 'Post', nodeType: POST_TYPE},
);

const VIEWER_TYPE = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    id: globalIdField('Viewer'),
    posts: {
      type: postConnection,
      args: connectionArgs,
      resolve(_, args) {
        return getPosts(knex).then(
          posts => connectionFromArray(posts, args)
        );
      },
    },
  },
  interfaces: [nodeInterface],
});

const QUERY_TYPE = new GraphQLObjectType({
  name: 'Query',
  fields: {
    node: nodeField,
    viewer: {
      type: VIEWER_TYPE,
      resolve: getViewer,
    },
    post: {
      type: POST_TYPE,
      args: {
        globalId: { type: GraphQLString },
      },
      resolve(_, {globalId}) {
        const {id} =  fromGlobalId(globalId);
        return getPost(knex, id);
      },
    },
  },
});

// ------------------------------------------------------------
// Mutations

const CREATE_POST_MUTATION = mutationWithClientMutationId({
  name: 'CreatePost',
  inputFields: {
    title: {type: GraphQLString},
    content: {type: GraphQLString},
  },
  outputFields: {
    post: {
      type: POST_TYPE,
      resolve(post) {
        return post;
      },
    },
  },
  mutateAndGetPayload({globalId, title, content}) {
    return createPost(knex, {title, content});
  },
});

const MUTATION_TYPE = new GraphQLObjectType({
  name: 'Mutation',
  fields: {createPost: CREATE_POST_MUTATION},
});

const SCHEMA = new GraphQLSchema({
  query: QUERY_TYPE,
  mutation: MUTATION_TYPE,
});

export default SCHEMA;
