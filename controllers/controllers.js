const express = require("express");
const fs = require("fs")
const parse = require("csv-parse");
const moment = require('moment');

const router = express.Router();

// Create all our routes and set up logic within those routes where required.
router.get("/", function (req, res) {
    res.render("index")
});

// Upload a csv to be added to the beancount file
// Upload a beancount file to be edited
router.post("/upload-beancount", function (req, res) {

    const info = req.files.file.data.toString().split(/\n(?=[0-9]{4})/);
    const transactions = info.map(entry => {
        const entryList = entry.split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let transactionObject;
        if (entryList[1] === "*") {
            transactionObject = {
                date: entryList[0],
                description: entryList[2],
                type: "transaction",
                account_one: entryList[3],
                amount_one: entryList[4],
                currency_one: entryList[5],
                account_two: entryList[6],
                amount_two: entryList[7],
                currency_two: entryList[8],
            }

        } else if (entryList[1] === "open") {
            transactionObject = {
                date: entryList[0],
                type: "account",
                accountName: entryList[2],
                currentcy: entryList[3]
            }

        } else {
            transactionObject = {}
        }
        return transactionObject

    }).filter(elm => elm.date)
    console.log(transactions)
    res.render("transactions", {transactions:transactions});
});

router.get("*", function (req, res) {
    res.redirect("/")

});
router.post("/upload-csv", function (req, res) {

    function Transaction(fromAccount, toAccount, date, description, ammount) {
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.date = date;
        this.description = description;
        this.ammount = parseInt(ammount);
        this.export = {
            account_one: this.fromAccount,
            account_two: this.toAccount,
            date: this.date,
            description: this.description,
            amount_one: this.ammount,
            amount_two: this.ammount * -1,
            currency_one: "USD",
            currency_two: "USD"
        }
    }
    
    let account = 'Liabilities:CreditCard:ChaseFreedom';
    let transactions = [];
    
     fs.createReadStream(req.files.csv_file.tempFilePath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on('data', (row) => {
            if (row[2].match(/ALBERTSONS/)) {
                transactions.push(new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Albertsons", row[5]).export)
                console.log(new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Albertsons", row[5]).export)
                console.log(row[5])
            } else if (row[2].match(/FRED MEYER/)) {
                transactions.push(new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Fred Meyer", row[5]).export)
            } else if (row[2].match(/99 RANCH/)) {
                transactions.push(new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - 99 Ranch", row[5]).export)
            } else if (row[2].match(/INSTACART/)) {
                transactions.push( new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Instacart", row[5]).export)
            } else if (row[2].match(/TRADER JOE/)) {
                transactions.push( new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Trader Joe's", row[5]).export)
            } else if (row[2].match(/WAL-MART/)) {
                transactions.push( new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Walmart", row[5]).export)
            } else if (row[2].match(/HMART/)){
                transactions.push( new Transaction(account, "Expenses:Food:Groceries", row[0], "Groceries - Walmart", row[5]).export)
            } else if (row[2].match(/CHEVRON/)) {
                transactions.push( new Transaction(account, "Expenses:Transport:Gas", row[0], "Gas", row[5]).export)
            } else if (row[2].match(/Payment Thank You/)) {
                transactions.push( new Transaction("Assets:Chase:Checking", account , row[0], "Paid off credit card", row[5] * -1).export)
            } else {
                transactions.push( new Transaction(account, "Expenses:UNKNOWN", row[0], row[2], row[5]).export)
            }
        })
        .on('end', () => {
            // console.log('CSV file successfully processed');
            console.log(transactions)

    res.render("transactions", {transactions});
        }); 
});

router.get("*", function (req, res) {
    res.render("index")
})


// Export routes for server.js to use.
module.exports = router;
