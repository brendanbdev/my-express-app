/*
The window object is a global object in the browser that represents the browser window or tab. (In Node,
the global object is 'global' instead.)

Important 'window' properties:

'window.location' provides information about the current URL and allows you to change the URL.
Properties: href, hostname, pathname, search, hash
Methods: assign(), reload(), replace()

'window.navigator' provides information about the browser and the user's environment.
Properties: userAgent, language, platform, geolocation

'window.history' provides methods to interact with the browser's history.
Methods: back(), forward(), go()

'window.screen' provides information about the user's screen.
Properties: width, height, availWidth, availHeight

'window.localStorage' and 'window.sessionStorage' allow you to store data in the browser.
'localStorage': Data persists even after the browser is closed.
'sessionStorage': Data persists only for the duration of the page session.

'window.console' provides access to the browser's debugging console.
Methods: log(), warn(), error(), info(), debug()

Important 'window' methods:

'window.alert(message)' displays an alert dialog with the specified message.
Example: 'window.alert('Hello, world!')'

'window.confirm(message)' displays a dialog with a message and OK/Cancel buttons. Returns 'true' if OK
is clicked, otherwise 'false'.
Example: 'if (window.confirm('Are you sure?')) { ... }'

'window.prompt(message, default)' displays a dialog with a message, an input field, and OK/Cancel
buttons. Returns the input value if OK is clicked, otherwise 'null'.
Example: 'const name = window.prompt('What is your name?', 'Guest')'

'window.setTimeout(function, delay)' executes a function after a specified delay (in milliseconds).
Returns a timeout ID that can be used with 'clearTimeout'.
Example: 'const timeoutID = window.setTimeout(() => alert('Hello!'), 1000)'

'window.setInterval(function, delay)' repeatedly executes a function with a fixed time delay between
each call. Returns an interval ID that can be used with 'clearInterval'.
Example: const intervalID = window.setInterval(() => console.log('Tick'), 1000)

'window.clearTimeout(timeoutID)' cancels a timeout previously established by 'setTimeout'.
Example: 'window.clearTimeout(timeoutID)'

'window.clearInterval(intervalID)' cancels an interval previously established by 'setInterval'.
Example: 'window.clearInterval(intervalID)'

Example Usage:

// Navigate to a different URL
window.location.href = 'https://www.example.com';

// Store data in localStorage
localStorage.setItem('username', 'JohnDoe');

// Retrieve data from localStorage
const username = localStorage.getItem('username');
console.log(username); // Output: JohnDoe

// Use a timeout to execute code after a delay
window.setTimeout(() => {
    console.log('This message is delayed by 2 seconds');
}, 2000);

// Use an interval to execute code repeatedly
const intervalID = window.setInterval(() => {
    console.log('This message repeats every second');
}, 1000);

// Clear the interval after 5 seconds
window.setTimeout(() => {
    window.clearInterval(intervalID);
}, 5000);

// Display an alert
window.alert('This is an alert message');

// Display a confirmation dialog
if (window.confirm('Do you want to proceed?')) {
    console.log('User chose to proceed');
} else {
    console.log('User canceled');
}

// Display a prompt
const userInput = window.prompt('Please enter your name:', 'Guest');
console.log('User input:', userInput);
*/
/*
'window.onload' is an event that triggers when the entire webpage (including all dependent resources such
as images and stylesheets) has completely loaded.
*/
window.onload = function () {
    // Variable to store table names
    let tableNames = [];

    // Create a mapping of table names to user-friendly names
    const tableNameMappings = {
        branch: "Branches",
        branch_supplier: "Branch Suppliers",
        client: "Clients",
        employee: "Employees",
        works_with: "Relationships",
    };

    /*
    'fetch('/all-data')' initiates a GET request to the '/all-data' endpoint on the server. This
    endpoint is expected to return a JSON response containing data from the database.
    */
    fetch('/all-data')
        /*
        '.json()' reads the response body and parses the JSON string back into a JavaScript object/array,
        then returns a Promise that resolves with the parsed JavaScript object/array.
        */
        .then(response => response.json())
        .then(data => {
            /*
            'window.document' represents the Document Object Model (DOM) of the current webpage and is
            used to access and manipulate HTML and CSS on the page.

            'document.getElementById('data-container')' is selecting the HTML element with the ID
            'data-container', which is where the tables will be appended.
            */
            const container = document.getElementById('data-container');
            /*
            As discussed in 'server.js', a GET request from the '/all-data' endpoint will return the
            resolved or rejected value of a single Promise which will first execute the array of Promises
            called 'promises'. If a Promise element in the 'promises' array is resolved, that element will
            be an anonymous object, or a table.
            
            (And as also discussed in 'server.js', these anonymous objects will contain two attributes,
            'tableName' and 'data'. 'tableName' is just a string which is the name of the table, and
            'data' is an array of 'RowDataPacket' objects from MySQL where columns are attributes, and
            rows are the corresponding values.)

            Therefore, the resolved value of the single promise from the GET request will be an array of
            these anonymous objects. That is why we are calling '.forEach(...)' on 'data'.
            
            The reason why the parameter for the anonymous function in '.forEach(...)' is called 'table'
            is because each of these anonymous functions is a table.
            */
            data.forEach(table => {
                // Store table names in the tableNames array
                tableNames.push(table.tableName);
                // create array above and append table names?
                // 'table' is an HTML tag.
                const tableElement = document.createElement('table');
                // This sets the class of the table element to 'table-grid' for styling purposes.
                tableElement.className = 'table-grid';
                let html = `<caption>${table.tableName}</caption>`;
                html += '<thead><tr>';
                if (table.data.length > 0) {
                    Object.keys(table.data[0]).forEach(key => {
                        html += `<th>${key}</th>`;
                    });
                    html += '</tr></thead><tbody>';
                    table.data.forEach(row => {
                        html += '<tr>';
                        Object.values(row).forEach(value => {
                            html += `<td>${value}</td>`;
                        });
                        html += '</tr>';
                    });
                } else {
                    html += '<tr><td colspan="100%">No Data</td></tr>';
                }
                html += '</tbody>';
                tableElement.innerHTML = html;
                container.appendChild(tableElement);
            });

            const tableSelectIds = [
                'table-select-create',
                'table-select-update',
                'table-select-delete',
            ];

            tableSelectIds.forEach(id => {
                const element = document.getElementById(id);
                if (!element) {
                    console.warn(`Element with ID '${id}' not found.`);
                } else {
                    tableNames.forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = tableNameMappings[name] || `(${name})`;
                        element.appendChild(option);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading the data:', error));

    // Handle form submissions for creating data
    document.getElementById('create-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const tableName = document.getElementById('create-table').value;
        const data = JSON.parse(document.getElementById('create-data').value);

        fetch('/create-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName, data })
        })
            .then(response => response.text())
            .then(message => alert(message))
            .catch(error => console.error('Error creating data:', error));
    });

    // Handle form submissions for updating data
    document.getElementById('update-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const tableName = document.getElementById('update-table').value;
        const id = document.getElementById('update-id').value;
        const data = JSON.parse(document.getElementById('update-data').value);

        fetch('/update-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName, id, data })
        })
            .then(response => response.text())
            .then(message => alert(message))
            .catch(error => console.error('Error updating data:', error));
    });

    // Handle form submissions for deleting data
    document.getElementById('delete-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const tableName = document.getElementById('delete-table').value;
        const id = document.getElementById('delete-id').value;

        fetch('/delete-data', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName, id })
        })
            .then(response => response.text())
            .then(message => alert(message))
            .catch(error => console.error('Error deleting data:', error));
    });
};