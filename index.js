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

//arrays to hold the data from database queries
let employees = [];
let roles = [];
let departments = [];

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    getStarted();
});

//function to start of the program
function getStarted() {
    console.log(`
================================================================
===      ______                 _                            ===
===     |   __/ _ __ ___  _ __ | | ___  _   _  ___  ___      ===
===     |   _| |  _ '  _ \\  _ \\| |/ _ \\| | | |/ _ \\/ _ \\     ===
===     |  |___  | | | | | |_) | | (_) | |_| |  __/  __/     ===
===     |______|_| |_| |_|  __/|_|\\___/\\___, |\\___|\\___|     ===
===                      |__|           |___/                ===
===                                                          ===
===      __  __                                              ===
===     |  \\/  | __ _ _ __   __ _  __ _  ___ _ __            ===
===     | |\\/| |/ _' | '_ \\ / _' |/ _' |/ _ \\ '__|   (\\_/)   ===
===     | |  | | (_| | | | | (_| | (_| |  __/ |      (O.o)   ===
===     |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|      (> <)   ===
===                               |___/                      ===
================================================================
    `);
    init();
}

//initializes the initial database queries and first set of inquirer questions
function init() {
    //getting employee data from database to populate future inquirer questions
    connection.query("SELECT * FROM employee", function(err, res) {
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

    //getting role data from database to populate future inquirer questions
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

    //getting department data from database to populate future inquirer questions
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
    .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Add department, role, or employee",
            "View departments, roles, or employees",
            "Delete departments, roles, or employees",
            "Update employee role",
            "Update employee manager",
            "Exit"
        ]
    })
    .then(function(answer) {
        switch(answer.action) {
            case "Add department, role, or employee":
                add();
                break;

            case "View departments, roles, or employees":
                view();
                break;

            case "Delete departments, roles, or employees":
                del();
                break;

            case "Update employee role":
                updateRole();
                break;

            case "Update employee manager":
                updateManager();
                break;


            case "Exit":
                connection.end();
                break;
        }
    });
}

//inquirer questions to give the user options on what they'd like to add
function add() {
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

//function to view either the departments, roles, or employees
function view() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "Would you like to view departments, roles, or employees?",
        choices: [
            "Departments",
            "Roles",
            "Employees"
        ]
    })
    .then(function(answer) {
        switch (answer.choice) {
            case "Departments":
                connection.query("SELECT name as Departments FROM department", function(err,result) {
                    if (err) throw err;
                    console.log(`
                    `);
                    console.table(result);
                    init();
                });                
                break;

            case "Roles":
                connection.query("SELECT role.title as Role, department.name as Department FROM role LEFT JOIN department on role.department_id=department.id", function(err,result) {
                    if (err) throw err;
                    console.log(`
                    `);
                    console.table(result);
                    init();
                }); 
                break;

            case "Employees":
                connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title as role, role.salary, department.name as department, manager_id as manager FROM employee LEFT JOIN role on employee.role_id=role.id LEFT JOIN department on role.department_id=department.id", function(err,result) {
                    if (err) throw err;
                    console.log(`
                    `);
                    console.table(result);
                    init();
                });
                break;
        }
    })
}

//inquirer questions to give the user options on what they'd like to delete
function del() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "Would you like to delete a department, role, or employee?",
        choices: [
            "Department",
            "Role",
            "Employee"
        ]
    })
    .then(function(answer) {
        switch (answer.choice) {
            case "Department":
                deleteDepartment();
                break;

            case "Role":
                deleteRole();
                break;

            case "Employee":
                deleteEmployee();
                break;
        }
    })

}

//function to update the employee role
function updateRole() {

    inquirer
    .prompt([
        {
            name: "employeeRoleChange",
            type: "list",
            message: "Which employee needs a role change?",
            choices: employees
        },
        {
            name: "updatedRole",
            type: "list",
            message: "What is the employee's new role?",
            choices: roles
        }
    ])
    .then(function(answer) {
        connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
                {role_id: answer.updatedRole},
                {id: answer.employeeRoleChange}
            ],
            function(err) {
                if(err) throw err;
                console.log(`
                Employee's role successfully updated
                `);
        });
        connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee LEFT JOIN role on employee.role_id=role.id LEFT JOIN department on role.department_id=department.id", function(err,result) {
            if (err) throw err;
            console.table(result);
            init();
        });                       
    })  
}

//function to update the employee manager
function updateManager() {

    inquirer
    .prompt([
        {
            name: "employeeManagerChange",
            type: "list",
            message: "Which employee needs a manager change?",
            choices: employees
        },
        {
            name: "updatedManager",
            type: "list",
            message: "Who is the employee's new Manager?",
            choices: employees
        }
    ])
    .then(function(answer) {
        connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
                {manager_id: answer.updatedManager},
                {id: answer.employeeManagerChange}
            ],
            function(err) {
                if(err) throw err;
                console.log(`
                Employee's manager successfully updated
                `);
        });
        connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee LEFT JOIN role on employee.role_id=role.id LEFT JOIN department on role.department_id=department.id", function(err,result) {
            if (err) throw err;
            console.table(result);
            init();
        });                       
    })  
}

//function to add new employees
function addEmployee() {
    employees.push({
        name: "No Manager",
        value: null
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
                console.log(`
                Employee successfully added
                `);
                init();
        });                     
    });
                                 
}

//function to add new roles
function addRole() {
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
                        console.log(`
                        New Role "${answer.role}" successfully added
                        `);
                        init();
                });
            }
        });
    });
}

//function to add new departments
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
                        console.log(`
                        New Department "${answer.department}" successfully added
                        `);
                        init();
                }); 
            }
        });
    });
}

//function to delete employees
function deleteEmployee() {
    len = employees.length;
    employees = employees.slice(0,len);
    inquirer
    .prompt({
        name: "delEmployee",
        type: "list",
        message: "What is the name of the employee you would like to delete?",
        choices: employees
    })
    .then(function(answer) {
        connection.query("DELETE FROM employee WHERE ?", {id:answer.delEmployee}, function(err) {
            if(err) throw err;
            console.log(`
            Employee has been deleted from the database.
            `);
            init();
        }); 
    });
}

//function to delete departments
function deleteDepartment() {
    inquirer
    .prompt({
        name: "delDepartment",
        type: "list",
        message: "What is the name of the department you would like to delete?",
        choices: departments
    })
    .then(function(answer) {
        connection.query("DELETE FROM department WHERE ?", {id:answer.delDepartment}, function(err) {
            if(err) throw err;
            console.log(`
            Department has been deleted from the database.
            `);
            init();
        }); 
    });
}

//function to delete roles
function deleteRole() {
    inquirer
    .prompt({
        name: "delRole",
        type: "list",
        message: "What is the name of the role you would like to delete?",
        choices: roles
    })
    .then(function(answer) {
        connection.query("DELETE FROM role WHERE ?", {id:answer.delRole}, function(err) {
            if(err) throw err;
            console.log(`
            Role has been deleted from the database.
            `);
            init();
        }); 
    });
}

