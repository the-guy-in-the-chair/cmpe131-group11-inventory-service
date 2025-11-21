// index.js 
const express = require('express'); 
const db = require('./database.js'); 
 
const app = express(); 
const PORT = 3000; 
 
// Middleware to parse JSON bodies 
app.use(express.json()); 
 
// Start server 
app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`); 
}); 
 
// Root endpoint 
app.get("/", (req, res, next) => { 
    res.json({message:"Ok"}); 
}); 
 
// --- API OPERATIONS --- 

// REMOVE THIS BEFORE DELIVERING
// INTENDED FOR TESTING PURPOSES ONLY
// GET all inventory items (Read) 
app.get("/api/all_items", (req, res, next) => { 
    const sql = "select * from inventory"; 
    const params = []; 
    db.all(sql, params, (err, rows) => { 
        if (err) { 
          res.status(400).json({error:err.message}); 
          return; 
        } 
        res.json({ 
            message:"success", 
            data:rows 
        }); 
      }); 
});

// [POST] add a new product to the inventory 
app.post("/api/inventory", (req, res, next) => { 
    
});

// [GET] get the current stock for a product
app.get("/api/inventory/:product_id", (req, res, next) => { 
    const sql = "select * from inventory where product_id = ?";
    db.get(sql, [req.params.product_id], (err, row) => {
        if (err) {
            res.status(400).json({error:err.message});
            return;
        }
        // Error if no product found
        if (!row) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Return the product info
        res.json({
            message:"success",
            data:row
        });
    });
});

// [POST] takes a list of {product_id,quantity} to decrement from stock
app.post("/api/inventory/decrement", async (req, res, next) => {
    // array to catch any errors
    const errors = [];

    // check if body of request is empty
    if (req.body.length <= 0) {
        return res.status(400).json({ error: "No items given." });
    }

    // function to create a "Promise" for the await function
    const runDB = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    // Reject the promise on DB error
                    reject(err);
                } else if (this.changes === 0) {
                    // Reject if the query was successful but ZERO rows were modified.
                    // This indicates an invalid product ID was used.
                    reject(new Error(`Product ID ${params[2]} not found or inventory unchanged.`));
                    
                } else {
                    // Resolve with the number of changes (this.changes is accessible here)
                    resolve(this.changes);
                }
            });
        });
    };

    // process all Promise objects concurrently
    const updatePromises = req.body.map(item => {
        // Basic synchronous validation
        if (!item.product_id) {
            errors.push("No product id given for one of the items.");
            // Return a resolved promise to continue Promise.all without a DB call
            return Promise.resolve(0);
        }
        if (!item.quantity) {
            errors.push("No quantity given for one of the items.");
            return Promise.resolve(0);
        }

        // Return the promise for the database operation
        return runDB(
            `UPDATE inventory SET stock_level = CASE WHEN stock_level > ? THEN stock_level - ? ELSE 0 END WHERE product_id = ?`,
            [item.quantity, item.quantity, item.product_id]
        ).catch(dbErr => {
            // Catch the database error specific to this item
            errors.push(`SQL Error for product ${item.product_id}: ${dbErr.message}`);
            // Return 0 changes to keep the Promise.all structure consistent
            return 0;
        });
    });

    // await all processes
    let totalChanges = 0;
    try {
        const changesArray = await Promise.all(updatePromises);
        // Sum up the total number of rows changed
        totalChanges = changesArray.reduce((sum, changes) => sum + changes, 0);
    } catch (e) {
        // This catch is mainly for errors outside the runDB promises (less likely here)
        console.error("Critical processing error:", e);
        errors.push("A critical error occurred during processing.");
    }

    // check if there were any errors during the process, if so, return them with a 400 response
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    // If successful, send a 200 response with the total changes
    res.json({
        message: "success",
        data: `${req.body.length} item(s) processed.`,
        changes: totalChanges
    });
});

// [POST] takes a list of {product_id,quantity} to add back to stock
app.post("/api/inventory/increment", async (req, res, next) => { 
    // array to catch any errors
    const errors = [];

    // check if body of request is empty
    if (req.body.length <= 0) {
        return res.status(400).json({ error: "No items given." });
    }

    // function to create a "Promise" for the await function
    const runDB = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    // Reject the promise on DB error
                    reject(err);
                } else if (this.changes === 0) {
                    // Reject if the query was successful but ZERO rows were modified.
                    // This indicates an invalid product ID was used.
                    reject(new Error(`Product ID ${params[2]} not found or inventory unchanged.`));
                    
                } else {
                    // Resolve with the number of changes (this.changes is accessible here)
                    resolve(this.changes);
                }
            });
        });
    };

    // process all Promise objects concurrently
    const updatePromises = req.body.map(item => {
        // Basic synchronous validation
        if (!item.product_id) {
            errors.push("No product id given for one of the items.");
            // Return a resolved promise to continue Promise.all without a DB call
            return Promise.resolve(0);
        }
        if (!item.quantity) {
            errors.push("No quantity given for one of the items.");
            return Promise.resolve(0);
        }

        // Return the promise for the database operation
        return runDB(
            `UPDATE inventory SET stock_level = CASE WHEN ? >= 0 THEN stock_level + ? ELSE stock_level END WHERE product_id = ?`,
            [item.quantity, item.quantity, item.product_id]
        ).catch(dbErr => {
            // Catch the database error specific to this item
            errors.push(`SQL Error for product ${item.product_id}: ${dbErr.message}`);
            // Return 0 changes to keep the Promise.all structure consistent
            return 0;
        });
    });

    // await all processes
    let totalChanges = 0;
    try {
        const changesArray = await Promise.all(updatePromises);
        // Sum up the total number of rows changed
        totalChanges = changesArray.reduce((sum, changes) => sum + changes, 0);
    } catch (e) {
        // This catch is mainly for errors outside the runDB promises (less likely here)
        console.error("Critical processing error:", e);
        errors.push("A critical error occurred during processing.");
    }

    // check if there were any errors during the process, if so, return them with a 400 response
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    // If successful, send a 200 response with the total changes
    res.json({
        message: "success",
        data: `${req.body.length} item(s) processed.`,
        changes: totalChanges
    });
});
 
// Default response for any other request 
app.use(function(req, res){ 
    res.status(404); 
});