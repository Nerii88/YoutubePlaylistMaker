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
                        var song = user.Playlists.ElementAt(i).PlaylistSongs.FirstOrDefault(s => s.Order_In_Playlist == j + 1);
                        if (song != null)
                        {
                            string ytid = song.Youtube_ID;
                            playlist.Add(ytid);
                        }
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
                for (int i = 0; i < songIDs.Count; i++)
                {
                    var song = new PublicPlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songIDs[i];
                    song.Order_In_Playlist = i + 1;
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
                for (int i = 0; i < songIDs.Count; i++)
                {
                    var song = new PlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songIDs[i];
                    song.Order_In_Playlist = i + 1;
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
                for (int i = 0; i < songIDs.Count; i++)
                {
                    var song = new PlaylistSong();
                    song.Unique_ID = Guid.NewGuid().ToString();
                    song.Youtube_ID = songIDs[i];
                    song.Order_In_Playlist = i + 1;
                    songs.Add(song);
                }
                db.Set<PlaylistSong>().RemoveRange(playlist.PlaylistSongs);
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

                    for (int i = 0; i < publicPlaylist.PublicPlaylistSongs.Count; i++)
                    {
                        var song = publicPlaylist.PublicPlaylistSongs.FirstOrDefault(s => s.Order_In_Playlist == i + 1);
                        if (song != null)
                        {
                            string ytid = song.Youtube_ID;
                            playlist.Add(ytid);
                        }
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

        public bool RemovePlaylist(string playlistID)
        {
            using (var db = new PlaylistDBEntities())
            {
                var playlist = db.Playlists.First(p => p.Playlist_ID == playlistID);

                db.Set<PlaylistSong>().RemoveRange(playlist.PlaylistSongs);
                db.Set<Playlist>().Remove(playlist);
                try
                {
                    db.SaveChanges();
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }
        }
    }
}
