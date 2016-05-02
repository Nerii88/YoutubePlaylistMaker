using System;
using System.Collections.Generic;
using System.Linq;

namespace YoutubePlaylistMaker.Models
{
    public class DBHelperLocal : IDBHelper
    {
        public string GetUserName(string email)
        {
            using (var db = new PlaylistDBEntities())
            {
                User user = db.Users.FirstOrDefault(e => e.Email == email);
                return user.Name;
            }
        }

        public List<PlaylistObjectHelper> GetSavedPlaylists(string userEmail)
        {
            using (var db = new PlaylistDBEntities())
            {
                User user = db.Users.FirstOrDefault(e => e.Email == userEmail);

                var playlists = new List<PlaylistObjectHelper>();

                for (int i = 0; i < user.Playlists.Count; i++)
                {
                    PlaylistObjectHelper playlist = new PlaylistObjectHelper(Guid.Parse(user.Playlists.ElementAt(i).Playlist_ID), user.Playlists.ElementAt(i).Name);
                    for (int j = 0; j < user.Playlists.ElementAt(i).PlaylistSongs.Count; j++)
                    {
                        playlist.Add(user.Playlists.ElementAt(i).PlaylistSongs.ElementAt(j).Youtube_ID);
                    }

                    playlists.Add(playlist);
                }

                return playlists;
            }
        }

        public Guid CreatePublicPlaylist(string name, List<string> songIDs)
        {
            using (var db = new PlaylistDBEntities())
            {
                var playlist = new PublicPlaylist();
                playlist.Playlist_ID = Guid.NewGuid().ToString();
                playlist.Name = name;
                playlist.Date_Created = DateTime.Now;
                playlist.Date_Last_Used = DateTime.Now;

                var songs = new List<PublicPlaylistSong>();
                foreach (var songID in songIDs)
                {
                    var song = new PublicPlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songID;
                    songs.Add(song);
                }

                playlist.PublicPlaylistSongs = songs;

                db.PublicPlaylists.Add(playlist);
                db.SaveChanges();

                return Guid.Parse(playlist.Playlist_ID);
            }
        }

        public Guid SaveNewPlaylist(string email, string name, List<string> songIDs)
        {
            using (var db = new PlaylistDBEntities())
            {
                var playlist = new Playlist();
                playlist.Playlist_ID = Guid.NewGuid().ToString();
                playlist.Name = name;
                playlist.Date_Created = DateTime.Now;
                playlist.Date_Last_Used = DateTime.Now;
                playlist.Playlist_Owner_Email = email;

                var songs = new List<PlaylistSong>();
                foreach (var songID in songIDs)
                {
                    var song = new PlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songID;
                    songs.Add(song);
                }

                playlist.PlaylistSongs = songs;

                db.Playlists.Add(playlist);
                db.SaveChanges();

                return Guid.Parse(playlist.Playlist_ID);
            }
        }

        public bool UpdatePlaylist(string playlistID, List<string> songIDs)
        {
            using (var db = new PlaylistDBEntities())
            {
                var playlist = db.Playlists.FirstOrDefault(pl => pl.Playlist_ID == playlistID);

                var songs = new List<PlaylistSong>();
                foreach (var songID in songIDs)
                {
                    var song = new PlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songID;
                    songs.Add(song);
                }
                for (int i = playlist.PlaylistSongs.Count - 1; i >= 0; i--)
                {
                    db.Set<PlaylistSong>().Remove(playlist.PlaylistSongs.ElementAt(i));
                }
                playlist.PlaylistSongs = songs;
                try
                {
                    db.SaveChanges();
                    return true;
                }
                catch (Exception e)
                {
                    return false;
                }
            }
        }

        public PlaylistObjectHelper GetPublicPlaylist(string playlistID)
        {
            using (var db = new PlaylistDBEntities())
            {
                var publicPlaylist = db.PublicPlaylists.FirstOrDefault(e => e.Playlist_ID == playlistID);
                if (publicPlaylist != null)
                {
                    var playlist = new PlaylistObjectHelper(Guid.Parse(publicPlaylist.Playlist_ID), publicPlaylist.Name);

                    foreach (var song in publicPlaylist.PublicPlaylistSongs)
                    {
                        playlist.Add(song.Youtube_ID);
                    }

                    publicPlaylist.Date_Last_Used = DateTime.Now;
                    db.SaveChanges();

                    return playlist;
                }

                return null;
            }
        }

        public void RenewPlaylistLastDateUsed(string playlistID)
        {
            using (var db = new PlaylistDBEntities())
            {
                var playlist = db.Playlists.FirstOrDefault(p => p.Playlist_ID == playlistID);
                playlist.Date_Last_Used = DateTime.Now;
                db.SaveChanges();
            }
        }

        public bool Registration(UserRegistrationModel user)
        {
            using (var db = new PlaylistDBEntities())
            {
                var crypto = new SimpleCrypto.PBKDF2();
                var encrpPass = crypto.Compute(user.Password);
                var sysUser = db.Users.Create();

                sysUser.Email = user.Email;
                sysUser.Name = user.UserName;
                sysUser.Password = encrpPass;
                sysUser.Password_Salt = crypto.Salt;
                sysUser.Date_Joined = DateTime.Now;
                sysUser.Date_Last_Visited = DateTime.Now;

                db.Users.Add(sysUser);
                try
                {
                    db.SaveChanges();
                    return true;
                }
                catch (Exception e)
                {
                    return false;
                }
            }
        }

        public bool IsValid(string email, string password)
        {
            var crypto = new SimpleCrypto.PBKDF2();
            bool isValid = false;

            using (var db = new PlaylistDBEntities())
            {
                var user = db.Users.FirstOrDefault(u => u.Email == email);

                if (user != null)
                {
                    if (user.Password == crypto.Compute(password, user.Password_Salt))
                    {
                        isValid = true;
                    }
                }
            }

            return isValid;
        }
    }
}
