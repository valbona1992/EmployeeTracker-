const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const logo = require("asciiart-logo");
const connection = require("./config/connection");

init();

function init() {
    const logoText = logo({ name: "Employee Manager" }).render();
    console.log(logoText);
    mainPrompt();
  };

function mainPrompt() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Roles", "View All Departments","Add Department", "Quit"],
      },
    ])
    .then((answer) => {
        console.log(answer.choice);
        switch (answer.choice) {
          case "View All Employees":
            viewEmployees();
            break;
          case "Add Employee":
            addEmployees();
            break;
        case "Update Employee Role":
            updateRoles();
            break;
          case "View All Roles":
            viewRoles();
            break;
          case "Add Roles":
            addRoles();
            break;
          case "View All Departments":
            viewDepartments();
            break;
          case "Add Department":
            addDepartments();
            break;
          default:
            console.log("Goodbye");
            connection.end();
        }
      });
  };

function viewEmployees() {
connection.query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, roles.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) as Manager FROM employees LEFT JOIN roles on employees.role_id = roles.id LEFT JOIN department ON roles.department_id= department.id LEFT JOIN employees manager on manager.id = employees.manager_id;", function (err, results) {
    if (err) throw err;
    console.table(results);
    mainPrompt();
});
};

function addEmployees() {
    connection.query("SELECT id, title FROM roles",function (err, data) {
      if (err) throw err;
    const roles = data.map(item => {
      return {value:item.id, name:item.title}
    })
    connection.query("SELECT id, first_name, last_name, manager_id FROM employees",function (err, data) {
      if (err) throw err;
    const managers = data.map(item => {
      return {value:item.id, name:item.first_name, name:item.last_name}
    })
    managers.unshift("No manager");
    
    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the new employee's first name?",
        name: "firstName",
      },
      {
        type: "input",
        message: "What is the new employee's last name?",
        name: "lastName",
      },
      {
        type: "list",
        message: "Choose a role for the new employee.",
        name: "role",
        choices: roles,
      },
      {
        type: "list",
        message: "Choose a manager for the new employee.",
        name: "manager",
        choices: managers,
      },
    ])
    .then(results=> {
        if (results["manager"] == "No manager"){
            results["manager"] = null;
        }
        connection.query("INSERT INTO employees SET ?", {first_name: results.firstName, last_name: results.lastName, role_id:results.role, manager_id:results.manager}, function (err, results) {
        if (err) throw err;
        console.table(results);
        console.log("Employee added to the database!");
        viewEmployees();
        });
    })
  })
  })
  };

function updateRoles() {
    connection.query("SELECT * FROM employees", function (err, data) {
        if (err) throw err;
        const employeeChoice = data.map(item=> {
        return {name:item.last_name}
        })
    connection.query("SELECT * FROM roles", function (err, data){
        if (err) throw err;
        const roleChoice= data.map(item=> item.title)
    inquirer.prompt ([
          {
            type: "list",
            name: "employeeName",
            message: "Choose an employee to update",
            choices: employeeChoice,
          },
          {
            type: "list",
            name: "role",
            message: "Choose a role for the employee ",
            choices: roleChoice,
          },
        ])
        .then(results => {
          connection.query("UPDATE employees INNER JOIN roles ON employees.role_id = roles.id SET ? WHERE ?", [{title: results.role},{last_name: results.employeeName}], function (err, results) {
          if (err) throw err;
            console.table(results);
            console.log("Updated employee's role!");
            viewEmployees();
            });
        });
    }
    )}
)};

function viewRoles() {
    connection.query("SELECT roles.id, roles.title, roles.salary, department.name as 'department' FROM roles left join department on department_id = department.id", function (err, results) {
      if (err) throw err;
      console.table(results);
      mainPrompt();
    });
  };

  function addRoles() {
    connection.query("SELECT id, name FROM department",function (err, data) {
      if (err) throw err;
    const departments = data.map(item => {
      return {value:item.id, name:item.name}
    })
    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the title of the role that you would like to add?",
        name: "roleTitle",
      },
      {
        type: "input",
        message: "What is the salary for the role that you are adding?",
        name: "roleSalary",
      },
      {
        type: "list",
        message: "Choose a department for your new role",
        name: "choice",
        choices: departments,
      },
    ])
    .then(results=> {
        connection.query("INSERT INTO roles SET ?", {title:results.roleTitle, salary:results.roleSalary, department_id:results.choice}, function (err, results) {
        if (err) throw err;
        console.table(results);
        viewRoles();
        });
  })
  })
  };

function viewDepartments() {
    connection.query("SELECT * FROM department", function (err, results) {
      if (err) throw err;
      console.table(results);
      mainPrompt();
    });
};

function addDepartments() {
    inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department that you want to add?",
        name: "department",
      },
    ])
    .then(results=> {
        const {department} = results;
        connection.query("INSERT INTO department SET ?", {name: department}, function (err, results) {
        if (err) throw err;
        console.table(results);
        console.log("Department added to the database!");
        viewDepartments();
        });
})
};
