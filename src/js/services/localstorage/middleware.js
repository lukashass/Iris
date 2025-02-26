
const helpers = require('../../helpers.js');

const localstorageMiddleware = (function () {
  /**
     * The actual middleware inteceptor
     * */
  return (store) => (next) => (action) => {
    // proceed as normal first
    // this way, any reducers and middleware do their thing BEFORE we store our new state
    next(action);

    // append our state to a global variable. This gives us access to debug the store at any point
    window._store = store;

    // if debug enabled
    if (store.getState().ui.log_actions) {
      const ignored_actions = [
        'START_LOADING',
        'STOP_LOADING',
      ];

      // Show non-ignored actions
      if (!ignored_actions.includes(action.type)) {
        console.log(action);
      }
    }

    switch (action.type) {
      case 'PUSHER_CONNECTED':
        helpers.setStorage(
          'pusher',
          {
            connection_id: action.connection_id,
          },
        );
        break;

      case 'PUSHER_SET_PORT':
        helpers.setStorage(
          'pusher',
          {
            port: action.port,
          },
        );
        break;

      case 'PUSHER_SET_USERNAME':
        helpers.setStorage(
          'pusher',
          {
            username: action.username,
          },
        );
        break;

      case 'MOPIDY_URISCHEMES_FILTERED':
        helpers.setStorage(
          'mopidy',
          {
            uri_schemes: action.data,
          },
        );
        break;

      case 'SPOTIFY_AUTHORIZATION_GRANTED':
        if (action.authorization !== undefined) {
          var { authorization } = action;
        } else if (action.data) {
          var authorization = action.data;
        }
        helpers.setStorage(
          'spotify',
          {
            authorization,
            access_token: authorization.access_token,
            refresh_token: authorization.refresh_token,
            token_expiry: authorization.token_expiry,
          },
        );
        break;

      case 'SPOTIFY_IMPORT_AUTHORIZATION':
        helpers.setStorage(
          'spotify',
          {
            authorization: action.authorization,
            access_token: action.authorization.access_token,
            refresh_token: action.authorization.refresh_token,
            token_expiry: action.authorization.token_expiry,
            me: null,
          },
        );
        break;

      case 'SPOTIFY_AUTHORIZATION_REVOKED':
        helpers.setStorage(
          'spotify',
          {
            authorization: null,
            access_token: null,
            refresh_token: null,
            token_expiry: null,
            me: null,
          },
        );
        break;

      case 'SPOTIFY_TOKEN_REFRESHED':
        helpers.setStorage(
          'spotify',
          {
            access_token: action.data.access_token,
            token_expiry: action.data.token_expiry,
            provider: action.provider,
          },
        );
        break;

      case 'SPOTIFY_ME_LOADED':
        helpers.setStorage(
          'spotify',
          {
            me: action.me,
          },
        );
        break;

      case 'LASTFM_ME_LOADED':
        helpers.setStorage(
          'lastfm',
          {
            me: action.me,
          },
        );
        break;

      case 'LASTFM_AUTHORIZATION_GRANTED':
        helpers.setStorage(
          'lastfm',
          {
            authorization: action.data.session,
          },
        );
        break;

      case 'LASTFM_AUTHORIZATION_REVOKED':
        helpers.setStorage(
          'lastfm',
          {
            authorization: null,
            me: null,
          },
        );
        break;

      case 'LASTFM_IMPORT_AUTHORIZATION':
        helpers.setStorage(
          'lastfm',
          {
            authorization: action.authorization,
            me: null,
          },
        );
        break;

      case 'GENIUS_ME_LOADED':
        helpers.setStorage(
          'genius',
          {
            me: action.me,
          },
        );
        break;

      case 'GENIUS_AUTHORIZATION_GRANTED':
        helpers.setStorage(
          'genius',
          {
            authorization: action.data,
            authorization_code: action.data.authorization_code,
            access_token: action.data.access_token,
          },
        );
        break;

      case 'GENIUS_AUTHORIZATION_REVOKED':
        helpers.setStorage(
          'genius',
          {
            me: null,
            authorization: null,
            authorization_code: null,
            access_token: null,
          },
        );
        break;

      case 'GENIUS_IMPORT_AUTHORIZATION':
        helpers.setStorage(
          'genius',
          {
            authorization: action.authorization,
            authorization_code: action.authorization.authorization_code,
            access_token: action.authorization.access_token,
            me: null,
          },
        );
        break;

      case 'CORE_SET':
        helpers.setStorage(
          'core',
          action.data,
        );
        break;

      case 'UI_SET':
        helpers.setStorage(
          'ui',
          action.data,
        );
        break;

      case 'MOPIDY_SET':
        helpers.setStorage(
          'mopidy',
          action.data,
        );
        break;

      case 'SPOTIFY_SET':
        helpers.setStorage(
          'spotify',
          action.data,
        );
        break;

      case 'SNAPCAST_COMMANDS_UPDATED':
        helpers.setStorage(
          'snapcast',
          {
                    	commands: action.commands,
          },
        );
        break;

      case 'SUPPRESS_BROADCAST':
        var ui = helpers.getStorage('ui');
        if (ui.suppressed_broadcasts !== undefined) {
          var { suppressed_broadcasts } = ui;
        } else {
          var suppressed_broadcasts = [];
        }

        suppressed_broadcasts.push(action.key);

        helpers.setStorage(
          'ui',
          {
            suppressed_broadcasts,
          },
        );
        break;

            /**
             * Experimental saving of stores to localStorage
             * This uses way too much storage space (ie 10MB+) so won't work. We need
             * to use the IndexedDB engine instead for storing this quantity of data

            case 'UPDATE_TRACKS_INDEX':
                helpers.setStorage('core', {tracks: action.tracks});
                next(action);
                break;
            case 'UPDATE_ALBUMS_INDEX':
                helpers.setStorage('core', {albums: action.albums});
                next(action);
                break;
            case 'UPDATE_ARTISTS_INDEX':
                helpers.setStorage('core', {artists: action.artists});
                next(action);
                break;
            case 'UPDATE_PLAYLISTS_INDEX':
                helpers.setStorage('core', {playlists: action.playlists});
                next(action);
                break;
            case 'UPDATE_USERS_INDEX':
                helpers.setStorage('core', {users: action.users});
                next(action);
                break;
             */
    }
  };
}());

export default localstorageMiddleware;
