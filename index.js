const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
});

let employees = [{
    name: "No Manager",
    value: null
}];
let roles = [];
let departments = [];

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    init();
})

function init() {
    employees = [{
        name: "No Manager",
        value: null
    }];
    roles = [];

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
                viewEmployees();
                break;
        }
    })
}

function viewEmployees() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "Which would you like to view?",
        choices: [
            "View all Employees",
            "View Employees by Manager",
            "View Employees by Department",
            "View Employees by Role"
        ]
    })
    .then(function(answer) {
        switch (answer.choice) {
            case "View all Employees":
                connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee LEFT JOIN role on employee.role_id=role.id LEFT JOIN department on role.department_id=department.id", function(err,result) {
                    if (err) throw err;
                    console.table(result);
                    init();
                })
                
                break;

            case "View Employees by Manager":
                
                break;

            case "View Employees by Department":
                
                break;

            case "View Employees by Role":
            
                break;
        }
    })

}

function update() {

}

function addEmployee() {
    connection.query("SELECT first_name, last_name, id FROM employee", function(err, res) {
        if(err) throw err;
        for(i=0; i < res.length; i++) {
            let name =
            {    
                name: res[i].first_name + " " + res[i].last_name,
                value: res[i].id
            }
            employees.push(name);
        }
    });

    connection.query("SELECT title, id FROM role", function(err,res) {
        if(err) throw err;
        for (i = 0; i < res.length; i++){
            let role = 
            {
                name:res[i].title,
                value:res[i].id
            }
            roles.push(role);
        }
    });
    
    inquirer
    .prompt([
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
            type: "list",
            message: "Please select the employee role",
            choices: roles
        },
        {
            name: "employeeManager",
            type: "list",
            message: "Who is the employee's Manager?",
            choices: employees
        }
    ])
    .then(function(answer) {
        connection.query(
            "INSERT INTO employee SET ?",
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.employeeRole,
                manager_id: answer.employeeManager
            },
            function(err) {
                if(err) throw err;
                console.log("Employee successfully added");
        });

        connection.query ("SELECT * FROM employee WHERE ?",{first_name:answer.firstName}, function(err,res) {
            if(err) throw err;
            console.table(res);
            init();
        })
                                    
    })  
                                 
}
                                    
function addRole() {
    connection.query("Select name, id FROM department", function(err,res) {
        if(err) throw err;
        for (i = 0; i < res.length; i++){
            let department = 
            {
                name: res[i].name,
                value: res[i].id
            }
            departments.push(department);
        }
    });
        
        inquirer
        .prompt([{
            name: "role",
            type: "input",
            message: "What is the name of the role you would like to add?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary for this role?"
        },
        {
            name: "department",
            type: "list",
            message: "Please chose a department for this role",
            choices: departments    
        }
        ])
        .then(function(answer) {
        connection.query("SELECT * FROM role WHERE ?", {title:answer.role}, function(err,res) {
            if(err) throw err;
            if (res.length > 0) {
                console.log("That role already exists. Please try again.");
                addRole();
            } else {
                connection.query("INSERT INTO role set ?", 
                    {
                        title:answer.role,
                        salary:answer.salary,
                        department_id:answer.department
                    }, 
                    function(err) {
                        if(err) throw err;
                        console.log(`New Role "${answer.role}" successfully added`);
                        init();
                
                })
            }
                
        })
    })

    
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
            if (res.length > 0) {
                console.log("That department already exists. Please try again.");
                addDepartment();
            } else {
                connection.query("INSERT INTO department set ?", {name:answer.department}, function(err) {
                        if(err) throw err;
                        console.log(`New Department "${answer.department}" successfully added`);
                        init();
                    })
            }
                
        })
    })
}

