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
app.get("/api/inventory/:id", (req, res, next) => { 
    
});

// [POST] takes a list of {product_id,quantity} to decrement from stock
app.post("/api/inventory/decrement", (req, res, next) => { 
    
});

// [POST] takes a list of {product_id,quantity} to add back to stock
app.post("/api/inventory/increment", (req, res, next) => { 
    
});
 
// Default response for any other request 
app.use(function(req, res){ 
    res.status(404); 
});