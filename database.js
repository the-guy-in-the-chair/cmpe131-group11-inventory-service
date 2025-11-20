// database.js 
const sqlite3 = require('sqlite3').verbose(); 
const DBSOURCE = "db.sqlite"; 
 
const db = new sqlite3.Database(DBSOURCE, (err) => { 
    if (err) { 
      // Cannot open database 
      console.error(err.message); 
      throw err; 
    } else { 
        console.log('Connected to the SQLite database.'); 
        db.run(`CREATE TABLE inventory ( 
            product_id INTEGER PRIMARY KEY, 
            stock_level INTEGER,  
            last_updated TEXT
            )`, 
        (err) => { 
            if (err) { 
                // Table already created 
            } else { 
                // Table just created, creating some rows 
                const insert = 'INSERT INTO inventory (product_id, stock_level, last_updated) VALUES (?,?,?)'; 
                db.run(insert, [0,4,Date()]);
                db.run(insert, [1,11,Date()]);
                db.run(insert, [2,108,Date()]);
                db.run(insert, [3,65,Date()]);
                db.run(insert, [4,36,Date()]);
            } 
        });   
    } 
}); 
 
module.exports = db;