using System;
using System.Collections.Generic;

namespace YoutubePlaylistMaker.Models
{
    public class PlaylistObjectHelper
    {
        public Guid PlaylistID { get; private set; }
        public string PlaylistName { get; private set; }
        public List<string> PlaylistSongs { get; private set; }

        public PlaylistObjectHelper(string name)
        {
            PlaylistID = Guid.NewGuid();
            PlaylistName = name;
            PlaylistSongs = new List<string>();
        }

        public PlaylistObjectHelper(Guid playlistID, string name)
        {
            PlaylistID = playlistID;
            PlaylistName = name;
            PlaylistSongs = new List<string>();
        }

        public void Add(string songID)
        {
            PlaylistSongs.Add(songID);
        }
    }
}
