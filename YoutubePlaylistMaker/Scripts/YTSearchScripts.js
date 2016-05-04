var searchResult = [];

//Check for "enter" key press in ytLink input field
function inputSearchFieldOnKeyPressEvent(e) {
    if (e.keyCode === 13) {
        searchYoutube();
        $("#searchField").blur();
    }
};

var searchQuery, nextPageToken, prevPageToken;

var _normalSearch;
var _channelSearch;

function searchYoutube() {
    searchQuery = $("#searchField").val();

    var request = gapi.client.youtube.search.list({
        q: searchQuery,
        part: "snippet",
        maxResults: 12,
        type: "video",
    });

    request.execute(function (response) {
        $("#searchResult").empty();

        _normalSearch = true;
        _channelSearch = false;

        nextPageToken = response.result.nextPageToken;
        var nextVis = nextPageToken ? "visible" : "hidden";
        $("#NEXTbutton").css("visibility", nextVis);
        prevPageToken = response.result.prevPageToken;
        var prevVis = prevPageToken ? "visible" : "hidden";
        $("#PREVbutton").css("visibility", prevVis);

        //additional search is nessecary to get video durations
        getYTVideosDuration(response);
    });
};

//Next page of search results
function nextPage() {
    if (_normalSearch) {
        searchWithToken(nextPageToken);
    } else if (_channelSearch) {
        channelSearchWithToken(nextPageTokenChannel);
    }
};

//Previous page of search results
function previousPage() {
    if (_normalSearch) {
        searchWithToken(prevPageToken);
    } else if (_channelSearch) {
        channelSearchWithToken(prevPageTokenChannel);
    }
};

function searchWithToken(pageToken) {
    var request = gapi.client.youtube.search.list({
        q: searchQuery,
        part: "snippet",
        maxResults: 12,
        type: "video",
        pageToken: pageToken
    });

    request.execute(function (response) {
        $("#searchResult").empty();

        _normalSearch = true;
        _channelSearch = false;

        nextPageToken = response.result.nextPageToken;
        var nextVis = nextPageToken ? "visible" : "hidden";
        $("#NEXTbutton").css("visibility", nextVis);
        prevPageToken = response.result.prevPageToken;
        var prevVis = prevPageToken ? "visible" : "hidden";
        $("#PREVbutton").css("visibility", prevVis);

        //additional search is nessecary to get video durations
        getYTVideosDuration(response);
    });
};

//Extracts video ID from all results then queries the youtube API to 
//get duration of all the videos
function getYTVideosDuration(videoData) {
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

        searchResult = [];
        for (var j = 0; j < data.items.length; j++) {
            addToSearchResult(videoData.items[j], convert_time(data.items[j].contentDetails.duration));
        }
        populateSearchResults();
        $('html, body').animate({ scrollTop: 0 }, 'fast');

        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function addToSearchResult(item, duration) {
    var imgurl = item.snippet.thumbnails.medium.url;
    var title = removeQuotations(strip(item.snippet.title));
    var ytID = item.id.videoId;
    var channelTitle = item.snippet.channelTitle;
    var desc = nl2br(item.snippet.description, true);
    var publishedAt = item.snippet.publishedAt;

    searchResult.push({ imgLink: imgurl, name: title, ytID: ytID, channelTitle: channelTitle, description: desc, publishedAt: publishedAt, duration: duration });
};

var nextPageTokenChannel, prevPageTokenChannel;
var channelPlaylistId;

function searchByChannelName(channelName) {
    var request = gapi.client.youtube.search.list({
        q: channelName,
        part: "snippet",
        maxResults: 1,
        type: "channel",
    });

    request.execute(function (response) {
        var channelSearch = gapi.client.youtube.channels.list({
            id: response.items[0].id.channelId,
            part: "contentDetails",
            maxResults: 1,
        });

        channelSearch.execute(function (channelResponse) {
            channelPlaylistId = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;

            var playlistSearch = gapi.client.youtube.playlistItems.list({
                playlistId: channelPlaylistId,
                part: "snippet",
                maxResults: 12,
            });

            playlistSearch.execute(function (finalResult) {
                $("#searchResult").empty();

                _normalSearch = false;
                _channelSearch = true;

                nextPageTokenChannel = finalResult.result.nextPageToken;
                var nextVis = nextPageTokenChannel ? "visible" : "hidden";
                $("#NEXTbutton").css("visibility", nextVis);
                prevPageTokenChannel = finalResult.result.prevPageToken;
                var prevVis = prevPageTokenChannel ? "visible" : "hidden";
                $("#PREVbutton").css("visibility", prevVis);

                getYTVideosDurationFromChannelName(finalResult.result);
            });
        });
    });
};

function channelSearchWithToken(pageToken) {
    var playlistSearch = gapi.client.youtube.playlistItems.list({
        playlistId: channelPlaylistId,
        part: "snippet",
        maxResults: 12,
        pageToken: pageToken
    });

    playlistSearch.execute(function (finalResult) {
        $("#searchResult").empty();

        _normalSearch = false;
        _channelSearch = true;

        nextPageTokenChannel = finalResult.result.nextPageToken;
        var nextVis = nextPageTokenChannel ? "visible" : "hidden";
        $("#NEXTbutton").css("visibility", nextVis);
        prevPageTokenChannel = finalResult.result.prevPageToken;
        var prevVis = prevPageTokenChannel ? "visible" : "hidden";
        $("#PREVbutton").css("visibility", prevVis);

        getYTVideosDurationFromChannelName(finalResult.result);
    });
}

function getYTVideosDurationFromChannelName(videoData) {
    var allIds = "";
    for (var i = 0; i < videoData.items.length; i++) {
        if (i == videoData.items.length - 1) {
            allIds = allIds + videoData.items[i].snippet.resourceId.videoId;
        } else {
            allIds = allIds + videoData.items[i].snippet.resourceId.videoId + ", ";
        }
    }
    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
        key: "AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
        part: "contentDetails",
        id: allIds
    },
    function (durationsData) {
        if (durationsData.items.length == 0) {
            alert("Video not found");
            return "";
        }

        searchResult = [];
        for (var j = 0; j < durationsData.items.length; j++) {
            addToSearchResultFromChannelName(videoData.items[j], convert_time(durationsData.items[j].contentDetails.duration));
        }
        populateSearchResults();
        $('html, body').animate({ scrollTop: 0 }, 'fast');

        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function addToSearchResultFromChannelName(item, duration) {
    var imgurl = item.snippet.thumbnails.medium.url;
    var title = removeQuotations(strip(item.snippet.title));
    var ytID = item.snippet.resourceId.videoId;
    var channelTitle = item.snippet.channelTitle;
    var desc = nl2br(item.snippet.description, true);
    var publishedAt = item.snippet.publishedAt;

    searchResult.push({ imgLink: imgurl, name: title, ytID: ytID, channelTitle: channelTitle, description: desc, publishedAt: publishedAt, duration: duration });
};

function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

function removeQuotations(text) {
    return text.replace(/['"]+/g, "");
};

//New line to break line hack for description formatting
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === "undefined") ? "<br />" : "<br>";
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + breakTag + "$2");
};

//Formating duration part of search result to HH:MM:SS
function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf("M") >= 0 && duration.indexOf("H") == -1 && duration.indexOf("S") == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf("H") >= 0 && duration.indexOf("M") == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf("H") >= 0 && duration.indexOf("M") == -1 && duration.indexOf("S") == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
};

//Populates the visible search result div for the user to see
function populateSearchResults() {
    var searchResultDiv = $("#searchResult");
    var newHtml = "";
    if ($("#leftBottom").hasClass("displayNone")) {
        $("#leftBottom").removeClass("displayNone");
        $("#leftBottom").addClass("displayBlock");
    }
    for (var index = 1; index <= searchResult.length; index++) {
        var i = index - 1;
        var imgSrc = searchResult[i].imgLink;
        var videoName = searchResult[i].name;
        var channelTitle = searchResult[i].channelTitle;
        var duration = searchResult[i].duration;
        var videoId = searchResult[i].ytID;

        var playButton = "<div class='searchResultPlayButton'><button type='button' class='btn btn-default btn-xs' onclick='playFromSearch(\"" + i + "\")' " +
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

    searchResultDiv.html(newHtml);
};

function playFromSearch(index) {
    if (searchResult.length > 0) {
        if (playingFromPlaylist) {
            unhighlightPlaylistVideo(currentPlayingIndex);
            currentPlayingIndex = -1;
            playingFromPlaylist = false;
        } else if (playingFromSuggested) {
            playingFromSuggested = false;
            if (autoplayFromSuggestedBool)
                autoplayFromSuggested();
        }

        addTitleDateAndDescription(searchResult[index].name, searchResult[index].publishedAt, searchResult[index].channelTitle, searchResult[index].description);

        if ($("#addPlayedVideoToPlaylist").hasClass("displayNone")) {
            $("#addPlayedVideoToPlaylist").removeClass("displayNone");
            $("#addPlayedVideoToPlaylist").addClass("displayBlock");
        }

        player.loadVideoById(searchResult[index].ytID);
        player.setPlaybackQuality('hd720');

        findSuggestionsToPlayedVideo(searchResult[index].ytID);
    }
};

function addToPlaylistFromSearch(index) {
    getYTVideoInfoByYTID(searchResult[index].ytID);
};

var isFirefox = typeof InstallTrigger !== 'undefined';
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
//http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
var suggestCallBack; // global var for autocomplete jsonp

$(document).ready(function () {
    if (isChrome || isIE) {
        $("#searchField").autocomplete({
            source: function (request, response) {
                $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                    {
                        "hl": "en", // Language                  
                        "jsonp": "suggestCallBack", // jsonp callback function name
                        "q": request.term, // query term
                        "client": "youtube", // force youtube style response, i.e. jsonp
                        "ds": "yt"
                    }
                );
                suggestCallBack = function (data) {
                    var suggestions = [];
                    $.each(data[1], function (key, val) {
                        suggestions.push({ "value": val[0] });
                    });
                    suggestions.length = 5; // prune suggestions list to only 5 items
                    response(suggestions);
                };
            },
        });
    } else if (isFirefox) {
        $("#searchField").autocomplete({
            source: function (request, response) {
                $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                    {
                        "hl": "en", // Language                  
                        "jsonp": "suggestCallBack", // jsonp callback function name
                        "q": request.term, // query term
                        "client": "firefox", // force firefox style response, i.e. json
                        "ds": "yt"
                    }
                );
                suggestCallBack = function (data) {
                    var suggestions = [];
                    $.each(data[1], function (key, val) {
                        suggestions.push({ "value": val });
                    });
                    suggestions.length = 5; // prune suggestions list to only 5 items
                    response(suggestions);
                };
            },
        });
    }
});
