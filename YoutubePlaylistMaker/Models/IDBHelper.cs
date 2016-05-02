using System;
using System.Collections.Generic;

namespace YoutubePlaylistMaker.Models
{
    interface IDBHelper
    {
        string GetUserName(string email);

        List<PlaylistObjectHelper> GetSavedPlaylists(string userEmail);

        Guid CreatePublicPlaylist(string name, List<string> songIDs);

        Guid SaveNewPlaylist(string email, string name, List<string> songIDs);

        bool UpdatePlaylist(string playlistID, List<string> songIDs);

        PlaylistObjectHelper GetPublicPlaylist(string playlistID);

        void RenewPlaylistLastDateUsed(string playlistID);

        bool Registration(UserRegistrationModel user);

        bool IsValid(string email, string password);
    }
}
