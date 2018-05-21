/*=================================================
                    GLOBAL VARIABLES
/*=================================================*/
const myWeather = weatherAPI();
let previosTarget = null;
/*=================================================
                    FUNCTIONS
    functions that relate to the UI
/*=================================================*/
//rendering one item to to page with a given index
var renderItem = function (index) {
    var source = document.getElementById("weather-layout").innerHTML;
    var template = Handlebars.compile(source);
    $('.weather-list').append(template(myWeather.getItemAt(index)));
};

//rendering all itmes
var renderAll = function () {
    $('.weather-list').empty();
    for (var i in myWeather.getItems())
        renderItem(i);
};

//display itmes when page loads
var loadData = function () {
    renderAll();
};

var sorting = function () {
    if (previosTarget !== this) {
        $(this).closest('div').siblings().find('button').removeClass('active');
        $(this).toggleClass('active');
        previosTarget = this;
    }
    $(this).find('span').toggleClass('fa-angle-down fa-angle-up');
    switch (this.dataset.sort) {
        case 'city':
            {
                if ($(this).find('span').hasClass('fa-angle-down')) {
                    myWeather.sortByCity(-1);
                } else {
                    myWeather.sortByCity(1);
                }
                break;
            }
        case 'temp':
            {
                if ($(this).find('span').hasClass('fa-angle-down')) {
                    myWeather.sortByTempreture(-1);
                } else {
                    myWeather.sortByTempreture(1);
                }
                break;
            }
        case 'date':
            {
                if ($(this).find('span').hasClass('fa-angle-down')) {
                    myWeather.sortByDate(-1);
                } else {
                    myWeather.sortByDate(1);
                }
                break;
            }
    }
}

loadData();

//hiding the alert div
$('.alert').addClass('hide');

//event handling for catching error's
window.onerror = function (msg, url, line, col, error) {
    $('.alert').removeClass('hide');
    $('.alert').text(error.message || error);
}

//event handler - handling new post of weather
$('#form-city').submit(function (event) {
    $('.alert').addClass('hide');
    event.preventDefault();
    const inputCity = $(this).find('input').val();
    myWeather.createPost(inputCity).then(renderAll);
    this.reset();
});

//remove weather post from the html and items array
$('.weather-list').on('click', '.icon', function () {
    const weatherParent = $(this).closest('.weather');
    myWeather.removePost(weatherParent.data().citykey);
    weatherParent.remove();
});

//add a comment to specifec weather
$('.weather-list').on('click', '.btn-comment', function (event) {
    event.preventDefault();
    const inputComment = $(this).closest('.input-group').find('input[type="text"]').val();
    const index = myWeather.getIndex($(this).closest('.weather').data().citykey);
    myWeather.addComment(index, inputComment);
    renderAll();
    $(this).closest('form').trigger('reset');
});

//event handling for delete comment
$('.weather-list').on('click', '.comment', function () {
    var idComment = Number(this.dataset.id);
    var cityKey = $(this).closest('.weather').data().citykey;
    var index = myWeather.getIndex(cityKey);
    myWeather.deleteComment(index, idComment).then(loadData);
    $(this).closest('div').remove();
});

$('div#sortBy').on('click', 'button', function () {
    sorting.call(this);
    renderAll();
});