$(document).ready(function(e) {
$('#add-to').button({icons:{primary: "ui-icon-circle-plus"}});
$('#new-todo').dialog({ modal : true, autoOpen : false });
$('#con-del').dialog({ modal : true, autoOpen : false }); //task 2.8
$('#edit').dialog({ modal : true, autoOpen : false });

var currentTask;

$('#add-todo').button({
icons: { primary: 'ui-icon-circle-plus'}}).click(
function() {
$('#new-todo').dialog('open');
});

//2.4 Add new tasks to the to-do list

$('#new-todo').dialog({
modal : true, autoOpen : false,
buttons : {
"Add task" : function () 
{

var taskName = $('#task').val();
if(taskName === ""){return false;}

//ajax call to server
var ERROR_LOG = console.error.bind(console);
$.ajax({
	method: 'POST',
	url: 'http://localhost:8080/post',
	data: JSON.stringify({
		task: taskName,
		done: false
	}),
	contentType: "application/json",
	dataType:"json"
});

var taskHTML = '<li><span class="done">%</span>';
taskHTML += '<span class="delete">x</span>';
taskHTML += '<span class="edit">+</span>';
taskHTML += '<span class="task"></span>';
taskHTML += '<span class ="id"></span></li>';
var $newTask = $(taskHTML);
$newTask.find('.task').text(taskName);

$newTask.hide();
$('#task').val("");
$('#todo-list').prepend($newTask);
$newTask.show('clip',250).effect('highlight',1000);
$(this).dialog('close');

},
"Cancel" : function () { $(this).dialog('close'); }
}
});

//2.5 Mark tasks as complete
$('#todo-list').on('click', '.done', function() {
	var $taskItem = $(this).parent('li');
	var taskName = $taskItem.find('.task').text();
	//console.log(taskName);
	$taskItem.slideUp(250, function() {
		var $this = $(this);
		$this.detach();
		$this.find('.edit').hide();
		$('#completed-list').prepend($this);
		$this.slideDown();

		$.ajax({
			method: 'PUT',
			url: 'http://localhost:8080/edit',
			data: JSON.stringify({
			task: taskName,
			id: $taskItem.find('.id').html(),
			command: "comp"
			}),
 			dataType: 'json',
 			contentType: 'application/json; charsett=utf-8'
		})
	});
});

//get task list from database
function getTaskList(){
	$.ajax({
		method: 'GET',
		url : 'http://localhost:8080/task',
		success: function(result){
			$('#todo-list').empty();
			$('#completed-list').empty();
			for(i = 0; i < result.length; i++){
				addTaskList(result[i]);
			}
		}
	})
}

//assigning the right item to the correct list
function addTaskList(data){
var taskName = data.item;
if(taskName == " "){return;}
var taskHTML = '<li><span class="done">%</span>';
taskHTML += '<span class="delete">x</span>';
taskHTML += '<span class="edit">+</span>';
taskHTML += '<span class="task"></span>';
taskHTML += '<span class ="id"></span></li>';
var $newTask = $(taskHTML);
$newTask.find('.task').text(taskName);
$newTask.find('.id').text(data.id);
$newTask.find('.id').hide();
$newTask.hide();

if(data.done){
	$('#completed-list').prepend($newTask);
	$newTask.find('.edit').hide();
	$newTask.slideDown();
}else{
	$('#todo-list').prepend($newTask);
	$newTask.show('clip',250).effect('highlight',1000);
}
}


//Show edit button when dragged back to to-do list
$('#completed-list').on('click', '.done', function() {
	var currentTask = $(this).parent('li');
	//var $taskItem = $(this).parent('li');
	currentTask.slideUp(250, function() {
	//var $this = $(this);
	var taskName = currentTask.find('.task').text();
	//$this.detach();
	currentTask.detach();
	//$this.find('.edit').show();
	currentTask.find('.edit').show();
	//$('#todo-list').prepend($this);
	$('#todo-list').prepend(currentTask);

	$.ajax({
      method: 'PUT',
	  url: 'http://localhost:8080/edit',
	  data: JSON.stringify({
	  	task: taskName,
	  	id: currentTask.find('.id').html(),
	  	command: "todo"
	  }),
	  dataType: 'json',
	  contentType: 'application/json; charsett=utf-8'
	})

	//$this.slideDown();
	currentTask.slideDown();
	});
});

//2.6 Support drag and drop
$('.sortlist').sortable({
	connectWith : '.sortlist',
	cursor : 'pointer',
	placeholder : 'ui-state-highlight',
	cancel : '.delete,.edit,.done',
	
	//triggering the sending list
	receive : function(event,ui){
		drag(ui); //undertake the dragging
	}
});

//this function supports the dragging of items between two lists
function drag(data){
	//Getting the different attributes of the item
	var send = data.sender.attr('id');
	var taskName = data.item.find('.task').text();
	var taskId = data.item.find('.id').text();

	console.log(send);
	console.log(taskName);
	console.log(taskId);
	//removing the edit button
	if(send == "completed-list"){
		data.item.find('.edit').show();
	}else if(send == "todo-list"){
		data.item.find('.edit').hide();
	}
	//calling the server to update the details of the list
	$.ajax({
      method: 'PUT',
	  url: 'http://localhost:8080/edit',
	  data: JSON.stringify({
	  	sender: send,
	  	task: taskName,
	  	id: taskId,
	  	command: "drag"
	  }),
	  dataType: 'json',
	  contentType: 'application/json; charsett=utf-8'
	})
}

//2.7 Delete tasks
$('.sortlist').on('click','.delete',function() {
	currentTask = $(this);
$('#con-del').dialog('open');
});

//2.8 confirmation deletion task
$('#con-del').dialog({
modal : true, autoOpen : false,
buttons : {
 "Confirm" : function(){
 		$(currentTask).parent('li').effect('puff', function() {$(currentTask).remove(); });
 		var id = $(currentTask).parent('li').find('.id').html();
 		$(this).dialog('close');

 		$.ajax({
 			method: 'DELETE',
 			url: 'http://localhost:8080/delete',
 			data: JSON.stringify({
 				id: id,
 				task: $(currentTask).parent('li').find('.task').text()
 			}),
 			dataType: 'json',
 			contentType: 'application/json; charsett=utf-8'
 		})

 	},
 "Cancel" : function(){$(this).dialog('close');}
}
});

//2.9 Edit function
$('.sortlist').on('click','.edit',function() {
currentTask = $(this).parent('li');
var vari = $(this).parent('li').find('.task').text();
$('#item').val(vari);
$('#edit').dialog('open');
});
    

$('#edit').dialog({
modal : true, autoOpen : false,
buttons : {
 "Confirm" : function(){
	
	var taskName = $('#item').val();
		$.ajax({
 			method: 'PUT',
 			url: 'http://localhost:8080/edit',
 			data: JSON.stringify({
 				id: currentTask.find('.id').html(),
 				task: taskName,
 				command: "edit"
 			}),
 			dataType: 'json',
 			contentType: 'application/json; charsett=utf-8'
 		})

	currentTask.find('.task').text(taskName);
	$(this).dialog('close');
 },
 "Cancel" : function(){$(this).dialog('close');}
}
})

getTaskList();

}); // end ready



