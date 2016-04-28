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

        public PlaylistObjectHelper(string name, IEnumerable<string> songs)
        {
            PlaylistID = Guid.NewGuid();
            PlaylistName = name;
            PlaylistSongs = new List<string>(songs);
        }

        public void Add(string songID)
        {
            PlaylistSongs.Add(songID);
        }

        public void SetGuid(Guid id) //remove this when database is added
        {
            PlaylistID = id;
        }
    }
}