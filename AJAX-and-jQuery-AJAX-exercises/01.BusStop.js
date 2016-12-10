function getInfo(selector) {
    $('#submit').on('click', function (e) {
        $('#buses').empty();
        let stopId = $(selector).val();
        let url = 'https://judgetests.firebaseio.com/businfo/' + stopId + '.json';

        $.ajax({
            method: "GET",
            url: url,
            success: success,
            error: displayError
        });

        function success(list) {
            console.dir(list)
            if(list === null){
                return displayError();
            }
            $('#stopName').text(list.name);
            let buses = list.buses;
            for (let id in buses) {
                let li = $('<li>').text(`Bus ${id} arrives in ${buses[id]} minutes`)
                $('#buses').append(li);
            }
        }
        function displayError(err) {
            $("#stopName").text('Error');
        }

    })
}