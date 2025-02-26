
export default function reducer(snapcast = {}, action) {
  switch (action.type) {
    case 'SNAPCAST_SERVER_LOADED':
      var server = { ...action.server };
      return { ...snapcast, server };

    case 'SNAPCAST_CLIENTS_LOADED':
      if (action.flush) {
        var clients = {};
      } else {
        var clients = { ...snapcast.clients };
      }

      for (const client of action.clients) {
        clients[client.id] = client;
      }
      return { ...snapcast, clients };

    case 'SNAPCAST_GROUPS_LOADED':
      if (action.flush) {
        var groups = {};
      } else {
        var groups = { ...snapcast.groups };
      }

      for (const group of action.groups) {
        groups[group.id] = group;
      }
      return { ...snapcast, groups };

    case 'SNAPCAST_STREAMS_LOADED':
      if (action.flush) {
        var streams = {};
      } else {
        var streams = { ...snapcast.streams };
      }

      for (const stream of action.streams) {
        streams[stream.id] = stream;
      }
      return { ...snapcast, streams };

    default:
      return snapcast;
  }
}
