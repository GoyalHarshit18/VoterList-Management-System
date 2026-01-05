import pool from './db.js';

const setupTables = async () => {
    try {
        console.log("Creating verify_voters table...");

        // 1. Create verify_voters table with same schema as voters
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verify_voters (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                name_english VARCHAR(100),
                relative_name VARCHAR(100),
                mobile VARCHAR(20) NOT NULL,
                aadhaar VARCHAR(20),
                gender VARCHAR(20),
                dob DATE,
                address TEXT,
                district VARCHAR(100),
                state VARCHAR(100),
                pin VARCHAR(10),
                disability VARCHAR(100),
                blo_id VARCHAR(50) REFERENCES blo_users(blo_id),
                status VARCHAR(20) DEFAULT 'Pending',
                is_verified BOOLEAN DEFAULT FALSE,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("verify_voters table created.");

        // 2. Insert 20 dummy entries into voters table
        console.log("Inserting 20 dummy entries into voters table...");
        const dummyVoters = [
            ['Amit Sharma', 'Amit Sharma', 'Suresh Sharma', '9876543210', '123456789012', 'Male', '1990-05-15', '123, Street No 1', 'Delhi', 'Delhi', '110001', 'None', 'DEL123'],
            ['Priya Gupta', 'Priya Gupta', 'Rakesh Gupta', '9876543211', '123456789013', 'Female', '1992-08-20', '456, Street No 2', 'Delhi', 'Delhi', '110002', 'None', 'DEL123'],
            ['Rahul Verma', 'Rahul Verma', 'Sunil Verma', '9876543212', '123456789014', 'Male', '1985-01-10', '789, Street No 3', 'Delhi', 'Delhi', '110003', 'None', 'DEL123'],
            ['Sneha Singh', 'Sneha Singh', 'Vijay Singh', '9876543213', '123456789015', 'Female', '1995-12-05', '101, Street No 4', 'Delhi', 'Delhi', '110004', 'None', 'DEL123'],
            ['Vikram Aditya', 'Vikram Aditya', 'Anil Aditya', '9876543214', '123456789016', 'Male', '1988-03-25', '202, Street No 5', 'Delhi', 'Delhi', '110005', 'None', 'DEL123'],
            ['Anjali Rao', 'Anjali Rao', 'Mohan Rao', '9876543215', '123456789017', 'Female', '1991-07-12', '303, Street No 6', 'Delhi', 'Delhi', '110006', 'None', 'DEL123'],
            ['Sanjay Jain', 'Sanjay Jain', 'Prakash Jain', '9876543216', '123456789018', 'Male', '1980-11-30', '404, Street No 7', 'Delhi', 'Delhi', '110007', 'None', 'DEL123'],
            ['Deepa Nair', 'Deepa Nair', 'Gopal Nair', '9876543217', '123456789019', 'Female', '1994-02-14', '505, Street No 8', 'Delhi', 'Delhi', '110008', 'None', 'DEL123'],
            ['Manoj Tiwari', 'Manoj Tiwari', 'Shyam Tiwari', '9876543218', '123456789020', 'Male', '1983-09-22', '606, Street No 9', 'Delhi', 'Delhi', '110009', 'None', 'DEL123'],
            ['Kavita Devi', 'Kavita Devi', 'Rajender Singh', '9876543219', '123456789021', 'Female', '1987-06-18', '707, Street No 10', 'Delhi', 'Delhi', '110010', 'None', 'DEL123'],
            ['Rohan Mehra', 'Rohan Mehra', 'Ajay Mehra', '9876543220', '123456789022', 'Male', '1993-04-05', '808, Street No 11', 'Delhi', 'Delhi', '110011', 'None', 'DEL123'],
            ['Sowmya Reddy', 'Sowmya Reddy', 'Venkat Reddy', '9876543221', '123456789023', 'Female', '1996-10-28', '909, Street No 12', 'Delhi', 'Delhi', '110022', 'None', 'DEL123'],
            ['Arjun Kapoor', 'Arjun Kapoor', 'Sandeep Kapoor', '9876543222', '123456789024', 'Male', '1990-12-12', '111, Street No 13', 'Delhi', 'Delhi', '110013', 'None', 'DEL123'],
            ['Meena Kumari', 'Meena Kumari', 'Laxman Prasad', '9876543223', '123456789025', 'Female', '1982-05-05', '222, Street No 14', 'Delhi', 'Delhi', '110014', 'None', 'DEL123'],
            ['Karan Johar', 'Karan Johar', 'Hiroo Johar', '9876543224', '123456789026', 'Male', '1972-05-25', '333, Street No 15', 'Delhi', 'Delhi', '110015', 'None', 'DEL123'],
            ['Alia Bhatt', 'Alia Bhatt', 'Mahesh Bhatt', '9876543225', '123456789027', 'Female', '1993-03-15', '444, Street No 16', 'Delhi', 'Delhi', '110016', 'None', 'DEL123'],
            ['Varun Dhawan', 'Varun Dhawan', 'David Dhawan', '9876543226', '123456789028', 'Male', '1987-04-24', '555, Street No 17', 'Delhi', 'Delhi', '110017', 'None', 'DEL123'],
            ['Sara Ali Khan', 'Sara Ali Khan', 'Saif Ali Khan', '9876543227', '123456789029', 'Female', '1995-08-12', '666, Street No 18', 'Delhi', 'Delhi', '110018', 'None', 'DEL123'],
            ['Ranbir Kapoor', 'Ranbir Kapoor', 'Rishi Kapoor', '9876543228', '123456789030', 'Male', '1982-09-28', '777, Street No 19', 'Delhi', 'Delhi', '110019', 'None', 'DEL123'],
            ['Katrina Kaif', 'Katrina Kaif', 'Mohammed Kaif', '9876543229', '123456789031', 'Female', '1983-07-16', '888, Street No 20', 'Delhi', 'Delhi', '110020', 'None', 'DEL123']
        ];

        for (const voter of dummyVoters) {
            await pool.query(`
                INSERT INTO voters (
                    name, name_english, relative_name, mobile, aadhaar, gender, 
                    dob, address, district, state, pin, disability, blo_id, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Verified')
            `, voter);
        }
        console.log("20 dummy entries inserted into voters table.");

    } catch (err) {
        console.error("Error setting up tables:", err);
    } finally {
        process.exit();
    }
};

setupTables();
