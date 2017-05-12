var express = require('express');
var app = express();
//postgres link 
var pg = require('pg');
bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT||8080;

//connect to databa
var connectionString = process.env.DATABASE_URL||"postgres://polutekape:myvuw2017@depot:5432/polutekape_jdbc";
var client = new pg.Client(connectionString);
client.connect();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
//access the directory
app.use(express.static(path.join(__dirname,'/NWEN304_Project_Part2')))



app.get('/task', function(request, response){

	//SQL Query > Select Data
	var query = client.query("SELECT * FROM todo");
	var results = [];
	//Stream results back one row at a time
	query.on('row',function(row){
		results.push(row);
	});

	//After all data is returned, close connection and return results
	query.on('end', function(){
		//client.end();
		response.send(results);
	});
});

app.post('/post', function (req,res){

	var post = "INSERT INTO todo (item,done) VALUES ('"+req.body.task+"',"+req.body.done+");";
	console.log(req.body.task);
	console.log(post);
	client.query(post, function (error){
		if(error){
			res.status(400).json({
				status: 'failed',
				message: 'posted task failed'
			});

		}else{
			res.status(201).json({
				status: 'success',
				message: 'successfully posted task'
			});
		}
	})
});

app.put('/edit', function (req,res){
//determining what the server needs to do
   	if(req.body.command == "edit"){
  	console.log("Item is now updated");
	var callEdit = "UPDATE todo SET item = '"+req.body.task+"' WHERE id = "+(req.body.id)+";";

       client.query(callEdit, function(error){
    	if(error){
    		res.status(400).json({
			status: 'failed',
			message: 'Update task failed'
		});
    	}else{
    		res.status(201).json({
    		status: 'success',
    		message: 'fail in update task'
    		});
    	}
      })
     }else if(req.body.command == "comp"){
     	console.log(req.body.task + " is added to the completed-list");
     	var callEdit = "UPDATE todo SET done = true WHERE id = "+(req.body.id)+";";
     	
     	client.query(callEdit, function(error){
    		if(error){
    			res.status(400).json({
				status: 'failed',
				message: 'Update task failed'
				});
    		}else{
    			res.status(201).json({
    			status: 'success',
    			message: 'fail in update task'
    			});
    		}
      })
	}else if(req.body.command == "todo"){
     	console.log(req.body.task + " is added to the todo-list");
     	var callEdit = "UPDATE todo SET done = false WHERE id = "+(req.body.id)+";";
     	
     	client.query(callEdit, function(error){
    		if(error){
    			res.status(400).json({
				status: 'failed',
				message: 'Update task failed'
				});
    		}else{
    			res.status(201).json({
    			status: 'success',
    			message: 'fail in update task'
    			});
    		}
      })
	}else if(req.body.command == "drag"){
		console.log(req.body.task + " is dragged into " + req.body.sender);
     	var callEdit;

     	if(req.body.sender == "todo-list"){
     		callEdit = "UPDATE todo SET done = true WHERE id = "+(req.body.id)+";";
     	}else if(req.body.sender == "completed-list"){
     		callEdit = "UPDATE todo SET done = false WHERE id = "+(req.body.id)+";";
     	}

     	client.query(callEdit, function(error){
    		if(error){
    			res.status(400).json({
				status: 'failed',
				message: 'Update task failed'
				});
    		}else{
    			res.status(201).json({
    			status: 'success',
    			message: 'fail in update task'
    			});
    		}
      })
	}

});

//delete task from database
app.delete('/delete', function (req, res){
    //res.send('Got a DELETE request at /user');
    var callDel = "DELETE FROM todo WHERE id = "+(req.body.id)+";";
    console.log(req.body.task +" is deleted");
    
    client.query(callDel, function(error){
    	if(error){
    		res.status(400).json({
			status: 'failed',
			message: 'delete task failed'
		});
    	}else{
    		res.status(201).json({
    		status: 'success',
    		message: 'successfully deleted task'
    	});
    	}
    })

});

app.listen(port, function(){
    console.log('Example app listening on port 8080!');
});
