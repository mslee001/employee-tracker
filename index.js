var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    init();
})

function init() {
    inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Add department, role, or employee?",
            "View departments, roles, or employees?",
            "Update employee roles?",
            "exit"
        ]
    })
    .then(function(answer) {
        switch(answer.action) {
            case "Add department, role, or employee?":
                addition();
                break;

            case "View departments, roles, or employees?":
                view();
                break;

            case "Update employee roles?":
                update();
                break;

            case "exit":
                connection.end();
                break;
        }
    });
}

function addition() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "Would you like to add a department, role, or employee?",
        choices: [
            "Department",
            "Role",
            "Employee"
        ]
    })
    .then(function(answer) {
        switch (answer.choice) {
            case "Department":
                addDepartment();
                break;

            case "Role":
                addRole();
                break;

            case "Employee":
                addEmployee();
                break;
        }
    })

}

function view() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "Would you like to view a department, role, or employee?",
        choices: [
            "Department",
            "Role",
            "Employee"
        ]
    })
    .then(function(answer) {
        switch (answer.choice) {
            case "Department":
                
                break;

            case "Role":
                
                break;

            case "Employee":
                
                break;
        }
    })

}

function update() {

}

function addEmployee() {
    inquirer
    .prompt([
    {
        name: "employeeId",
        type: "input",
        message: "What is the employee's ID?"
    },
    {
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?"
    },
    {
        name: "lastName",
        type: "input",
        message: "What is the employees last name?"
    },
    {
        name: "employeeRole",
        type: "input",
        message: "What is the employee's role?"
    },
    {
        name: "employeeManager",
        type: "input",
        message: "Who is the employee's Manager?"
    }
    ])
    .then(function(answer) {
        connection.query(
            "INSERT INTO employee SET ?",
            {
                id: answer.employeeId,
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.employeeRole,
                manager_id: answer.employeeManager
            },
            function(err) {
                if(err) throw err;
                console.log("Employee successfully added");
            }
        )
        connection.query ("SELECT * FROM employee WHERE ?",{first_name:answer.firstName}, function(err,res) {
            if(err) throw err;
            console.table(res);
            init();
        })

})
}

function addRole() {

}

function addDepartment() {
    inquirer
    .prompt({
        name: "department",
        type: "input",
        message: "What is the name of the department you would like to add?"
    })
    .then(function(answer) {
        connection.query("SELECT * FROM department WHERE ?", {name:answer.department}, function(err,res) {
            if(err) throw err;
            console.log(res)
            console.log(answer.department);
            if (res.length > 0) {
                console.log("That department already exists. Please try again.");
                addDepartment();
            } else {
                connection.query("INSERT INTO department set ?", {name:answer.department}, function(err) {
                        if(err) throw err;
                        console.log(`New Department ${answer.department} successfully added`);
                    })
            }
                
        })
    })
}