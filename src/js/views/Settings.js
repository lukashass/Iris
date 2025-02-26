
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Link } from 'react-router-dom';

import ConfirmationButton from '../components/Fields/ConfirmationButton';
import PusherConnectionList from '../components/PusherConnectionList';
import SourcesPriority from '../components/Fields/SourcesPriority';
import Commands from '../components/Fields/Commands';
import TextField from '../components/Fields/TextField';
import Header from '../components/Header';
import Icon from '../components/Icon';
import Services from '../components/Services';

import * as helpers from '../helpers';
import * as coreActions from '../services/core/actions';
import * as uiActions from '../services/ui/actions';
import * as pusherActions from '../services/pusher/actions';
import * as mopidyActions from '../services/mopidy/actions';
import * as lastfmActions from '../services/lastfm/actions';
import * as spotifyActions from '../services/spotify/actions';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mopidy_host: this.props.mopidy.host,
      mopidy_port: this.props.mopidy.port,
      mopidy_library_artists_uri: this.props.mopidy.library_artists_uri,
      mopidy_library_albums_uri: this.props.mopidy.library_albums_uri,
      pusher_username: this.props.pusher.username,
      input_in_focus: null,
    };
  }

  componentDidMount() {
    this.props.uiActions.setWindowTitle('Settings');
  }

  componentWillReceiveProps(nextProps) {
    let changed = false;
    const { state } = this;

    if (nextProps.pusher.username && nextProps.pusher.username != this.state.pusher_username && this.state.input_in_focus != 'pusher_username') {
      state.pusher_username = nextProps.pusher.username;
      changed = true;
    }

    if (changed) {
      this.setState(state);
    }
  }

  resetAllSettings() {
    localStorage.clear();
    window.location = '#';
    window.location.reload(true);
    return false;
  }

  resetServiceWorkerAndCache() {
    if ('serviceWorker' in navigator) {

      // Hose out all our caches
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          caches.delete(cacheName);
        });
      });

      // Unregister all service workers
      // This forces our SW to bugger off and a new one is registered on refresh
      navigator.serviceWorker.getRegistrations().then(
        (registrations) => {
          for (let registration of registrations) {  
            registration.unregister();
          }
        }
      );

      window.location = '#';
      window.location.reload(true);
    } else {
      this.props.coreActions.handleException('Service Worker not supported');
    }
  }

  setConfig(e) {
    this.setState({ input_in_focus: null });
    e.preventDefault();

    this.props.mopidyActions.set({
      host: this.state.mopidy_host,
      port: this.state.mopidy_port,
    });

    window.location.reload(true);
    return false;
  }

  handleBlur(service, name, value) {
    this.setState({ input_in_focus: null });
    const data = {};
    data[name] = value;
    this.props[`${service}Actions`].set(data);

    // Any per-field actions
    switch (name) {
      case 'library_albums_uri':
        this.props.mopidyActions.clearLibraryAlbums();
        break;
      case 'library_artists_uri':
        this.props.mopidyActions.clearLibraryArtists();
        break;
    }
  }

  renderApplyButton() {
    if (this.props.mopidy.host == this.state.mopidy_host
			&& this.props.mopidy.port == this.state.mopidy_port) {
      return null;
    }

    return (
      <div className="field">
        <div className="name" />
        <div className="input">
          <button type="submit" className="button button--secondary">Apply and reload</button>
        </div>
      </div>
    );
  }

  renderServerStatus() {
    let colour = 'grey';
    let icon = 'help';
    let status = 'Unknown';
    let className = null;

    if (this.props.mopidy.connecting || this.props.pusher.connecting) {
      icon = 'autorenew';
      status = 'Connecting...';
      className = 'icon--spin';
    } else if (!this.props.mopidy.connected || !this.props.pusher.connected) {
      colour = 'red';
      icon = 'close';
      status = 'Disconnected';
    } else if (this.props.mopidy.connected && this.props.pusher.connected) {
      colour = 'green';
      icon = 'check';
      status = 'Connected';
    }

    return (
      <span className={`${colour}-text`}>
        <Icon className={className} name={icon} />
        {' '}
        {status}
      </span>
    );
  }

  render() {
    const options = (
      <span>
        <a className="button button--default button--no-hover" onClick={(e) => this.props.history.push('/settings/debug')}>
          <Icon name="code" />
Debug
        </a>
        <a className="button button--default button--no-hover" href="https://github.com/jaedb/Iris/wiki" target="_blank">
          <Icon name="help" />
Help
        </a>
      </span>
    );

    return (
      <div className="view settings-view">
        <Header options={options} uiActions={this.props.uiActions}>
          <Icon name="settings" type="material" />
					Settings
        </Header>

        <section className="content-wrapper">

          <h4 className="underline">
Server
            <a name="server" />
          </h4>

          <div className="field">
            <div className="name">Status</div>
            <div className="input">
              <div className="text">
                {this.renderServerStatus()}
              </div>
            </div>
          </div>

          <label className="field">
            <div className="name">Username</div>
            <div className="input">
              <TextField
                onChange={(value) => this.props.pusherActions.setUsername(value.replace(/\W/g, ''))}
                value={this.state.pusher_username}
              />
              <div className="description">
								A non-unique string used to identify this client (no special characters)
              </div>
            </div>
          </label>

          <form onSubmit={(e) => this.setConfig(e)}>
            <label className="field">
              <div className="name">Host</div>
              <div className="input">
                <input
                  type="text"
                  onChange={(e) => this.setState({ mopidy_host: e.target.value })}
                  onFocus={(e) => this.setState({ input_in_focus: 'mopidy_host' })}
                  onBlur={(e) => this.setState({ input_in_focus: null })}
                  value={this.state.mopidy_host}
                />
              </div>
            </label>
            <label className="field">
              <div className="name">Port</div>
              <div className="input">
                <input
                  type="text"
                  onChange={(e) => this.setState({ mopidy_port: e.target.value })}
                  onFocus={(e) => this.setState({ input_in_focus: 'mopidy_port' })}
                  onBlur={(e) => this.setState({ input_in_focus: null })}
                  value={this.state.mopidy_port}
                />
              </div>
            </label>
            {this.renderApplyButton()}
          </form>

          <h4 className="underline">
Services
            <a name="services" />
          </h4>

          <Route path="/settings/:service?" component={Services} />

          <h4 className="underline">
Interface
            <a name="interface" />
          </h4>

          <div className="field radio">
            <div className="name">
							Theme
            </div>
            <div className="input">
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={this.props.ui.theme == 'dark'}
                  onChange={(e) => this.props.uiActions.set({ theme: e.target.value })}
                />
                <span className="label">Dark</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={this.props.ui.theme == 'light'}
                  onChange={(e) => this.props.uiActions.set({ theme: e.target.value })}
                />
                <span className="label">Light</span>
              </label>
            </div>
          </div>

          <div className="field checkbox">
            <div className="name">Behavior</div>
            <div className="input">
              <label>
                <input
                  type="checkbox"
                  name="log_actions"
                  checked={this.props.ui.clear_tracklist_on_play}
                  onChange={(e) => this.props.uiActions.set({ clear_tracklist_on_play: !this.props.ui.clear_tracklist_on_play })}
                />
                <span className="label tooltip">
									Clear tracklist on play of URI(s)
                  <span className="tooltip__content">Playing one or more URIs will clear the current play queue first</span>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hotkeys_enabled"
                  checked={this.props.ui.hotkeys_enabled}
                  onChange={(e) => this.props.uiActions.set({ hotkeys_enabled: !this.props.ui.hotkeys_enabled })}
                />
                <span className="label">
									Enable hotkeys
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="smooth_scrolling_enabled"
                  checked={this.props.ui.smooth_scrolling_enabled}
                  onChange={(e) => this.props.uiActions.set({ smooth_scrolling_enabled: !this.props.ui.smooth_scrolling_enabled })}
                />
                <span className="label">
									Enable smooth scrolling
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="playback_controls_touch_enabled"
                  checked={this.props.ui.playback_controls_touch_enabled}
                  onChange={(e) => this.props.uiActions.set({ playback_controls_touch_enabled: !this.props.ui.playback_controls_touch_enabled })}
                />
                <span className="label tooltip">
									Enable touch events on play controls
                  <span className="tooltip__content">Allows left- and right-swipe to change tracks</span>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="wide_scrollbar_enabled"
                  checked={this.props.ui.wide_scrollbar_enabled}
                  onChange={(e) => this.props.uiActions.set({ wide_scrollbar_enabled: !this.props.ui.wide_scrollbar_enabled })}
                />
                <span className="label">
									Use wide scrollbars
                </span>
              </label>
            </div>
          </div>

          <div className="field sources-priority">
            <div className="name">
							Sources priority
            </div>
            <div className="input">
              <SourcesPriority
                uri_schemes={this.props.mopidy.uri_schemes ? this.props.mopidy.uri_schemes : []}
                uri_schemes_priority={this.props.ui.uri_schemes_priority ? this.props.ui.uri_schemes_priority : []}
                uiActions={this.props.uiActions}
              />
              <div className="description">
				        		Drag-and-drop to prioritize search providers and results
              </div>
            </div>
          </div>

          {helpers.isHosted() ? null : (
            <div className="field checkbox">
              <div className="name">Reporting</div>
              <div className="input">
                <label>
                  <input
                    type="checkbox"
                    name="allow_reporting"
                    checked={this.props.ui.allow_reporting}
                    onChange={(e) => this.props.uiActions.set({ allow_reporting: !this.props.ui.allow_reporting })}
                  />
                  <span className="label">
									Allow reporting of anonymous usage statistics
                  </span>
                </label>
                <div className="description">
This helps identify errors and potential features that make Iris better for everyone. See
                  <a href="https://github.com/jaedb/Iris/wiki/Terms-of-use#privacy-policy" target="_blank">privacy policy</a>
.
                </div>
              </div>
            </div>
          )}

          <div className="field commands-setup" id="commands-setup">
            <div className="name">
							Commands
            </div>
            <div className="input">
              <Commands
                commands={this.props.pusher.commands}
                runCommand={(id, notify) => this.props.pusherActions.runCommand(id, notify)}
                onChange={(commands) => this.props.pusherActions.setCommands(commands)}
              />
              <Link to="/edit-command" className="button button--default">Add new</Link>
            </div>
          </div>

          <h4 className="underline">
Advanced
            <a name="advanced" />
          </h4>

          <div className="field">
            <div className="name">Artist library URI</div>
            <div className="input">
              <input
                type="text"
                value={this.state.mopidy_library_artists_uri}
                onChange={(e) => this.setState({ mopidy_library_artists_uri: e.target.value })}
                onBlur={(e) => this.handleBlur('mopidy', 'library_artists_uri', e.target.value)}
              />
              <div className="description">
								URI used for collecting library artists
              </div>
            </div>
          </div>

          <label className="field">
            <div className="name">Album library URI</div>
            <div className="input">
              <input
                type="text"
                value={this.state.mopidy_library_albums_uri}
                onChange={(e) => this.setState({ mopidy_library_albums_uri: e.target.value })}
                onBlur={(e) => this.handleBlur('mopidy', 'library_albums_uri', e.target.value)}
              />
              <div className="description">
								URI used for collecting library albums
              </div>
            </div>
          </label>

          <div className="field pusher-connections">
            <div className="name">Connections</div>
            <div className="input">
              <div className="text">
                <PusherConnectionList />
              </div>
            </div>
          </div>

          <div className="field">
            <div className="name">Version</div>
            <div className="input">
              <span className="text">
                {this.props.pusher.version.current}
                {' '}
installed
                {this.props.pusher.version.upgrade_available ? (
                  <span className="flag flag--dark">
                    <Icon name="cloud_download" className="blue-text" />
&nbsp; Upgrade available
                  </span>
                ) : (
                  <span className="flag flag--dark">
                    <Icon name="check" className="green-text" />
&nbsp; Up-to-date
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="field">
            <button className="button button--default" onClick={(e) => this.props.pusherActions.localScan()}>Run local scan</button>
            <Link className="button button--default" to="/share-configuration">Share configuration</Link>
          </div>

          <div className="field">
            {this.props.pusher.version.upgrade_available ? (
              <button className="button button--secondary" onClick={(e) => this.props.pusherActions.upgrade()}>
                {`Upgrade to ${this.props.pusher.version.latest}`}
              </button>
            ) : null }
            <button className={`button button--destructive${this.props.mopidy.restarting ? ' button--working' : ''}`} onClick={(e) => this.props.pusherActions.restart()}>Restart server</button>
            <ConfirmationButton
              className="button--destructive"
              content="Reset all settings"
              confirmingContent="Are you sure?"
              onConfirm={() => this.resetAllSettings()}
            />
            <button
              className="button button--destructive"
              onClick={() => this.resetServiceWorkerAndCache()}
            >
              Reset cache
            </button>
          </div>

          <h4 className="underline">
            About
            <a name="about" />
          </h4>

          <div className="field">
            <div>
              <em><a href="https://github.com/jaedb/Iris" target="_blank">Iris</a></em>
              {' '}
is an open-source project by
              <a href="https://github.com/jaedb" target="_blank">James Barnsley</a>
. It is provided free and with absolutely no warranty. If you paid someone for this software, please let me know.
            </div>
            <br />
            <br />
            <div>
              <a className="button button--default" href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=james%40barnsley%2enz&lc=NZ&item_name=James%20Barnsley&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted" target="_blank">
                <Icon type="fontawesome" name="paypal" />
                {' '}
Donate
              </a>
              <a className="button button--default" href="https://github.com/jaedb/Iris" target="_blank">
                <Icon type="fontawesome" name="github" />
                {' '}
GitHub
              </a>
              <a className="button button--default" href="http://creativecommons.org/licenses/by-nc/4.0/" target="_blank">
                <Icon type="fontawesome" name="creative-commons" />
&nbsp;Licence
              </a>
            </div>
          </div>

        </section>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => state;

const mapDispatchToProps = (dispatch) => ({
  coreActions: bindActionCreators(coreActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  pusherActions: bindActionCreators(pusherActions, dispatch),
  mopidyActions: bindActionCreators(mopidyActions, dispatch),
  lastfmActions: bindActionCreators(lastfmActions, dispatch),
  spotifyActions: bindActionCreators(spotifyActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
