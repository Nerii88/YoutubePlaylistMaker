var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        width: '100%',
        //playerVars: { 'controls': 0 },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
    myProgressInterval = setInterval(progressIntervallUpdater, progressIntervalMS);
    myVolumeInterval = setInterval(volumeIntervallUpdater, volumeIntervalMS);
};

var playingFromPlaylist = false;
var playingFromSuggested = false;

//Event fired when play state is changed
//Plays next song if current song was played from playlist
//Plays first song in suggestions if autoplay from suggestions is klicked
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        changeIconToPlay();
    } else if (event.data == YT.PlayerState.PAUSED) {
        changeIconToPlay();
    } else if (event.data == YT.PlayerState.PLAYING) {
        changeIconToPause();
    }
    if (autoplayFromSuggestedBool) {
        if (event.data == YT.PlayerState.ENDED) {
            playNextSong();
        }
    } else if (playingFromPlaylist) {
        if (event.data == YT.PlayerState.ENDED) {
            //changeIconToPlay();
            if ($("#btn_playlist_repeatOne").hasClass('active')) {
                repeatSong();
            } else {
                playNextSong();
            }
        }
    }
};

function repeatSong() {
    player.playVideo();
};

//Checks if repeat all or shuffle buttons are pressed
//and plays next song in the playlist accordingly
function playNextSong() {
    if (autoplayFromSuggestedBool && suggestions.length > 0) {
        randomizeFromSuggested();
    } else if (playingFromPlaylist && playlistElements.length > 0) {
        if ($("#btn_playlist_shuffle").hasClass('active')) {
            var i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            while (i == currentPlayingIndex) {
                i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            }
            playFromPlaylist(i);
        } else {
            if (currentPlayingIndex + 1 == playlistElements.length) {
                if ($("#btn_playlist_repeatAll").hasClass('active')) {
                    playFromPlaylist(0);
                }
            } else {
                playFromPlaylist(currentPlayingIndex + 1);
            }
        }
    }
};

//Checks if repeat all or shuffle buttons are pressed
//and plays previous song in the playlist accordingly
function playPreviousSong() {
    if (autoplayFromSuggestedBool && suggestions.length > 0) {
        randomizeFromSuggested();
    } else if (playingFromPlaylist && playlistElements.length > 0) {
        if ($("#btn_playlist_shuffle").hasClass('active')) {
            var i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            while (i == currentPlayingIndex) {
                i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            }
            playFromPlaylist(i);
        } else {
            if (currentPlayingIndex - 1 < 0) {
                if ($("#btn_playlist_repeatAll").hasClass('active')) {
                    playFromPlaylist(playlistElements.length - 1);
                }
            } else {
                playFromPlaylist(currentPlayingIndex - 1);
            }
        }
    }
};

function pauseOrPlay() {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
};

function changeIconToPause() {
    $("#pausePlaySpan").removeClass();
    $("#pausePlaySpan").addClass("glyphicon glyphicon-pause");
};

function changeIconToPlay() {
    $("#pausePlaySpan").removeClass();
    $("#pausePlaySpan").addClass("glyphicon glyphicon-play");
};

//Loads a Youtube video by a Youtube Video ID
//Sets player quality to 720 for higher standard quality
function playSongByYTID(ytID) {
    player.loadVideoById(ytID);
    player.setPlaybackQuality('hd720');

    findSuggestionsToPlayedVideo(ytID);
};

var playlistElements = [];
var currentPlayingIndex = -1;

//Populates the visible playlist on the site all from scratch by iterating playlistElements
function populatePlaylist() {
    var playlistDiv = $("#playlist");
    var newHtml = "";

    for (var index = 1; index <= playlistElements.length; index++) {
        var i = index - 1;
        var imgSrc = playlistElements[i].imgLink;
        var videoName = playlistElements[i].name;
        var orderNumber = "<div class='playlistVideoOrderNumber'><h6 class='playlistVideoOrderNumberH6'>" + index + "</h6></div>";
        var image = "<div class='playlistVideoImage'><img src='" + imgSrc + "' class='img-rounded' width='73' height='41'></div>";
        var name = "<div class='playlistVideoName'><h6 class='playlistVideoNameH6'>" + videoName + "</h6></div>";
        var clickableDiv = "<div onclick='playFromPlaylist(" + i + ")' class='playlistVideoClickLink'>" + orderNumber + image + name + "</div>";
        var removeButton = "<div class='leftFloater'><button onclick='removeFromPlaylist(" + i + ")' type='button' class='btn-link' data-toggle='tooltip' data-placement='top' title='Remove from playlist'>x</button></div>";
        var allInOne = "<div id='playlistVideo_" + i + "' class='playlistVideoContainer'>" + clickableDiv + removeButton + "</div>";
        newHtml = newHtml + allInOne;
    };

    playlistDiv.html(newHtml);

    if (playingFromPlaylist && currentPlayingIndex > -1) {
        highlightPlaylistVideo(currentPlayingIndex);
    }
};

//Removes an item from the playlist list and reloads the visible playlist on the site
//Called by a button click on right side of playlist
//Re populates playlist to fix numbering
function removeFromPlaylist(index) {
    if (index == currentPlayingIndex)
        currentPlayingIndex = -1;
    playlistElements.splice(index, 1);
    populatePlaylist();
};

//Loads and plays a video
//Adds/removes highlightning from divs to show currently played item
function playFromPlaylist(index) {
    playingFromPlaylist = true;
    playingFromSuggested = false;
    if (currentPlayingIndex > -1) unhighlightPlaylistVideo(currentPlayingIndex);
    highlightPlaylistVideo(index);

    if (autoplayFromSuggestedBool)
        autoplayFromSuggested();

    addTitleDateAndDescription(playlistElements[index].name, playlistElements[index].publishedAt, playlistElements[index].channelTitle, playlistElements[index].description);

    if ($("#addPlayedVideoToPlaylist").hasClass("displayBlock")) {
        $("#addPlayedVideoToPlaylist").removeClass("displayBlock");
        $("#addPlayedVideoToPlaylist").addClass("displayNone");
    }

    playSongByYTID(playlistElements[index].ytID);
    currentPlayingIndex = index;
};

function highlightPlaylistVideo(index) {
    $("#playlistVideo_" + index).addClass("highlightPlaylistVideo");
};

function unhighlightPlaylistVideo(index) {
    $("#playlistVideo_" + index).removeClass("highlightPlaylistVideo");
};

//Shows video info next to player
function addTitleDateAndDescription(title, date, channelTitle, desc) {
    var nameConainer = $("#videoNameContainer");
    var descContainer = $("#videoDescContainer");

    var titleBuilder = "<h4>" + title + "</h4>";
    var descBuilder = "<p><b>Published on: " + date.substr(0, 10) + "</b></p>" + "<b><p style='cursor: pointer;' onclick='searchByChannelName(\"" + channelTitle + "\")'>" + channelTitle + "</p></b>\n\n<p>" + desc + "</p>";

    nameConainer.html(titleBuilder);
    descContainer.html(descBuilder);
};

var UrlStart1 = "https://www.youtube.com/watch?v=";
var UrlStart2 = "https://youtu.be/";
var UrlStart3 = "https://www.youtube.com/embed/";

//Extracts the Youtube Video ID part of a valid youtube link
//Above strings are valid starts to a Youtube video link
function extractID(url) {
    var id = url;

    if (url.indexOf(UrlStart1) > -1) {
        id = url.replace(UrlStart1, "");
    }
    else if (url.indexOf(UrlStart2) > -1) {
        id = url.replace(UrlStart2, "");
    }
    else if (url.indexOf(UrlStart3) > -1) {
        id = url.replace(UrlStart3, "");
    } else {
        alert('Not a valid youtube link.');
        return "";
    }

    if (id.indexOf('&') > -1) {
        var i = id.indexOf('&');
        id = id.substring(0, i);
    }
    if (id.indexOf('?') > -1) {
        var j = id.indexOf('?');
        id = id.substring(0, j);
    }
    if (id.indexOf('#') > -1) {
        var k = id.indexOf('#');
        id = id.substring(0, k);
    }
    return id;
};

function addToPlaylistFromLinkInput() {
    var inputLink = $("#ytLink").val();
    var ytID = extractID(inputLink);
    if (ytID == "") return;

    getYTVideoInfoByYTID(ytID);
    $("#ytLink").val("");
};

//Fetches Youtube video data from given Youtube Video ID
//If successful adds it to the playlist and reloads visible playlist on the site
function getYTVideoInfoByYTID(ytID) {
    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
        key: "AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
        part: "snippet, contentDetails",
        id: ytID
    },
    function (data) {
        if (data.items.length == 0) {
            alert("Video not found");
            return "";
        }

        var title = removeQuotations(strip(data.items[0].snippet.title));
        var imgurl = data.items[0].snippet.thumbnails.medium.url;
        var channelTitle = data.items[0].snippet.channelTitle;
        var desc = nl2br(data.items[0].snippet.description, true);
        var publishedAt = data.items[0].snippet.publishedAt;

        playlistElements.push({ imgLink: imgurl, name: title, ytID: ytID, channelTitle: channelTitle, description: desc, publishedAt: publishedAt });
        populatePlaylist();
        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function getYTVideoInfoByYTID_putInCertainIndex(ytID, orderIndex) {
    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
        key: "AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
        part: "snippet, contentDetails",
        id: ytID
    },
    function (data) {
        if (data.items.length == 0) {
            alert("Video not found");
            return "";
        }

        var title = removeQuotations(strip(data.items[0].snippet.title));
        var imgurl = data.items[0].snippet.thumbnails.medium.url;
        var channelTitle = data.items[0].snippet.channelTitle;
        var desc = nl2br(data.items[0].snippet.description, true);
        var publishedAt = data.items[0].snippet.publishedAt;

        playlistElements[orderIndex] = { imgLink: imgurl, name: title, ytID: ytID, channelTitle: channelTitle, description: desc, publishedAt: publishedAt };
        populatePlaylist();
        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

function removeQuotations(text) {
    return text.replace(/['"]+/g, '');
};

//New line to break line hack for description formatting
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

//Check for "enter" key press in ytLink input field
function inputLinkFieldOnKeyPressEvent(e) {
    if (e.keyCode === 13) {
        addToPlaylistFromLinkInput();
    }
};

var suggestions = [];

function findSuggestionsToPlayedVideo(ytID) {
    $.getJSON("https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=" + ytID + "&type=video&maxResults=10&key=AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
    function (data) {
        if (data.items.length == 0) {
            alert("Suggestions not found");
            return "";
        }
        getYTSuggestionVideosDuration(data);

        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

//Extracts video ID from all results then queries the youtube API to 
//get duration of all the videos
function getYTSuggestionVideosDuration(videoData) {
    var allIds = "";
    for (var i = 0; i < videoData.items.length; i++) {
        if (i == videoData.items.length - 1) {
            allIds = allIds + videoData.items[i].id.videoId;
        } else {
            allIds = allIds + videoData.items[i].id.videoId + ", ";
        }
    }
    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
        key: "AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
        part: "contentDetails",
        id: allIds
    },
    function (data) {
        if (data.items.length == 0) {
            alert("Video not found");
            return "";
        }

        suggestions = [];
        for (var j = 0; j < data.items.length; j++) {
            addToSuggestions(videoData.items[j], convert_time(data.items[j].contentDetails.duration));
        }
        populateSuggestions();

        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function addToSuggestions(item, duration) {
    var imgurl = item.snippet.thumbnails.medium.url;
    var title = removeQuotations(strip(item.snippet.title));
    var ytID = item.id.videoId;
    var channelTitle = item.snippet.channelTitle;
    var desc = nl2br(item.snippet.description, true);
    var publishedAt = item.snippet.publishedAt;

    suggestions.push({ imgLink: imgurl, name: title, ytID: ytID, channelTitle: channelTitle, description: desc, publishedAt: publishedAt, duration: duration });
};

function populateSuggestions() {
    var suggestionsDiv = $("#recommendationsContainer");
    var newHtml = "";
    if ($("#rightBottom").hasClass("displayNone")) {
        $("#rightBottom").removeClass("displayNone");
        $("#rightBottom").addClass("displayBlock");
    }
    for (var index = 1; index <= suggestions.length; index++) {
        var i = index - 1;
        var imgSrc = suggestions[i].imgLink;
        var videoName = suggestions[i].name;
        var channelTitle = suggestions[i].channelTitle;
        var duration = suggestions[i].duration;

        var playButton = "<div class='searchResultPlayButton'><button type='button' class='btn btn-default btn-xs' onclick='playFromSuggested(\"" + i + "\")' " +
            "data-toggle='tooltip' data-placement='top' title='Play'><span class='glyphicon glyphicon-play-circle' aria-hidden='true'></span></button></div>";
        var addToPlaylistButton = "<div class='searchResultAddButton'><button type='button' class='btn btn-default btn-xs' onclick='addToPlaylistFromSearch(\"" + i + "\")' " +
            "data-toggle='tooltip' data-placement='top' title='Add to playlist'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></div>";
        var buttonsDiv = "<div class='searchResultButtonContainer'>" + playButton + addToPlaylistButton + "</div>";

        var imageDiv = "<div class='searchResultImageContainer'><img class='img-rounded' src='" + imgSrc + "' height='82' width='146' /></div>";

        var nameDiv = "<div><h6 class='searchResultName'><b>" + videoName + "</b></h6></div>";
        var channelTitleDiv = "<div style='cursor: pointer;' onclick='searchByChannelName(\"" + channelTitle + "\")'><h6 class='searchResultChannelTitle'><b>" + channelTitle + "</b></h6></div>";
        var durationDiv = "<div><h6 class='searchResultDuration'>" + duration + "</h6></div>";
        var textDiv = "<div class='searchResultTextContainer'>" + nameDiv + channelTitleDiv + durationDiv + "</div>";

        var allInOne = "<div class='searchResultItemContainer'>" + buttonsDiv + imageDiv + textDiv + "</div>";
        newHtml = newHtml + allInOne;
    };

    suggestionsDiv.html(newHtml);
};

function playFromSuggested(index) {
    playingFromSuggested = true;
    playingFromPlaylist = false;

    if (currentPlayingIndex > -1) unhighlightPlaylistVideo(currentPlayingIndex);
    currentPlayingIndex = -1;

    addTitleDateAndDescription(suggestions[index].name, suggestions[index].publishedAt, suggestions[index].channelTitle, suggestions[index].description);

    if ($("#addPlayedVideoToPlaylist").hasClass("displayNone")) {
        $("#addPlayedVideoToPlaylist").removeClass("displayNone");
        $("#addPlayedVideoToPlaylist").addClass("displayBlock");
    }

    playSongByYTID(suggestions[index].ytID);
};

function randomizeFromSuggested() {
    if (suggestions.length > 0) {

        var index = (Math.floor(Math.random() * suggestions.length) + 1) - 1;
        playFromSuggested(index);
    }
}

function mute() {
    if (player.isMuted()) {
        player.unMute();
        $("#volumeIcon").removeClass();
        $("#volumeIcon").addClass("glyphicon glyphicon-volume-up");
    } else {
        player.mute();
        $("#volumeIcon").removeClass();
        $("#volumeIcon").addClass("glyphicon glyphicon-volume-off");
    }
};

var autoplayFromSuggestedBool = false;

function autoplayFromSuggested() {
    if (autoplayFromSuggestedBool) {
        autoplayFromSuggestedBool = false;
        $("#autoPlaySuggestionsButton").removeClass("lightUpSuggestedAutoplayButton");
    } else {
        autoplayFromSuggestedBool = true;
        $("#autoPlaySuggestionsButton").addClass("lightUpSuggestedAutoplayButton");
    }
};

function updateProgressBarSlider() {
    var currentTime = player.getCurrentTime();
    var totalDuration = player.getDuration();
    var currentProgress = currentTime / totalDuration * 100;
    $("#videoProgressSlider").slider("value", currentProgress);
    setElapsedTime(currentTime);
    setTotalTime(totalDuration);
};

function progressIntervallUpdater() {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        updateProgressBarSlider();
    }
};

function setElapsedTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds - (minutes * 60));
    if (seconds < 10)
        seconds = "0" + seconds;
    $("#videoProgressTimer").html("<h6>" + minutes + ":" + seconds + "</h6>");
};

function setTotalTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds - (minutes * 60));
    if (seconds < 10)
        seconds = "0" + seconds;
    $("#videoProgressTotalLength").html("<h6>" + minutes + ":" + seconds + "</h6>");
}

var currentVolume = 0;

function updateVolumeBarSlider() {
    currentVolume = player.getVolume();
    $("#volumeSlider").slider("value", currentVolume);
};

function volumeIntervallUpdater() {
    if (currentVolume != player.getVolume()) {
        updateVolumeBarSlider();
    }
};

var myProgressInterval;
var myVolumeInterval;

var progressIntervalMS = 25;
var volumeIntervalMS = 25;

function addPlayedVideoToPlaylist() {
    getYTVideoInfoByYTID(player.getVideoData()['video_id']);
};

$(function () {
    $("#volumeSlider").slider();
    $("#volumeSlider").css("background", "#424242");
    $("#volumeSlider").slider({
        start: function () {
            clearInterval(myVolumeInterval);
        },
        stop: function () {
            var value = $("#volumeSlider").slider("value");
            player.setVolume(value);
            if (player.isMuted()) {
                player.unMute();
                $("#volumeIcon").removeClass();
                $("#volumeIcon").addClass("glyphicon glyphicon-volume-up");
            }
            myVolumeInterval = setInterval(volumeIntervallUpdater, volumeIntervalMS);
        },
        slide: function () {
            var value = $("#volumeSlider").slider("value");
            player.setVolume(value);
            if (player.isMuted()) {
                player.unMute();
                $("#volumeIcon").removeClass();
                $("#volumeIcon").addClass("glyphicon glyphicon-volume-up");
            }
        }
    });

    $("#videoProgressSlider").slider();
    $("#videoProgressSlider").css("background", "#424242");
    $("#videoProgressSlider").slider({
        start: function () {
            clearInterval(myProgressInterval);
        },
        stop: function () {
            var value = $("#videoProgressSlider").slider("value");
            var totalSeconds = player.getDuration();
            player.seekTo(totalSeconds / 100 * value, true);
            myProgressInterval = setInterval(progressIntervallUpdater, progressIntervalMS);
        }
    });
});

var guid_currentlyPlaylingPlaylist;

function loadPlaylistByIndex(playlistIndex) {
    if (savedPlaylists[playlistIndex].PlaylistSongs.length > 0) {
        clearPlaylist();
        $("#playlistName").html("<h6 style='color:white;'>" + savedPlaylists[playlistIndex].PlaylistName + "</h6>");
        guid_currentlyPlaylingPlaylist = savedPlaylists[playlistIndex].PlaylistID;
        renewPlaylistLastDateUsed(guid_currentlyPlaylingPlaylist);
        for (var i = 0; i < savedPlaylists[playlistIndex].PlaylistSongs.length; i++) {
            getYTVideoInfoByYTID_putInCertainIndex(savedPlaylists[playlistIndex].PlaylistSongs[i], i);
        }
        $("#listItem_savePlaylist").removeClass("displayNone");
    }
};

function renewPlaylistLastDateUsed(playlistID) {
    $.ajax({
        url: '@Url.Action("RenewPlaylistLastDateUsed", "User")',
        dataType: 'json',
        type: 'POST',
        data: { playlistID: playlistID },
        success: function (value) {
        }
    });
};

function clearPlaylist() {
    //if (confirm("Are you sure you want to clear the playlist?")) {
    playlistElements = [];
    currentPlayingIndex = -1;
    guid_currentlyPlaylingPlaylist = "";
    $("#playlistName").html("<h6 style='color:white;'>New Playlist</h6>");
    $("#playlist").html("");
    $("#listItem_savePlaylist").addClass("displayNone");
    //}
};

function loadPublicPlaylist(playlist) {
    if (playlist.PlaylistSongs.length > 0) {
        clearPlaylist();
        $("#playlistName").html("<h6 style='color:white;'>" + playlist.PlaylistName + "</h6>");
        for (var i = 0; i < playlist.PlaylistSongs.length; i++) {
            getYTVideoInfoByYTID_putInCertainIndex(playlist.PlaylistSongs[i], i);
        }
        $("#listItem_savePlaylist").addClass("displayNone");
    }
};
