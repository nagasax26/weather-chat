var items = [];
const apikey = "YSTrxiMlT4kl54MiHNXvYDMrS1hmtUuo";
// const apikey = "7Ad6YWTBSIABgLrt35kKzAq4wnQMlNbv";
var count = 0;
var STORAGE_ID = "weather";
var STORAGE_COUNT = "count";



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
}

//display itmes when page loads
var onPageLoad = function () {
    items = getFromLocalStorage();
    count = getCountFromLocalStorage();

    for (var i in items) {
        renderItem(i);
    }
};


//hiding the alert div
$('.alert').addClass('hide');

//return index of the itme of given cityKey 
var getIndex = function (cityKey) {
    for (var i = 0; i < items.length; i++)
        if (items[i].cityKey === cityKey)
            return i;
    return -1;
};

//obeject that contain a city information
var addCity = function (_data) {
    const cityKey = _data[0].Key;
    const city = _data[0].LocalizedName;
    const country = _data[0].Country.ID;
    const countryName = _data[0].Country.LocalizedName;

    var item = {
        cityKey: cityKey,
        city: city,
        country: country,
        countryName: countryName,
        currentWeather: {},
        weatherList: []
    };

    items.push(item);

}

//addition to the object above and containing more information about
//city wheather.
var addItem = function (_data) {
    if (items.length === 0) return;

    var lastItem = items[items.length - 1];

    var item = {
        cel: _data[0].Temperature.Metric.Value,
        fah: _data[0].Temperature.Imperial.Value,
        date: formatDate(),
        desc: _data[0].WeatherText,
        icon: _data[0].WeatherIcon < 10 ? '0'+_data[0].WeatherIcon : _data[0].WeatherIcon,

        comments: []
    };

    lastItem.currentWeather = item;
    saveToLocalStorage();
};

//update
var updateItem = function (data, index) {
    var item = {
        cel: items[index].currentWeather.cel,
        fah: items[index].currentWeather.fah,
        date: items[index].currentWeather.date,
        desc: items[index].currentWeather.desc,
        icon: items[index].currentWeather.icon,
        comments: items[index].currentWeather.comments
    };

    items[index].weatherList.push(item);
    items[index].currentWeather.cel = data[0].Temperature.Metric.Value;
    items[index].currentWeather.fah = data[0].Temperature.Imperial.Value;
    items[index].currentWeather.date = formatDate();
    items[index].currentWeather.desc = data[0].WeatherText;
    items[index].currentWeather.icon = data[0].WeatherIcon < 10 ? '0'+data[0].WeatherIcon : data[0].WeatherIcon;
    items[index].currentWeather.comments = [];
};

//rendering one item to to page with a given index
var renderItem = function (index) {
    var source = document.getElementById("weather-layout").innerHTML;
    var template = Handlebars.compile(source);
    $('.weather-list').append(template(items[index]));
};

//rendering all itmes
var renderAll = function () {
    $('.weather-list').empty();
    for (var i in items)
        renderItem(i);
};

//return a format date hh:mm dd/mm/yyyy
var formatDate = function () {
    const date = new Date();
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const day = date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    return `${hours}:${minutes} ${day}/${month}/${date.getFullYear()}`;
};

//function to display error on screen
var onError = function (jqXHR) {
    var getAlert = $('.alert');
    getAlert.find('pre').remove();

    getAlert.addClass('alert-danger');
    getAlert.removeClass('hide');

    getAlert.find('h4').text(jqXHR.message);
    var splited = jqXHR.stack.split("\n");
    for (var i in splited) {
        getAlert.append(`<pre>${splited[i]}</pre>`);
    }
}

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

var  sortByCityAsc = function(){
    items.sort(function(item1, item2){
        return item1.city > item2.city; 
    });
};

var  sortByCityDsc = function(){
    items.sort(function(item1, item2){
        return item1.city < item2.city; 
    });
};

var  sortByTempretureAsc = function(){
    items.sort(function(item1, item2){
        return item1.currentWeather.cel > item2.currentWeather.cel; 
    });
};

var  sortByTempretureDsc = function(){
    items.sort(function(item1, item2){
        return item1.currentWeather.cel < item2.currentWeather.cel; 
    });
};

var  sortByDateAsc = function(){
    items.sort(function(item1, item2){
        var date1 = new Date(item1.currentWeather.date);
        var date2 = new Date(item2.currentWeather.date);

        return date1 > date2; 
    });
};

var  sortByDateDsc = function(){
    items.sort(function(item1, item2){
        var date1 = new Date(item1.currentWeather.date);
        var date2 = new Date(item2.currentWeather.date);

        return date1 < date2; 
    });
};

onPageLoad();

$('#form-city').submit(function (event) {
    event.preventDefault();
    const inputCity = $(this).find('input').val();

    var promiseCity = getDataCity(inputCity);

    promiseCity.then(function (data) {
        $('.alert').addClass('hide');
        getDataWeather(data[0].Key).done(function (_data) {
            $('.alert').addClass('hide');
            var index = getIndex(data[0].Key);

            //if we found the key
            if (index !== -1) {
                updateItem(_data, index);
                saveToLocalStorage();
                //renderItem(index);
                renderAll();
                return;
            }

            addCity(data);
            addItem(_data);
            //renderItem(items.length - 1);
            renderAll();
        }).fail(onError);
    }).fail(onError);

    $(this).closest('form').trigger('reset');
});

//remove entier weather from the html and items array
$('.weather-list').on('click', '.icon', function () {
    const weatherParent = $(this).closest('.weather');
    const index = getIndex(String(weatherParent.data().citykey));
    if (index !== -1) {
        items.splice(index, 1);
        saveToLocalStorage();
        weatherParent.remove();
    }

    //need to throw error if index not exsit
});

//add a comment to specifec weather
$('.weather-list').on('click', '.btn-comment', function (event) {
    event.preventDefault();

    const formComment = $(this).closest('.form-comment');
    const inputComment = formComment.find('input[type="text"]').val();
    var layout = `<div>
                    <div class="remove">
                        <p class='comment' data-id='${count}'>${inputComment}</p>
                    </div>
                  </div>`;
    const divComment = formComment.prev().find('.col-sm-10').append(layout);

    //pushing comment to itmes
    const citykey = `${$(this).closest('.weather').data().citykey}`;
    var index = getIndex(citykey);
    var comment = {
        id: count,
        comment: inputComment
    };

    items[index].currentWeather.comments.push(comment);
    saveToLocalStorage();
    count++;
    saveCountToLocalStorage();
    
    $(this).closest('form').trigger('reset');
});

//event handling for delete comment
$('.weather-list').on('click', '.comment', function () {

    var text = this.innerHTML;
    var id = Number(this.dataset.id);

    var cityKey = $(this).closest('.weather').data().citykey;

    var index = getIndex(String(cityKey));
    var comments = items[index].currentWeather.comments;
    //if the comment is in the current
    for (var i in comments) {
        if (comments[i].comment === text && comments[i].id === id) {
            comments.splice(i, 1);
            saveToLocalStorage();
            $(this).closest('div').remove();
            break;
        }
    }

    //not allowing user to delete post from old weather
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

});

//sorting
$('#btnSortCity').click(function(){
    $(this).find('span').toggleClass('fa-angle-down fa-angle-up');
    if( $(this).find('span').hasClass('fa-angle-down')){
        sortByCityDsc();
        renderAll();
    }

    if($(this).find('span').hasClass('fa-angle-up')){
        sortByCityAsc();
        renderAll();
    }

});

$('#btnSortTemp').click(function(){
    $(this).find('span').toggleClass('fa-angle-down fa-angle-up');
    if( $(this).find('span').hasClass('fa-angle-down')){
        sortByTempretureDsc();
        renderAll();
    }

    if($(this).find('span').hasClass('fa-angle-up')){
        sortByTempretureAsc();
        renderAll();
    }
});

$('#btnSortDate').click(function(){
    $(this).find('span').toggleClass('fa-angle-down fa-angle-up');
    if( $(this).find('span').hasClass('fa-angle-down')){
        sortByDateDsc();
        renderAll();
    }

    if($(this).find('span').hasClass('fa-angle-up')){
        sortByDateAsc();
        renderAll();
    }
});
