const express = require("express");
const fs = require("fs")

const router = express.Router();

// Create all our routes and set up logic within those routes where required.
router.get("/", function (req, res) {
    res.render("index")
});

// Upload a csv to be added to the beancount file
// Upload a beancount file to be edited
router.post("/upload", function (req, res) {

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
    // res.send(transactions)
    res.render("transactions", {transactions:transactions});
});

router.get("*", function (req, res) {
    res.redirect("/")

});


// Export routes for server.js to use.
module.exports = router;
