let loadAll, createCard, createTask, pin;

let masterList = {
    Random: {
        tasks: [],
        top: '0',
        left: '0'
    }
};

// ---------------------
//  Usability Functions
// ---------------------

// Makes notes draggable/resizable
function dynamicNotes() {
    $(".draggable").draggable({handle: ".pin", containment: "parent",});

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

//Stores note info
function update() {
    let todo = JSON.stringify(masterList);
    localStorage.setItem('todo', todo);
}

// Reloads all your notes from local storage on page load
function reload() {
    let local = localStorage.getItem('todo');
    if (local) {
        masterList = JSON.parse(local);

        // Adds saved notes
        for (list in masterList) {
            if (list !== 'Random') {
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
                masterList['Random'].tasks.forEach(function (val) {
                    let task = buildTask(val);
                    $($('#Random').find('.note-todo-list')[0]).append(task);
                });
                $('#Random').css({top: masterList['Random'].top, left: masterList['Random'].left})
            }
        }
    }
    dynamicNotes(); //makes dynamically added after load notes Dynamic
}

// Checks to see if Return was hit on an input and then submits it
function checkKey(event, func) {
    let el = event.currentTarget;
    if (event.which === 13) {
        func(el);
    }
}

//Removes everything from local storage
function clearCache() {
    localStorage.clear();
}

// --------------
//  Error Modals
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

$('.task-error').dialog({
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false,
    open: () => {
        $('body').bind('click', function () {
            $('.dialog').dialog('close');
        })
    }
});

function duplicateNote() {
    $('.note-error').dialog('open');
}

function duplicateTask() {
    $('.task-error').dialog('open');
}

// ----------------
//  New Notes/Tasks
// ----------------

// BUILDS HTML for Note
function buildNote(name, html2of3 = '', top = '0', left = '0') {
    let html1of3 =
        `<div class="note draggable resizable" 
              style="position:absolute; top: ${top}px; left: ${left}px;">
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

// BUILDS HTML for Task
function buildTask(task) {
    return `<div class="todo-item">
        <i class="pointer fas fa-times warn" onclick="deleteItem(this)"></i>
        <div class="todo-text" contenteditable="false">${task}</div>
    <input type="checkbox" class="" onclick="taskDone($(this))"/>
</div>`;
}



// Add a new Note to the List
function addNote(element) {
    event.stopPropagation(); //Stops odd click behavior

    let top = ($('.board').height() - 300) * (Math.random().toFixed(2));
    let left = ($('.board').width() - 300) * (Math.random().toFixed(2));
    let myval = element.value;

    if (masterList.hasOwnProperty(myval)) {
        duplicateNote();
    } else {
        let note = buildNote(myval, '', top, left);
        $('.board').append(note);
        $(".note-input").val("").focus();
        console.log($(note));
        console.log(note);


        masterList[myval] = {   //Adds Note to master list
            tasks: [],
            top: top,
            left: left
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
    let index = masterList[note].tasks.indexOf(task);
    if (index !== -1) {
        duplicateTask();
    } else {
        el.parent().siblings('.note-todo-list').append(buildTask(task));
        masterList[note].tasks.push(task);
        el.val("").focus();
    }

    update();
}

// ---------------------
//  Note/Task Deletions
// ---------------------

function deleteNote(el) {
    el = $(el);
    let title = el.siblings('.note-title')[0].innerText;
    delete masterList[title];
    el.parent().parent().remove();
    update();
}

function deleteItem(el) {
    el = $(el);
    let title = el.closest('.note-todo-list').siblings('.note-title')[0].innerText;
    let task = el.siblings('.todo-text')[0].innerText;
    let array = masterList[title].tasks;
    let index = array.indexOf(task);

    el.parent().remove();
    if (index !== -1) {
        array.splice(index, 1);
    }
    update();
}

function taskDone(el) {
    el = $(el).parent('.todo-item');
    el.hasClass('done') ? el.removeClass('done') : el.addClass('done')
}

function clearFinishedTasks() {
    let finished = $('body').find('.done');
    $.each(finished, (indx, el) => {
        el = $(el);
        let task = el.find('.todo-text')[0].innerText;
        let note = el.parent().siblings('.note-title')[0].innerText;
        let array = masterList[note].tasks;
        let index = array.indexOf(task);
        array.splice(index, 1);
        el.remove();
    });
    update()
}

// -------------------
//  On Load Functions
// -------------------
dynamicNotes();     // Runs Resizable/Draggable on load

reload();           // Gets info from local storage and recreates the notes

