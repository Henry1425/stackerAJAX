$(document).ready(function () {
    $('.unanswered-getter').submit(function (e) {
        e.preventDefault();
        // zero out results if previous search has run
        $('.results').html('');
        // get the value of the tags the user submitted
        var tags = $(this).find("input[name='tags']").val();
        getUnanswered(tags);
    });
    //1st get the input from the user regarding top (users search) answerers for a tag
    $('.inspiration-getter').submit(function (event) {
        //if page refreshes when you submit the form use .preventDefault(); to force JS to handle the form submission.
        event.preventDefault();
        //zero outs results if previous search has run.
        $(".results").html('');
        //Get the value of the tag the user submitted.
        var tag = $(this).find("input[name='answerers']").val();
        //run the API search with the user input above
        getInspiration(tag);
    });
});



// 2nd-step-takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function (tags) {

    // the parameters we need to pass in our request to StackOverflow's API
    var request = {
        tagged: tags,
        site: 'stackoverflow',
        order: 'desc',
        sort: 'creation'
    };

    $.ajax({
            url: "http://api.stackexchange.com/2.2/questions/unanswered",
            data: request,
            dataType: "jsonp", //use jsonp to avoid cross origin issues
            type: "GET",
        })
        .done(function (result) { //this waits for the ajax to return with a succesful promise object //.done is ajax specific
            var searchResults = showResultsCounter(request.tagged, result.items.length);

            $('.search-results').html(searchResults);
            //$.each is a higher order function. It takes an array and a function as an argument.
            //The function is executed once for each item in the array.
            $.each(result.items, function (i, item) {
                var question = showQuestion(item);
                $('.results').append(question);
            });
        })
        .fail(function (jqXHR, error) { //this waits for the ajax to return with an error promise object//.fail is ajax specific
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
};
//2nd step-=============== Top Answerers Search ====================
// getInspiration function
// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getInspiration = function (tag) {
    var createsDynamicUrl = "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/all_time"; //added a dynamic variable
    var request = {
        site: 'stackoverflow'
    };
    // parameters needed to pass in request to StackOverflow's API
    var result = $.ajax({
        url: createsDynamicUrl,
        data: request,
        dataType: "jsonp",
        type: "GET",
    })

    // funcionality if the response is successful
    .done(function (result) {
            var searchResults = showResultsCounter(tag, result.items.length);

            $('.search-results').html(searchResults);

            $.each(result.items, function (i, item) {
                var topUsers = showInspiration(item);
                $('.results').append(topUsers);
            });
        })
        //if the response is a failure
        .fail(function (jqXHR, error) { //this waits for the ajax to return with an error promise object//.fail is ajax specific
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
};

//3rd-step- this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function (question) {

    // clone our result template code
    var result = $('.templates .question').clone();

    // Set the question properties in result
    var questionElem = result.find('.question-text a');
    questionElem.attr('href', question.link);
    questionElem.text(question.title);

    // set the date asked property in result
    var asked = result.find('.asked-date');
    var date = new Date(1000 * question.creation_date);
    asked.text(date.toString());

    // set the .viewed for question property in result
    var viewed = result.find('.viewed');
    viewed.text(question.view_count);

    // set some properties related to asker
    var asker = result.find('.asker');
    asker.html('<p>Name: <a target="_blank" ' +
        'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
        question.owner.display_name +
        '</a></p>' +
        '<p>Reputation: ' + question.owner.reputation + '</p>'
    );

    return result;
};
//3rd-step (getInspiration - top users search) - using the JSON response, populate the relevant part of your HTML with the variable inside the JSON
var showInspiration = function (item) {

    var result = $('.templates .inspiration').clone();
    var user = result.find('.user a')
        .attr('href', item.user.link)
        .text(item.user.display_name);
    var image = "<img src='" + item.user.profile_image + "' alt='" + item.user.display_name + "'>";
    $(user).append(image);
    result.find('.post-count').text(item.post_count);
    result.find('.score').text(item.score);

    return result;
};
//EXTRA functions

// this function takes the results object from StackOverflow and returns the number of results and tags to be appended to DOM
var showResultsCounter = function (query, resultNum) {
    var results = resultNum + ' results for <strong>' + query + '</strong>';
    return results;
};

// takes error string and turns it into displayable DOM element
var showError = function (error) {
    var errorElem = $('.templates .error').clone();
    var errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
};
