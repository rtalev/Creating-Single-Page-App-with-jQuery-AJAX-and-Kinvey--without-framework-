function attachEvents() {
    $('#btnLoad').click(loadContacts);
    $('#btnCreate').click(createContacts);

    let baseUrl='https://phonebook-nakov.firebaseio.com/phonebook';

    function loadContacts() {
        $('#phonebook').empty();
        $.get(baseUrl + '.json')
            .then(displayContacts)
            .catch(displayError)
    }

    function displayError(err) {
        $('#phonebook').html($('<li>Error</li>'))
    }

    function displayContacts(contacts) {
        let keys=Object.keys(contacts);
        for (let key of keys){
            let contact=contacts[key];
            let text=contact.person +': '+ contact.phone + ' ';
            let textJSON=JSON.stringify(text);
            let li=$('<li>');
            li.text(text)
            li.appendTo($('#phonebook'));
            li.append($('<button> Delete</button>').click(function()
            {
                deleteContact(key)
            }))
        }

    }

    function createContacts() {
        let person=$('#person').val();
        let phone=$('#phone').val();
        let newContact={person,phone};
        let createRequest={
            method:"POST",
            url:baseUrl+'.json',
            data:JSON.stringify(newContact)
        };

        $.ajax(createRequest)
            .then(loadContacts)
            .catch(displayError);
        $('#person').val('');
        $('#phone').val('');
    }



    function deleteContact(key) {
        let delRequest={
            method:"DELETE",
            url: baseUrl + '/' + key + '.json'
        };
        $.ajax(delRequest)
            .then(loadContacts)
            .catch(displayError)
    }

}