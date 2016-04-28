using System;
using System.Collections.Generic;

namespace YoutubePlaylistMaker.Models
{
    public class DBHelper
    {
        private readonly Dictionary<Guid, PlaylistObjectHelper> _playlists;
        private readonly Dictionary<Guid, PlaylistObjectHelper> _publicPlaylists;

        public DBHelper()
        {
            _playlists = new Dictionary<Guid, PlaylistObjectHelper>();
            _publicPlaylists = new Dictionary<Guid, PlaylistObjectHelper>();
            CreateCustomPlaylists();
        }

        private void CreateCustomPlaylists()
        {
            PlaylistObjectHelper playlist = new PlaylistObjectHelper("Chill");
            playlist.PlaylistSongs.Add("-mumVUh5cXw");
            playlist.PlaylistSongs.Add("FL87JdFph-Y");
            playlist.PlaylistSongs.Add("rswfNv6OfA8");
            playlist.PlaylistSongs.Add("ClM5UqKQvEk");
            playlist.PlaylistSongs.Add("GfTBEZP09D8");
            playlist.PlaylistSongs.Add("nNLTBKEPsiU");
            playlist.PlaylistSongs.Add("cr_Te6FDddg");
            playlist.PlaylistSongs.Add("iXlR7zRYPTw");
            playlist.PlaylistSongs.Add("sB0Am0v2pRo");
            playlist.PlaylistSongs.Add("XBf8L7Kkdeo");
            playlist.SetGuid(Guid.Parse("ce69d1a9-c0e2-4a6c-92d5-2489dec2a181"));
            _playlists.Add(Guid.Parse("ce69d1a9-c0e2-4a6c-92d5-2489dec2a181"), playlist);

            PlaylistObjectHelper playlist2 = new PlaylistObjectHelper("Tempo");
            playlist2.PlaylistSongs.Add("Qg1qZq5yjps");
            playlist2.PlaylistSongs.Add("SItIaWAjI_4");
            playlist2.PlaylistSongs.Add("_In86O00f8U");
            playlist2.PlaylistSongs.Add("e-IWRmpefzE");
            playlist2.PlaylistSongs.Add("xXRpZmIZ914");
            playlist2.PlaylistSongs.Add("hKRUPYrAQoE");
            playlist2.PlaylistSongs.Add("rCsh1SHv0fc");
            playlist2.PlaylistSongs.Add("FyzyZjntivo");
            playlist2.PlaylistSongs.Add("OVMuwa-HRCQ");
            playlist2.PlaylistSongs.Add("U4sUD-Ih4tY");
            playlist2.SetGuid(Guid.Parse("c5748777-ec72-45f3-89c9-8c7f0bcd87e3"));
            _playlists.Add(Guid.Parse("c5748777-ec72-45f3-89c9-8c7f0bcd87e3"), playlist2);

            _publicPlaylists.Add(Guid.Parse("c5a61ac3-3a08-4533-b72c-25be3dc5cd57"), playlist2);
        }

        public List<PlaylistObjectHelper> GetSavedPlaylists(string username)
        {
            //Get playlists from DB attatched to username
            List<PlaylistObjectHelper> returnMe = new List<PlaylistObjectHelper>();
            foreach (var o in _playlists.Values)
            {
                returnMe.Add(o);
            }
            return returnMe;
        }

        public Guid CreatePublicPlaylist(string name, List<string> songIDs)
        {
            PlaylistObjectHelper playlist = new PlaylistObjectHelper(name, songIDs);
            _publicPlaylists.Add(playlist.PlaylistID, playlist);
            return playlist.PlaylistID;
        }

        public Guid SaveNewPlaylist(string name, List<string> songIDs)
        {
            PlaylistObjectHelper newPlaylist = new PlaylistObjectHelper(name, songIDs);
            _playlists.Add(newPlaylist.PlaylistID, newPlaylist);
            return newPlaylist.PlaylistID;
        }

        public bool UpdatePlaylist(Guid playlistID, List<string> songIDs)
        {
            if (_playlists.ContainsKey(playlistID))
            {
                _playlists[playlistID].PlaylistSongs.Clear();
                foreach (var songID in songIDs)
                {
                    _playlists[playlistID].PlaylistSongs.Add(songID);
                }
                return true;
            }
            return false;
        }

        public PlaylistObjectHelper GetPublicPlaylist(Guid guid)
        {
            if (_publicPlaylists.ContainsKey(guid))
                return _publicPlaylists[guid];
            return null;
        }
    }
}
