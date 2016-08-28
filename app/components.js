import Relay, {createContainer, Mutation} from 'react-relay';
import {Link, IndexLink} from 'react-router';
import marked from 'marked';
import React, {PropTypes, Component} from 'react';

// ------------------------------------------------------------
// Containers

class App extends Component {
  render() {
    return (
      <div style={APP_STYLE}>
        <Header />
        {this.props.children}
      </div>
    );
  }
}

const PER_PAGE = 10;

const PostIndex = createContainer(
  ({viewer, pass}) => {
    const {edges, pageInfo} = viewer.posts;
    return (
      <div>
        <div>
          {
            edges
            .map(x => x.node)
            .map(post => <Post key={post.id} post={post} />)
          }
        </div>
        {
          pass
            ? <Link style={LINK_STYLE} to="new">Compose a post</Link>
            : null
        }
        {
          pageInfo.hasNextPage
            ? <Pagination first={edges.length + PER_PAGE} />
            : null
        }
      </div>
    );
  },
  {
    initialVariables: {first: PER_PAGE},
    fragments: {
      viewer() {
        return Relay.QL`
          fragment on Viewer {
            posts(first: $first) {
              edges {
                cursor,
                node {
                  id,
                  title,
                  content,
                }
              }
              pageInfo {
                hasNextPage,
              }
            }
          }
        `;
     },
    }
  },
);

const postFragment = () => {
  return Relay.QL`
    fragment on Post {
      id,
      title,
      content,
    }
  `;
};

const PostShow = createContainer(
  Post,
  {fragments: {post: postFragment}},
);

class CreatePostMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{createPost}`;
  }
  getVariables() {
    const {title, content} = this.props;
    return {title, content};
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',

    }]
  }
}

const PostNew = createContainer(
  class extends React.Component {
    componentDidMount() {
      this.titleNode && this.titleNode.focus();
    }
    render() {
      return (
        <div style={POST_EDITOR_ROOT}>
          <input
            ref={x => this.titleNode = x}
            style={POST_EDITOR_TITLE}
            placeholder="The title of the masterpiece">
          </input>
          <textarea
            ref={x => this.contentNode = x}
            style={POST_EDITOR_CONTENT}
            placeholder="The artistic beauty">
          </textarea>
          <div style={POST_EDITOR_BAR}>
            <button
              role="button"
              style={POST_EDITOR_SUBMIT_BTN}
              onClick={this._onSave}>
              Compose
            </button>
          </div>
        </div>
      );
    }
    _onSave = () => {
      const {titleNode, contentNode} = this;
      this.props.relay.commitUpdate(
        new CreatePostMutation({
          title: titleNode.value,
          content: contentNode.value,
        }),
      );
    }
  },
  {fragments: {}},
);

// ------------------------------------------------------------
// Components

function Header() {
  return (
    <div style={HEADER_STYLE}>
      <IndexLink to="/" style={NAME_STYLE}>Stepan Parunashvili</IndexLink>
      <a style={BUTTON_STYLE} href="mailto:stepan.p@gmail.com">Contact</a>
    </div>
  );
}

function Post({post}) {
  return (
    <div style={POST_STYLE}>
      <div style={HEADLINE_STYLE}>
        <Link style={TITLE_STYLE} to={`/post/${post.id}`}>{post.title}</Link>
      </div>
      <div
        style={CONTENT_STYLE}
        dangerouslySetInnerHTML={{__html: marked(post.content)}}>
      </div>
    </div>
  );
}
Post.propTypes = {post: PropTypes.object.isRequired};

const Pagination = ({first}) => {
  return (
    <div style={PAGINATION_BAR_STYLE}>
      <Link
        style={LINK_STYLE}
        to={{
          pathname: '/',
          query: {first}
        }}>
          More &rarr;
      </Link>
    </div>
  );
}
Pagination.propTypes = {first: PropTypes.number.isRequired};

// ------------------------------------------------------------
// style

const DIN_REGULAR = 'DIN Next W01 Regular';
const DIN_LIGHT = 'DIN Next W01 Light';
const CODE_FONT = 'Operator Mono, Menlo, monospace';

const STOPA_BLACK = '#444';
const STOPA_RED = '#c0392b';
const STOPA_LIGHTGRAY = '#f8f8f8';

const MARGIN = 20;

const APP_STYLE = {
  width: '500px',
  margin: `${MARGIN * 2}px auto ${MARGIN * 2}px auto`
}

const HEADER_STYLE = {
  textAlign: 'center',
};

const NAME_STYLE = {
  fontFamily: DIN_LIGHT,
  textTransform: 'uppercase',
  fontWeight: 'normal',
  letterSpacing: '5px',
  fontSize: '20px',
  color: STOPA_BLACK,
  display: 'block',
  textDecoration: 'none',
  margin: `${MARGIN}px 0`,
};

const BUTTON_STYLE = {
  fontFamily: DIN_REGULAR,
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: STOPA_RED,
};

const HEADLINE_STYLE = {
  textAlign: 'center',
};

const TITLE_STYLE = {
  fontFamily: DIN_LIGHT,
  fontSize: '32px',
  fontWeight: 'normal',
  margin: `${MARGIN}px 0`,
  display: 'inline-block',
  color: STOPA_BLACK,
  textDecoration: 'none',
};

const SUBTITLE_STYLE = {
  fontFamily: DIN_LIGHT,
  fontSize: '19px',
};

const CONTENT_STYLE = {
  fontFamily: DIN_LIGHT,
  fontSize: '19px',
  lineHeight: '1.5',
};

const POST_STYLE = {
  paddingBottom: `${MARGIN}px`,
};

const PAGINATION_BAR_STYLE = {
  display: 'flex',
  justifyContent: 'center',
};

const BTN_RESET = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const INPUT_RESET = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const LINK_STYLE = {
  ...BTN_RESET,
  textDecoration: 'none',
  color: STOPA_RED,
  fontFamily: DIN_LIGHT,
  fontSize: '15px',
};

const POST_EDITOR_ROOT = {
  display: 'flex',
  flexDirection: 'column',
}

const POST_EDITOR_TITLE = {
  ...INPUT_RESET,
  fontFamily: CODE_FONT,
  backgroundColor: STOPA_LIGHTGRAY,
  margin: `${MARGIN}px 0 ${MARGIN / 2}px 0`,
  padding: MARGIN / 2,
  fontSize: '15px',
}

const POST_EDITOR_CONTENT = {
  ...INPUT_RESET,
  fontFamily: CODE_FONT,
  fontSize: '17px',
  backgroundColor: STOPA_LIGHTGRAY,
  marginBottom: MARGIN / 2,
  padding: MARGIN / 2,
  minHeight: '300px',
  lineHeight: '1.6',
}

const POST_EDITOR_BAR = {
  display: 'flex',
}

const POST_EDITOR_SUBMIT_BTN = {
  ...BTN_RESET,
  fontFamily: CODE_FONT,
  backgroundColor: STOPA_RED,
  color: 'white',
  padding: MARGIN / 2,
  flex: 1,
  fontSize: '17px',
}

export {App, PostIndex, PostShow, PostNew};
