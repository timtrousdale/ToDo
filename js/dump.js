let masterList = {
    Unassigned: {
        tasks: [],
        top: '0',
        left: '0'
    }
};

let loadAll, createCard, createTask, pin;

function dynamicNotes() {
    // Makes notes draggable
    $(".draggable").draggable({handle: ".pin", containment: "parent",});

    // Makes notes resizable
    $(".resizable").resizable({
        aspectRatio: true,
        resize: (event, ui) => {
            let el = ui.element;
            let height = el.height() * .2;
            let width = el.width() * .2;

            el.children('.pin').css({
                'height': height,
                'width': width
            });
            el.children('.note-body').css({
                'padding-top': height,
                'padding-left': (width / 2),
                'padding-right': (width / 2)
            });
        }
    });

    // Keeps resize icon from floating to the front of page
    $(".ui-resizable-handle").css('z-index', '0');
}

// Pin Cursor Logic
$(".board").on("mousedown", '.pin', function () {
    pin = $(this);      // Used for on mouseup since it targets window
    pin.addClass("grabbed");
}).on("mouseup", '.pin', function () {
    pin.removeClass("grabbed");
    let top = pin.parent()[0].offsetTop;
    let left = pin.parent()[0].offsetLeft;
    let name = pin.parent().find('.note-title')[0].innerText;
    masterList[name].top = top;
    masterList[name].left = left;
    update();           // Updates note location in local storage
});


//Gets the Note name/Task Name to update masterList
function update() {
    let todo = JSON.stringify(masterList);
    localStorage.setItem('todo', todo);
}

function reload() {  // Reloads all your notes from local storage on page load
    let local = localStorage.getItem('todo');
    if (local) {
        masterList = JSON.parse(local);

        // Adds saved notes
        for (list in masterList) {
            if (list !== 'Unassigned') {
                let ob = masterList[list];
                let top = ob.top;
                let left = ob.left;
                let tasks = '';

                ob.tasks.forEach((task) => {
                    task = buildTask(task);
                    tasks += task;
                });

                let el = buildNote(list, tasks, top, left);
                $('.board').append(el);


            } else {
                masterList['Unassigned'].tasks.forEach(function (val) {
                    let task = buildTask(val);
                    $($('#Unassigned').find('.note-todo-list')[0]).append(task);
                });
                $('#Unassigned').css({top: masterList['Unassigned'].top, left: masterList['Unassigned'].left})
            }
        }
    }
    dynamicNotes(); //makes dynamically added after load notes Dynamic
}


function clearCache() {
    localStorage.clear();
}


// --------------
//  Error Modal
// --------------

$('.note-error').dialog({
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false,
    open: () => {
        $('body').bind('click', function () {
            $('.dialog').dialog('close');
        })
    }
});

function duplicateNote(el) {
    $('.note-error').dialog('open');
}


// --------------
//  New Notes/Tasks
// --------------

function buildNote(name, html2of3, top = 0, left = 0) {
    if (!top || !left) {
        top = ($('body').height() - 300) * (Math.random().toFixed(2));
        left = ($('body').width() - 300) * (Math.random().toFixed(2));
    }

    let html1of3 =
        `<div class="note draggable resizable" 
              style="position:absolute; top: ${top}px; left: ${left}px">
            <div class="pin grab"></div>
            <div class="note-body">
            <i class="pointer fas fa-times warn delete-note" 
               onclick="deleteNote(this)"></i>
            <div class="note-title">${name}</div>
            <div class="note-todo-list">`;
    let html3of3 =
        `</div>
        <div class="todo-item">
            <input class="todo-input" type="text" 
                   placeholder="+new task" onkeyup="checkKey(event, addTask)">
            <button class="pointer" 
                    onclick="addTask($(this).siblings(\'.todo-input\')[0])">+add
            </button>
            </div></div></div>`;

    return (html1of3 + html2of3 + html3of3);
}


function buildTask(task) {
    let taskHTMLOne = '<div class="todo-item">' +
        '<div><i class="pointer fas fa-times warn" onclick="deleteItem(this)"></i>' +
        '<span class="todo-text" contenteditable="false">';
    let taskHTMLTwo = '</span></div>' +
        '<input type="checkbox" class="" onclick="taskDone($(this))" /></div>';

    return (taskHTMLOne + task + taskHTMLTwo)
}

// Add a new Note to the List
function addNote(element) {
    event.stopPropagation(); //Stops click behavior

    let myval = element.value;
    if (masterList.hasOwnProperty(myval)) {
        duplicateNote();
    } else {
        console.log('runs');
        let note = buildNote(myval);
        $('.board').append(note);
        $(".note-input").val("").focus();

        masterList[myval] = {   //Adds Note to master list
            tasks: [],
            top: 0,
            left: 0
        };

        dynamicNotes();     //makes new note draggable and resizable

    }
    update();
}

// Adds a new to-do item to a Note
function addTask(element) {
    event.stopPropagation();
    let el = $(element);
    let task = el.val();
    let note = el.parent().siblings('.note-title')[0].innerText;

    el.parent().siblings('.note-todo-list').append(buildTask(task));
    masterList[note].tasks.push(task);
    el.val("").focus();

    update();
}

// Checks to see if Return was hit on an input and then submits it
function checkKey(event, func) {
    let el = event.currentTarget;
    if (event.which === 13) {
        func(el);
    }
}

function deleteNote(el) {
    el = $(el);
    let title = el.siblings('.note-title')[0].innerText;
    delete masterList[title];
    el.parent().parent().remove();
    update();
}

function deleteItem(el) {
    el = $(el);
    let title = el.parent().parent().parent().siblings('.note-title')[0].innerText;
    let task = el.siblings('.todo-text')[0].innerText;
    let array = masterList[title].tasks;
    let index = array.indexOf(task);

    el.parent().parent().remove();
    if (index !== -1) {
        array.splice(index, 1);
    }
    update();
}

function taskDone(el) {
    el = $(el).parent('.todo-item');
    el.hasClass('done') ? el.removeClass('done') : el.addClass('done')
}


dynamicNotes();     // Runs Resizable/Draggable on load

reload();           // Gets info from local storage and recreates the notes

function clearFinishedTasks() {
    let finished = $('body').find('.done');
    $.each(finished, (index, el) => {
            el = $(el);
            let note = el.parent().siblings('.note-title')[0].innerText;
            console.log(masterList[note].tasks);
        }
    );

}

//Clear finished should go search for all el with finished class and then run through the array and delete the masterlist/el
