/**
 * @file Employee.js
 * @description Component to display and modify employees, including adding and removing employees.
 */

import { React, useEffect, useState } from "react";
import { executeGet, executePost, executeDelete } from "../../util/Requests";
import EditButton from "./svgs/editButton.svg";

// ==================================
// Backend interactivity functions
// ==================================

/**
 * Obtains information of all employees from database, and sets the specified state variable to the returned data.
 * @author Julius Lee
 * @async
 * @function
 * @param {Function} setEmployees The setter function for the employees useState array
 */
export const fetchData = async (setEmployees) => {
  try {
    const data = await executeGet(`employees`, {}, "GET");
    setEmployees(data); // Set fetched data directly
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

/**
 * Sends a request to the database to add an employee.
 * @author Julius Lee
 * @async
 * @function
 * @param {String} first_name The employee's first name
 * @param {String} last_name The employee's last name
 * @param {String} position The employee's position
 * @param {Number} pin_id The employee's PIN #
 * @param {Function} setEmployeeAdder The setter function for the employeeAdder useState boolean
 * @param {Function} setEmployees The setter function for the employees useState array
 */
export const addEmployee = async (
  first_name,
  last_name,
  position,
  pin_id,
  setEmployeeAdder,
  setEmployees
) => {
  try {
    const response = await executePost("employees/add", {
      first_name,
      last_name,
      position,
      pin_id,
    });
    if (response === 200) {
      setEmployeeAdder(false);
      fetchData(setEmployees);
    }
  } catch (error) {
    console.error("Error adding employee:", error);
  }
};

/**
 * Deletes an employee from the database.
 * @author Julius Lee
 * @async
 * @function
 * @param {Object} employee The employee object to delete.
 * @param {Function} setEmployeePopUp The state setter function for the employee popup visibility.
 * @param {Function} setEmployees The state setter function for the employees array.
 */
export const deleteEmployee = async (
  employee,
  setEmployeePopUp,
  setEmployees
) => {
  const id = employee.employee_id;
  try {
    const response = await executeDelete(`employees/${id}`, { id });
    if (response === 200) {
      setEmployeePopUp(false);
      fetchData(setEmployees);
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

// ==================================
// HTML-related functions
// ==================================

const popup =
  "fixed top-[50%] left-[50%] w-[40vw] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300 z-50";
const popup2 =
  "fixed top-[50%] left-[50%] w-[45vw] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300 z-60";
const buttonStyle =
  " bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 active:bg-red-700";

/**
 * Renders a card for an individual employee.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The employee object to display.
 * @param {Function} props.onClick Function to handle card click.
 * @returns {React.JSX.Element} A React component.
 */
export const EmployeeCard = ({ onClick, employee }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {employee.first_name} {employee.last_name}
          </h3>
          <p className="text-sm text-gray-700">ID: {employee.employee_id}</p>
        </div>
        <div className="flex justify-between">
          <button
            className={"px-8 py-6" + buttonStyle}
            onClick={() => onClick(employee)}
          >
            Detailed Information
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dropdown component for selecting an employee's position.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The current employee object.
 * @param {Function} props.updateEmployee Function to update the employee object.
 * @returns {React.JSX.Element} A React component.
 */
const PositionSelect = ({ employee, updateEmployee }) => {
  const positions = ["Manager", "Cashier", "Cook"];
  const handlePositionSelect = async (event) => {
    const selectedPosition = event.target.value;
    try {
      let id = employee.employee_id;
      const response = await executePost("employees/position", {
        id,
        selectedPosition,
      });
      if (response === 200) {
        updateEmployee({ ...employee, position: selectedPosition });
      } else {
        console.error("Non-200 code received. Internal server error likely??");
      }
      employee.position = selectedPosition;
    } catch (error) {
      console.error("Error updating employee position: ", error);
    }
  };

  return (
    <select
      value={employee.position}
      onChange={handlePositionSelect}
      className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    >
      <option className="bg-gray-50 text-xs text-gray-700" value="" disabled>
        ~Select a position~
      </option>
      {positions.map((position) => (
        <option
          className="bg-gray-50 text-xs text-gray-700"
          value={position}
          key={position}
        >
          {position}
        </option>
      ))}
      <option
        className="bg-gray-50 text-xs text-gray-700"
        value={"None"}
        key={"None"}
      >
        None
      </option>
    </select>
  );
};

/**
 * Dropdown component for selecting an employee's role.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The current employee object.
 * @param {Function} props.updateEmployee Function to update the employee object.
 * @returns {React.JSX.Element} A React component.
 */
const RoleSelect = ({ employee, updateEmployee }) => {
  const roles = {
    "No Role": -1,
    Employee: 0,
    Administrator: 4,
  };
  const handleRoleSelect = async (event) => {
    const selectedRole = Number.parseInt(event.target.value);
    try {
      let id = employee.employee_id;
      const response = await executePost("employees/role", {
        id,
        selectedRole,
      });
      if (response === 200) {
        updateEmployee({ ...employee, role: selectedRole });
      } else {
        console.error("Non-200 code received. Internal server error likely??");
      }
      employee.role = selectedRole;
    } catch (error) {
      console.error("Error updating employee role: ", error);
    }
  };

  return (
    <select
      value={employee.role}
      onChange={handleRoleSelect}
      className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    >
      <option className="bg-gray-50 text-xs text-gray-700" value="" disabled>
        ~Select a role~
      </option>
      {Object.entries(roles).map((role) => (
        <option
          className="bg-gray-50 text-xs text-gray-700"
          value={role[1]}
          key={role[0]}
        >
          {role[0]}
        </option>
      ))}
    </select>
  );
};

/**
 * Popup component for changing an employee's name.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The current employee object.
 * @param {Function} props.updateEmployee Function to update the employee object.
 * @returns {React.JSX.Element} A React component.
 */
const NameUpdate = ({ employee, updateEmployee, setNameUpdater }) => {
  const handleNameUpdate = async (first_name, last_name) => {
    console.log(first_name.length, last_name.length)
    if (first_name.length !== 0 || last_name.length !== 0) {
      try {
        let id = employee.employee_id;
        const response = await executePost("employees/name", {
          id,
          first_name,
          last_name,
        });
        if (response === 200) {
          updateEmployee({
            ...employee,
            first_name: first_name,
            last_name: last_name,
          });
        } else {
          console.error(
            "Non-200 code received. Internal server error likely??"
          );
        }
        employee.first_name = first_name;
        employee.last_name = last_name;
        setNameUpdater(false);
      } catch (error) {
        console.error("Error updating employee name: ", error);
      }
    }
  };

  return (
    <div
      className="fixed inset-[-2.5px] bg-black bg-opacity-50 z-40 flex items-center justify-center rounded-md"
    >
      <div className={"drop-shadow-md " + popup2}>
        <h3 className="text-lg font-medium">Edit Employee Name</h3>
        <div>
          <div className="inline-flex w-[100%] mt-4">
            <p className="w-[100px]">First Name:</p>
            <input
              className="w-[60%] border ml-4"
              type="text"
              id="changeFirstName"
            />
          </div>
          <div className="inline-flex w-[100%] mt-4">
            <p className="w-[100px]">Last Name:</p>
            <input
              className="w-[60%] border ml-4"
              type="text"
              id="changeLastName"
            />
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-6 py-4 bg-red-500 text-white rounded-md"
            onClick={() => setNameUpdater(false)}
          >
            Close
          </button>
          <button
            className="px-6 py-4 bg-red-500 text-white rounded-md"
            onClick={() =>
              handleNameUpdate(
                document.getElementById("changeFirstName").value,
                document.getElementById("changeLastName").value
              )
            }
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Checkbox component for toggling an employee's active status.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The current employee object.
 * @param {Function} props.updateEmployee Function to update the employee object.
 * @returns {React.JSX.Element} A React component.
 */
const ActiveEmployee = ({ employee, updateEmployee }) => {
  const handleActiveChange = async (event) => {
    const activeBool = event.target.checked;
    try {
      let id = employee.employee_id;
      const response = await executePost("employees/active", {
        id,
        activeBool,
      });
      if (response === 200) {
        updateEmployee({ ...employee, is_active: activeBool });
      } else {
        console.error("Non-200 code received. Internal server error likely??");
      }
      employee.is_active = activeBool;
    } catch (error) {
      console.error("Error updating employee active status: ", error);
    }
  };

  return (
  <label className="container">
    <input className="w-6 h-6 text-red-500 bg-red-500 border-red-300 rounded" type="checkbox" defaultChecked={employee.is_active} onChange={handleActiveChange} />
    <span className="checkmark"></span>
  </label>
  );
};

/**
 * Displays detailed information about an employee in a popup window.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Object} props.employee The employee object to display.
 * @param {Function} props.onClose Function to close the popup.
 * @param {Function} props.onDelete Function to delete the employee.
 * @param {Function} props.updateEmployee Function to update the employee object.
 * @returns {React.JSX.Element} A React component.
 */
export const EmployeePopup = ({
  employee,
  onClose,
  onDelete,
  updateEmployee,
}) => {
  const rolesDictionary = {
    0: "No Role",
    1: "Employee",
    2: "Employee",
    3: "Employee",
    4: "Administrator",
    5: "Administrator",
  };

  const [showNameUpdater, setNameUpdater] = useState(false);

  return (
    <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center rounded-md"
  >
      <div className={popup}>
        <div className="flex">
          <h3 className="text-lg font-medium">
            {employee.first_name} {employee.last_name}
          </h3>
          <img
            src={EditButton}
            className="cursor-pointer ml-[0.5vw] mt-[0vh] h-[4vh] w-[4vh]"
            onClick={() => setNameUpdater(true)}
            alt="Edit Employee"
          />
        </div>
        <p>
          Employee ID: <b>{employee.employee_id}</b>
        </p>
        <p className="mt-4">
          Position:
          <span>
            <b> {employee.position}</b>
            <PositionSelect employee={employee} updateEmployee={updateEmployee} />
          </span>
        </p>
        <p className="mt-4">
          Role:
          <span>
            <b> {rolesDictionary[employee.role + 1]}</b>
            <RoleSelect employee={employee} updateEmployee={updateEmployee} />
          </span>
        </p>
        <p className="mt-4 flex gap-2">
          Active?: <ActiveEmployee employee={employee} updateEmployee={updateEmployee} />
        </p>
        <p>
          PIN: <b>{employee.pin_id}</b>
        </p>
        <div className="flex justify-between mt-4">
          <button className={"px-6 py-4 " + buttonStyle} onClick={onDelete}>
            Delete Employee
          </button>
          <button className={"px-6 py-4 " + buttonStyle} onClick={onClose}>
            Close
          </button>
        </div>
        {/* Employee Adder Pop-up window. */}
        {showNameUpdater && (
          <NameUpdate
            employee={employee}
            updateEmployee={updateEmployee}
            setNameUpdater={setNameUpdater}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Button component for adding a new employee.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Function} props.onClick Function to handle button click.
 * @returns {React.JSX.Element} A React component.
 */
export const EmployeeAdder = ({ onClick }) => {
  return (
    <div className="rounded-lg p-4 mb-4">
      <button
        className={
          "w-[100%] h-[5em] bg-red-500 text-white rounded-md " + buttonStyle
        }
        onClick={() => onClick(true)}
      >
        Add Employee
      </button>
    </div>
  );
};

/**
 * Popup window for adding a new employee.
 * @author Julius Lee
 * @component
 * @param {Object} props React props.
 * @param {Function} props.onClose Function to close the popup.
 * @param {Function} props.onAdd Function to add a new employee.
 * @returns {React.JSX.Element} A React component.
 */
export const EmployeeAdderPopUp = ({ onClose, onAdd }) => {
  return (
    <div className={popup}>
      <h3 className="text-lg font-medium">Add a New Employee Manually</h3>
      <div>
        <div className="inline-flex w-[100%] mt-4">
          <p className="w-[100px]">First Name:</p>
          <input className="w-[60%] border ml-4" type="text" id="firstName" />
        </div>
        <div className="inline-flex w-[100%] mt-4">
          <p className="w-[100px]">Last Name:</p>
          <input className="w-[60%] border ml-4" type="text" id="lastName" />
        </div>
        <div className="inline-flex w-[100%] mt-4">
          <p className="w-[100px]">Position:</p>
          <input className="w-[60%] border ml-4" type="text" id="position" />
        </div>
        <div className="inline-flex w-[100%] mt-4">
          <p className="w-[100px]">PIN:</p>
          <input className="w-[60%] border ml-4" type="text" id="pin" />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="px-6 py-4 bg-red-500 text-white rounded-md"
          onClick={() => onClose(false)}
        >
          Close
        </button>
        <button
          className="px-6 py-4 bg-red-500 text-white rounded-md"
          onClick={() =>
            onAdd(
              document.getElementById("firstName").value,
              document.getElementById("lastName").value,
              document.getElementById("position").value,
              document.getElementById("pin").value
            )
          }
        >
          Add
        </button>
      </div>
    </div>
  );
};

/**
 * Main Employee component that manages the list of employees and their interactions.
 * @author Julius Lee
 * @component
 * @returns {React.JSX.Element} The main Employee component.
 */
const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [currEmployee, setCurrEmployee] = useState(null);
  const [employeePopUp, setEmployeePopUp] = useState(false);
  const [employeeAdder, setEmployeeAdder] = useState(false);

  const cleanup = () => {
    setEmployees([]);
  };

  // Fetch data on initial render
  useEffect(() => {
    fetchData(setEmployees);

    return () => cleanup; // Call cleanup
  }, []);

  // Employee info popup window functions.
  const openPopup = (employee) => {
    setCurrEmployee(employee);
    setEmployeePopUp(true);
  };
  const closePopup = () => {
    setEmployeePopUp(false);
    setCurrEmployee(null);
  };

  const updateEmployee = (updatedEmployee) => {
    setCurrEmployee(updatedEmployee);
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.employee_id === updatedEmployee.employee_id ? updatedEmployee : emp
      )
    );
  };

  // Employee adder function
  const setAddEmployee = async (first_name, last_name, position, pin_id) => {
    addEmployee(
      first_name,
      last_name,
      position,
      pin_id,
      setEmployeeAdder,
      setEmployees
    );
  };

  // Employee deleter function
  const setDeleteEmployee = async () => {
    deleteEmployee(currEmployee, setEmployeePopUp, setEmployees);
  };

  return (
    <div className="p-2 relative h-[75vh] overflow-y-auto rounded-md border border-gray-300">
      {/* <EmployeeAdder onClick={setEmployeeAdder} /> */}

      {/* Lists all employees in the database with their names and IDs. */}
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.employee_id}
          employee={employee}
          onClick={openPopup}
        />
      ))}

      {/* Employee Pop-up window that is dependent on the employee with the clicked Info. */}
      {employeePopUp && (
        <EmployeePopup
          employee={currEmployee}
          onClose={closePopup}
          onDelete={setDeleteEmployee}
          updateEmployee={updateEmployee}
        />
      )}
      {/* Employee Adder Pop-up window. */}
      {employeeAdder && (
        <EmployeeAdderPopUp onClose={setEmployeeAdder} onAdd={setAddEmployee} />
      )}
    </div>
  );
};

export default Employee;
