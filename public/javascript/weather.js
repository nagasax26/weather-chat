var weatherAPI = function () {
    /*=================================================
                        GLOBAL VARIABLES
    /*=================================================*/
    const apikey = "7Ad6YWTBSIABgLrt35kKzAq4wnQMlNbv";
    // const apikey = "YSTrxiMlT4kl54MiHNXvYDMrS1hmtUuo";
    const STORAGE_ID = "weather";
    const STORAGE_COUNT = "count";
    let items = [];
    let count = 0;
    /*=================================================
                        FUNCTIONS
    /*=================================================*/
    var saveToLocalStorage = function () {
        localStorage.setItem(STORAGE_ID, JSON.stringify(items));
    };

    var getFromLocalStorage = function () {
        return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
    };

    var saveCountToLocalStorage = function () {
        localStorage.setItem(STORAGE_COUNT, JSON.stringify(count));
    };

    var getCountFromLocalStorage = function () {
        return JSON.parse(localStorage.getItem(STORAGE_COUNT) || '0');
    };

    //initialize the array items and count from localstorage
    var init = function () {
        items = getFromLocalStorage();
        count = getCountFromLocalStorage();
    };

    //get the whole weather list
    var getItems = function () {
        return items;
    };

    //get item at index
    var getItemAt = function (index) {
        return items[index];
    };

    //return index of the itme of given cityKey 
    var getIndex = function (cityKey) {
        return items.findIndex(function (element) {
            return element.cityKey === String(cityKey);
        });
    };

    /*function that create an obeject that contain a city information and push
    the new item to the array of items
    */
    var addCity = function (_data) {
        var item = {
            cityKey: _data[0].Key,
            city: _data[0].LocalizedName,
            country: _data[0].Country.ID,
            countryName: _data[0].Country.LocalizedName,
            currentWeather: {},
            weatherList: []
        };
        items.push(item);
    };

    /*function that create addition to the object above and containing 
      more information about city wheather.
    */
    var addItem = function (_data) {
        if (items.length === 0) return;
        var lastItem = items[items.length - 1];
        lastItem.currentWeather = {
            cel: _data[0].Temperature.Metric.Value,
            fah: _data[0].Temperature.Imperial.Value,
            date: formatDate(),
            desc: _data[0].WeatherText,
            icon: _data[0].WeatherIcon < 10 ? '0' + _data[0].WeatherIcon : _data[0].WeatherIcon,
            comments: []
        };
    };

    //update
    var updateItem = function (data, index) {
        var oldItem = {
            cel: items[index].currentWeather.cel,
            fah: items[index].currentWeather.fah,
            date: items[index].currentWeather.date,
            desc: items[index].currentWeather.desc,
            icon: items[index].currentWeather.icon,
            comments: items[index].currentWeather.comments
        };
        items[index].weatherList.push(oldItem); //old records of wheather
        //the new data became the current wheather
        items[index].currentWeather.cel = data[0].Temperature.Metric.Value;
        items[index].currentWeather.fah = data[0].Temperature.Imperial.Value;
        items[index].currentWeather.date = formatDate();
        items[index].currentWeather.desc = data[0].WeatherText;
        items[index].currentWeather.icon = data[0].WeatherIcon < 10 ? '0' + data[0].WeatherIcon : data[0].WeatherIcon;
        items[index].currentWeather.comments = [];
    };

    //return a format date hh:mm dd/mm/yyyy
    var formatDate = function () {
        const date = new Date();
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const day = date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate();
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
    };

    //error
    var onErrorCity = function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 503) {
            throw 'Unauthorized the allowed number of requests has been exceeded.'
        } else {
            throw 'city name is not valid, please check your city name.';
        }
    };

    var onErrorWeather = function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 503) {
            throw 'Unauthorized the allowed number of requests has been exceeded.'
        } else {
            throw 'Something went wrong, please try again.';
        }
    };

    //return promise
    var getDataCity = function (cityName) {
        const urlByCity = `http://dataservice.accuweather.com/locations/v1/cities/search?`;
        return $.ajax({
            type: "GET",
            url: urlByCity,
            dataType: "json",
            data: {
                q: cityName,
                apikey: apikey,
            }
        });
    };

    //return promise
    var getDataWeather = function (cityKey) {
        const urlByCityKey = `http://dataservice.accuweather.com/currentconditions/v1/${cityKey}?`;
        return $.ajax({
            type: "GET",
            url: urlByCityKey,
            dataType: "json",
            data: {
                apikey: apikey
            }
        });
    };

    var sortByCity = function (sort) {
        if (sort === 1) {
            items.sort(function (item1, item2) {
                return item1.city > item2.city;
            });
        } else if (sort === -1) {
            items.sort(function (item1, item2) {
                return item1.city < item2.city;
            });
        }
    };

    var sortByTempreture = function (sort) {
        if (sort === 1) {
            items.sort(function (item1, item2) {
                return item1.currentWeather.cel > item2.currentWeather.cel;
            });
        } else if (sort === -1) {
            items.sort(function (item1, item2) {
                return item1.currentWeather.cel < item2.currentWeather.cel;
            });
        }
    };

    var sortByDate = function (sort) {
        if (sort === 1) {
            items.sort(function (item1, item2) {
                return item1.currentWeather.date > item2.currentWeather.date;
            });
        } else if (sort === -1) {
            items.sort(function (item1, item2) {
                return item1.currentWeather.date < item2.currentWeather.date;
            });
        }
    };

    //create post and save the new post to items array
    var createPost = function (cityName) {
        return new Promise(function (resolve, reject) {
            var promiseCity = getDataCity(cityName);
            promiseCity.then(function (data) {
                getDataWeather(data[0].Key).done(function (_data) {
                    var index = getIndex(data[0].Key);
                    //if we found the key
                    if (index !== -1) {
                        updateItem(_data, index);
                    } else {
                        addCity(data);
                        addItem(_data);
                    }
                    saveToLocalStorage();
                    resolve(items.length - 1); //we return the index of the new post
                }).fail(onErrorWeather);
            }).fail(onErrorCity);
        });
    };



    //remove post from the items array's
    var removePost = function (cityKey) {
        const index = getIndex(cityKey);
        if (index !== -1) {
            items.splice(index, 1);
        }
        saveToLocalStorage();
    };

    //add a comment to specfic items
    var addComment = function (index, commentText) {
        var newComment = {
            id: count,
            comment: commentText
        };
        items[index].currentWeather.comments.push(newComment);
        count++;
        saveToLocalStorage();
        saveCountToLocalStorage();
    };

    //deleting comment from the current weather
    var deleteComment = function (index, idComment) {
        return new Promise(function (resolve, reject) {
            var comments = items[index].currentWeather.comments;
            for (var i in comments) {
                if (comments[i].id === Number(idComment)) {
                    comments.splice(i, 1);
                    saveToLocalStorage();
                    resolve(true);
                }
            }
        });
    };

    //invoking the init
    init();

    //return object of functions
    return {
        getIndex: getIndex,
        getItems: getItems,
        getItemAt: getItemAt,
        sortByCity: sortByCity,
        sortByTempreture: sortByTempreture,
        sortByDate: sortByDate,
        createPost: createPost,
        removePost: removePost,
        addComment: addComment,
        deleteComment: deleteComment
    };
};

/*=================================================
                OPTIONAL FUNCTIONALITY
/*=================================================*/
//use to delete commment post from old weather add this to comment
// var weatherList = items[index].weatherList;
// //if the comment is in the list of the weather's
// for (var i in weatherList) {
//     var commentsInside = weatherList[i].comments;
//     for(var j in  commentsInside)
//     if (commentsInside[j].comment === text && commentsInside[j].id === id) {
//         commentsInside.splice(j, 1);
//         saveToLocalStorage();
//         break;
//     }
// }