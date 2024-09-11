const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Middleware:
// 'express.static('public')' serves static files from the 'public' directory
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const pool = mysql.createPool({
    connectionLimit: 10,
    /*
    The "host" is the server or the network address where the MySQL database server is running. This is
    the address used by clients to connect to the database server.
    
    When the MySQL server is running on the same machine as the client application, the host is often
    specified as localhost or 127.0.0.1 (the loopback IP address).
    
    If the MySQL server is on a different machine or a remote server, the host will be the IP address or
    domain name of that server (192.168.1.100), or with a domain name (db.example.com).
    
    When using cloud database services (like AWS RDS, Google Cloud SQL, etc.), the host will be provided
    by the service (mydatabase.us-east-1.rds.amazonaws.com).
    */
    host: 'localhost',
    user: 'root', // should be your MySQL username
    password: '315085Corrected!', // should be your MySQL password
    database: 'my_first_database' // should be your database name
});

// Testing server connection
/*
When you type http://localhost:3000/ into the address bar of your web browser and press Enter,
the Express application identifies the route that matches the incoming GET request,
which in this case is the root URL '/'

In Express, the root URL (/) is defined as the root path. When you define a route for '/', it handles
requests to both http://localhost:3000 and http://localhost:3000/ equally.

Also, modern browsers often canonical-ize URLs by adding a trailing slash to the root URL if it is
missing. For example, when you enter http://localhost:3000 in the browser's address bar, the browser
might internally convert it to http://localhost:3000/.

The route handler for app.get('/') that sends "Hello World!" is defined after the static middleware.
Since the static middleware already served the index.html file, the "Hello World!" route handler is
never reached for the root URL request.

So this code is actually unnecessary.
*/
app.get('/', (req, res) => {
    res.send('Hello World!');
});

/*
This code defines a route handler for the '/all-data' endpoint in your Express application. When a GET
request is made to the '/all-data' endpoint, the server fetches data from all tables in your MySQL
database and returns it as a JSON response.

The function for this route handler first gets the table names, then the table data. This isn't just
because MySQL doesn't support a single query to do both, it's because we want the code to be modular.

As of 06/06/2024, /all-data is the only endpoint that exists, so this would be the entirety of the API for
this server.

Documentation:
The /all-data endpoint retrieves data from all tables in the database and returns it as a JSON array. Each
element in the array contains the table name ('tableName') and its corresponding data ('data'). The data
will be an array of entries where the attributes are columns, and the corresponding values are the rows.
*/
app.get('/all-data', async (req, res) => {
    // Function to first get the table names:
    const getTableNames = () => {
        return new Promise((resolve, reject) => {
            /*
            'pool.query' is a method that is part of the 'mysql' module and is used to execute SQL
            queries against the MySQL database. 'pool' is a connection pool created using
            'mysql.createPool', which allows for efficient reuse of database connections.

            "SHOW TABLES" is a SQL query that retrieves the names of all tables in the current database.
            It returns a result set where each row contains the name of a table.

            The callback function '(error, results) => { ... }' is executed once the query is complete.
            It takes two parameters:
            1. 'error': An error object, if an error occurred during the execution of the query.
            2. 'results': an array of rows returned by the query, which contains the table names.
            */
            pool.query("SHOW TABLES", (error, results) => {
                /*
                If there is an error, the promise is rejected with the 'error' object. This causes the
                'getTableNames' function (the function we're inside of right now) to return a rejected
                promise, which can then be caught by the calling code (in the 'try...catch' block).
                */
                if (error) return reject(error);
                // Debugging: Log the entire results array
                console.log('Results:', results);
                /*
                'results' (an array):
                [
                    RowDataPacket { Tables_in_my_first_database: 'branch' },
                    RowDataPacket { Tables_in_my_first_database: 'branch_supplier' },
                    RowDataPacket { Tables_in_my_first_database: 'client' },
                    RowDataPacket { Tables_in_my_first_database: 'employee' },
                    RowDataPacket { Tables_in_my_first_database: 'trigger_test' },
                    RowDataPacket { Tables_in_my_first_database: 'works_with' }
                ]
                */
                const tables = results.map(row => {
                    // Debugging: Log each row
                    console.log('Row:', row);
                    /*
                    'row' (elements in the 'results' array, which are 'RowDataPacket' objects with an
                    attribute named 'Tables_in_my_first_database' with a value of a String which is a
                    table name. Therefore, returning 'Object.values(row)[0]' will return a table name.):
                    RowDataPacket { Tables_in_my_first_database: 'branch' }
                    RowDataPacket { Tables_in_my_first_database: 'branch_supplier' }
                    RowDataPacket { Tables_in_my_first_database: 'client' }
                    RowDataPacket { Tables_in_my_first_database: 'employee' }
                    RowDataPacket { Tables_in_my_first_database: 'trigger_test' }
                    RowDataPacket { Tables_in_my_first_database: 'works_with' }
                    */
                    return Object.values(row)[0];
                });
                // Debugging: Log the tables array
                console.log('Tables:', tables);
                /*
                'tables' (array of Strings returned from 'results.map(row => Object.values(row)[0])'):
                [
                    'branch',
                    'branch_supplier',
                    'client',
                    'employee',
                    'trigger_test',
                    'works_with'
                ]

                Also, remember that 'resolve' is a parameter for the higher-order function that is the
                parameter for the construction of this Promise object. With 'resolve(tables)',
                'getTableNames()' (later in this anonymous async function for this GET request route
                handler for the '/all-data' endpoint) will return the array of Strings which are the
                table names.
                */
                resolve(tables);
            });
        });
    };

    // Function to get table data by table name
    const getTableData = (tableName) => {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM ${tableName}`, (error, results) => {
                if (error) return reject(error);
                /*
                The curly braces indicate that an anonymous object is being made, and 'tableName' is
                using shorthand notation, and this shorthand notation is possible because the property
                name is the same as the variable name.

                'results' is an array (produced from the query `SELECT * FROM ${tableName}`) of
                'RowDataPacket' objects where columns are attributes, and rows are the corresponding
                values.
                */
                // Debugging: Log the table data object
                console.log('Table data:', { tableName, data: results });
                /*
                Table data object for the 'branch' table:
                {
                    tableName: 'branch',
                    data: [
                        RowDataPacket {
                            branch_id: 1,
                            branch_name: 'Corporate',
                            mgr_id: 100,
                            mgr_start_date: 2006-02-09T05:00:00.000Z
                        },
                        RowDataPacket {
                            branch_id: 2,
                            branch_name: 'Scranton',
                            mgr_id: 102,
                            mgr_start_date: 1992-04-06T04:00:00.000Z
                        },
                        RowDataPacket {
                            branch_id: 3,
                            branch_name: 'Stamford',
                            mgr_id: 106,
                            mgr_start_date: 1998-02-13T05:00:00.000Z
                        },
                        RowDataPacket {
                            branch_id: 4,
                            branch_name: 'Buffalo',
                            mgr_id: null,
                            mgr_start_date: null
                        }
                    ]
                }
                */
                resolve({ tableName, data: results });
            });
        });
    };

    try {
        /*
        'getTableNames()' by itself returns a Promise object, but because we use the "await" keyword,
        which we can do because we are inside of an async function...
        
        'app.get('/all-data', async (req, res) => {...});'
        
        ...'getTableNames()' will return the resolved or rejected value of the promise.
        */
        const tableNames = await getTableNames();
        /*
        'tableNames.map(tableName => getTableData(tableName))' returns an array of Promise objects where
        each 'tableName' is saved with each Promise object.

        The console log of this array will look like this:

        promises array: [
            Promise { <pending> },
            Promise { <pending> },
            Promise { <pending> },
            Promise { <pending> },
            Promise { <pending> },
            Promise { <pending> }
        ]
        */
        const promises = tableNames.map(tableName => getTableData(tableName));
        console.log('promises array:', promises);
        /*
        'await Promise.all(promises)' will return the resolved or rejected value of a single Promise
        which will first execute the array of Promises called 'promises'. If a Promise element in the
        'promises' array is resolved, that element will be an anonymous object that will contain two
        attributes, 'tableName' and 'data'. 'tableName' is just a string which is the name of the table,
        and 'data' is an array of 'RowDataPacket' objects from MySQL where columns are attributes, and
        rows are the corresponding values. So, each of these anonymous functions is a table.
        */
        const allData = await Promise.all(promises);
        console.log('ALL DATA:', allData);
        /*
        'res' is the response object in Express. It represents the HTTP response that an Express app
        sends when it receives an HTTP request. '.json(...)' is a method provided by the Express response
        object (res). It sends a JSON response.
        */
        res.json(allData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});

// get all table names
app.get('/table-names', (req, res) => {

});

// Endpoint to create data
app.post('/create-data', (req, res) => {
    console.log("req.body:", req.body);
    /*
    JavaScript destructuring assignment extracting properties from the object that comes from 'req.body'.
    (If you wanted custom names for these variables, the syntax would be:
    'const { tableName: tName, data: d } = req.body;', this assigns 'req.body.tableName' to a variable
    'tName', and 'req.body.data' to a variable 'd'.)

    Here's an example of the object that comes from 'req.body'. Notice that it has two primary keys,
    'tableName' and 'data':
    {
    tableName: 'employee',
    data: {
        emp_id: 111,
        first_name: 'Brendan',
        last_name: 'Baia',
        birth_day: '1997-08-23',
        sex: 'M',
        salary: 0,
        super_id: 102,
        branch_id: 2
        }
    }
    */
    const { tableName, data } = req.body;

    // Error handling
    const requiredColumns = ['emp_id', 'first_name', 'last_name', 'birth_day', 'sex', 'salary', 'super_id', 'branch_id'];
    const missingColumns = requiredColumns.filter(column => !data.hasOwnProperty(column));
    if (missingColumns.length > 0) {
        return res.status(400).send(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    const dataKeys = Object.keys(data);
    const invalidColumns = dataKeys.filter(key => !requiredColumns.includes(key));
    if (invalidColumns.length > 0) {
        return res.status(400).send(`Invalid columns: ${invalidColumns.join(', ')}`);
    }

    /*
    'Object.keys(data)' returns an array of data's property names, and '.join(', ')' concatenates all the
    elements with a specified separator string.
    */
    const keys = Object.keys(data).join(', ');
    /*
    'Object.values(data)' returns an array of data's property names. Before the elements are concatenated
    with '.join(', ')', the 'map' method creates a new array with the results of calling a provided
    function on every element in the calling array. Here, 'mysql.escape(value)' is used to escape
    potentially unsafe characters in the value, making it safe to use in an SQL query. This helps prevent
    SQL injection attacks.
    */
    const values = Object.values(data).map(value => mysql.escape(value)).join(', ');

    const query = `INSERT INTO ${tableName} (${keys}) VALUES (${values})`;

    console.log('Executing create data query:', query); // Log the query for debugging

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error); // Log the error for debugging
            return res.status(500).send(`Error creating data: ${error.message}`);
        }
        res.status(201).send("Data created successfully");
    });
});

app.put('/update-data', (req, res) => {
    const { tableName, id, data } = req.body;
    const updates = Object.keys(data).map(key => `${key} = ${mysql.escape(data[key])}`).join(', ');

    const primaryKeyQuery = `SELECT COLUMN_NAME 
                             FROM information_schema.KEY_COLUMN_USAGE 
                             WHERE TABLE_NAME = ${mysql.escape(tableName)} 
                             AND CONSTRAINT_NAME = 'PRIMARY'`;

    pool.query(primaryKeyQuery, (error, results) => {
        if (error) return res.status(500).send("Error retrieving primary key information");
        if (results.length === 0) return res.status(400).send("No primary key found for the specified table");

        const primaryKey = results[0].COLUMN_NAME;
        const query = `UPDATE ${tableName} SET ${updates} WHERE ${primaryKey} = ${mysql.escape(id)}`;

        console.log('Executing update data query:', query);

        pool.query(query, (error, results) => {
            if (error) return res.status(500).send("Error updating data");
            res.send("Data updated successfully");
        });
    });
});

app.delete('/delete-data', (req, res) => {
    const { tableName, id } = req.body;

    const query = `DELETE FROM ${tableName} WHERE id = ${mysql.escape(id)}`;

    pool.query(query, (error, results) => {
        if (error) return res.status(500).send("Error deleting data");
        res.send("Data deleted successfully");
    });
});

// new delete
app.delete('/delete-data', (req, res) => {
    const { tableName, id } = req.body;

    const query = `DELETE FROM ${tableName} WHERE id = ${mysql.escape(id)}`;

    pool.query(query, (error, results) => {
        if (error) return res.status(500).send("Error deleting data");
        res.send("Data deleted successfully");
    });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});