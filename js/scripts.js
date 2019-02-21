// $("#sortable").sortable({ handle: ".header" });
$(".draggable").draggable({handle: ".pin", containment: "parent",});

$(".resizable").resizable({
    aspectRatio: true,
    stop: function (event, el) {
        let height = el.size.height * .2;
        let width = el.size.width * .2;
        $(this).children('.pin').css({'height': height, 'width' : width});

        //TODO Add Padding to the main body proportionate to size of card

    }
});

//Cursor Logic
$(".pin").on("mousedown", function () {
    $(this).addClass("grabbed");
}).on("mouseup", function () {
    $(this).removeClass("grabbed");
});


$(" .ui-resizable-handle").css('z-index', '0');

let loadAll, createCard, createTask;

let array = ['zero', 'one', 'two', 'three'];
array.splice(1, 2, 'five');
console.log(array);


console.log("Hooray!");


function addItem(el) {
    let myval = $(el).val();
    console.log(myval);
    $(".list").append("<div class='row'>" +
        "<i onclick='deleteItem(this)' class='fas fa-trash'></i>" +
        "<span contenteditable='true'>" + myval + "</span>" +
        "</div>");
    $(".myinput").val("");
    $(".myinput").focus();
}


function checkKey(event) {
    console.log($(this).valueOf());

    // (event.which === 13) ? addItem(el) : '';
}

function deleteItem(element) {
    $(element).parent().remove();
}


loadAll = function () {
    //loop through object and make cards on load

    //loop through cards and make tasks on load
};

createCard = function () {
    //loop through masterlist and to add naming scema

    //append to html

};

createTask = function () {


    //loop through card object and add nameing schema

    //append to html
};


let masterList = {
    unassigned: {name: 'Unassigned:', tasks: []}

};


let addList = function (name) {
    masterList[name] = [];
//Need to make an html element for the list.
// '<option> + task + '></option>' for example
//    so you can target the id to grab the tsk to delete later
};


addTaskToList = function (task) {
    let name = document.getElementById('selectBar').value || 'unassigned';
    masterList[name].push(task);
//Need to make an html element for the task.
// '<li id="' + task + '"></li>' for example
//    so you can target the id to grab the tsk to delete later
};


