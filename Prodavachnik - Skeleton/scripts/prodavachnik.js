function startApp() {
    //sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(listAdds);
    $("#linkCreateAd").click(showCreateAddView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    $("#formLogin").submit(loginUser);
    $("#formRegister").submit(registerUser);
    $("#formCreateAd").submit(createAdd);
    $("#formEditAd").submit(editAdd);

    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!");
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();
            $("#loggedInUser").show();
        } else {
            // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
        }
    }

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_Hyfw6UVze";
    const kinveyAppSecret =
        "44bfcabf47b14068b53fcef159a83e20";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " +
        btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function listAdds() {
        $('#ads').empty();
        showView('viewAds');
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adds",
            headers: getKinveyUserAuthHeaders(),
            success: loadAddsSuccess,
            error: handleAjaxError
        });
        function loadAddsSuccess(adds) {
            showInfo('Adds loaded.');
            if (adds.length == 0) {
                $('#ads').text('No adds in the library.');
            } else {
                $('#ads').empty();
                let addsTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th><th>Description</th>',
                        '<th>Publisher</th><th>Date Published</th><th>Price</th><th>Actions</th>'));
                for (let add of adds)
                    appendBookRow(add, addsTable);
                $('#ads').append(addsTable);
            }
        }
        function appendBookRow(add, addsTable) {

            let detailsLink = $('<a href="#">[Read More]</a>')
                .click(function () { viewMore(add) });
            let links = [detailsLink];
            if (add._acl.creator == sessionStorage['userId']) {
                let deleteLink = $('<a href="#">[Delete]</a>')
                    .click(function () { deleteBook(add) });
                let editLink = $('<a href="#">[Edit]</a>')
                    .click(function () { loadAddForEdit(add) });
                links = [detailsLink, ' ', deleteLink, ' ', editLink];
            }

            addsTable.append($('<tr>').append(
                $('<td>').text(add.title),
                $('<td>').text(add.description),
                $('<td>').text(add.publisher),
                $('<td>').text(add.date),
                $('<td>').text(add.price),
                $('<td>').append(links)
            ));
        }
    }

    function deleteBook(add) {
        $.ajax({
            method: "DELETE",
            url: kinveyBookUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/adds/" + add._id,
            headers: getKinveyUserAuthHeaders(),
            success: deleteAddSuccess,
            error: handleAjaxError
        });
        function deleteAddSuccess(response) {
            listAdds();
            showInfo('Add deleted.');
        }
    }

    function showCreateAddView() {
        $('#formCreateAd').trigger('reset');
        showView('viewCreateAd');
    }

    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }
    
    function loginUser(e) {
        e.preventDefault()
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: handleAjaxError
        });
        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdds();
            showInfo('User registration successful.');
        }
    }

    function registerUser(e) {
        e.preventDefault();
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: registerSuccess,
            error: handleAjaxError
        });
        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdds();
            showInfo('User registration successful.');
        }
    }
    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " +
            sessionStorage.getItem('authToken'),
        };
    }
    function createAdd(e) {
        e.preventDefault();
        let author = $('#loggedInUser').text();
        let user = author.slice(9, author.length - 1);
        let bookData = {
            title: $('#formCreateAd input[name=title]').val(),
            description: $('#formCreateAd textarea[name=description]').val(),
            publisher: sessionStorage.getItem('username'),
            date: $('#formCreateAd input[name=datePublished]').val(),
            price: $('#formCreateAd input[name=price]').val(),
            image: $('#formCreateAd input[name=image]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adds",
            headers: getKinveyUserAuthHeaders(),
            data: bookData,
            success: createBookSuccess,
            error: handleAjaxError
        });
        function createBookSuccess(response) {
            listAdds();
            showInfo('Ad created.');
        }
    }
    
    function editAdd(e) {
        e.preventDefault();
        let addData = {
            title: $('#formEditAd input[name=title]').val(),
            description: $('#formEditAd textarea[name=description]').val(),
            publisher: $('#formEditAd input[name=publisher]').val(),
            date: $('#formEditAd input[name=datePublished]').val(),
            price: $('#formEditAd input[name=price]').val(),
            image: $('#formEditAd input[name=image]').val()
        };
        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey +
            "/adds/" + $('#formEditAd input[name=id]').val(),
            headers: getKinveyUserAuthHeaders(),
            data: addData,
            success: editAddSuccess,
            error: handleAjaxError
        });

        function editAddSuccess(response) {
            listAdds();
            showInfo('Ad edited.');
        }

    }

    function loadAddForEdit(add) {
        $.ajax({
            method: "GET",
            url: kinveyBookUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/adds/" + add._id,
            headers: getKinveyUserAuthHeaders(),
            success: loadBookForEditSuccess,
            error: handleAjaxError
        });
        function loadBookForEditSuccess(add) {
            $('#formEditAd input[name=id]').val(add._id);
            $('#formEditAd input[name=publisher]').val(add.publisher);
            $('#formEditAd input[name=title]').val(add.title);
            $('#formEditAd input[name=datePublished]')
                .val(add.date);
            $('#formEditAd input[name=price]')
                .val(add.price);
            $('#formEditAd textarea[name=description]')
                .val(add.description);
            $('#formEditAd input[name=image]')
                .val(add.image);
            showView('viewEditAd');
        }
    }

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        $('#loggedInUser').text(
            "Welcome, " + username + "!");
    }

    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }

    function viewMore(add) {
        $.ajax({
            method: "GET",
            url: kinveyBookUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/adds/" + add._id,
            headers: getKinveyUserAuthHeaders(),
            success: viewMoreAddSuccess,
            error: handleAjaxError
        });
        $('#viewMore').empty();
        function viewMoreAddSuccess(add) {
            let html = $('<div>');
            html.append(
              $('<img>').attr('src', add.image),
                $('<br>'),
                $('<label>').text('Price'),
                $('<h1>').text(add.price),
                $('<label>').text('Title'),
                $('<h1>').text(add.title),
                $('<label>').text('Description'),
                $('<p>').text(add.description),
                $('<label>').text('Publisher'),
                $('<div>').text(add.publisher),
                $('<label>').text('Date'),
                $('<div>').text(add.datePublished)
            );
            $('#viewMore').append(html);
            showView('viewMore');
        }
    }


    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }
}