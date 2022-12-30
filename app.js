const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

mongoose.set('strictQuery', false);

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

// let items=["exercise","breakfast","bath"];
// var workItems=[];

mongoose.connect("mongodb+srv://DinemoDb:1Lkqv19rBTSVAEoQ@cluster0.qjquuxt.mongodb.net/?retryWrites=true&w=majority")

const itemsSchema = {
    name: String,

};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "wellcome"
});
const item2 = new Item({
    name: "wellcome to the "
});
const item3 = new Item({
    name: "wellcome to the database"
});
const item4 = new Item({
    name: "niceeeeeeeee"
})
const defaultItems = [item1, item2, item3, item4];
const listSchema = {
    name: String,
    items: [itemsSchema]

};
const List = mongoose.model("List", listSchema);




app.get('/', (req, res) => {

    Item.find({}, (err, findItem) => {


        if (findItem.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("succesfully saved")
                }
            })
            res.redirect("/");
        }
        else {
            if (err) {
                console.log(err);
            } else {
                res.render("list", {
                    listTitles: "Today",
                    newListItems: findItem
                });
            }
        }
    });


});



app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.render("/" + customListName)
            }
            else {
                res.render("list", {
                    listTitles: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    })


})









app.post("/", (req, res) => {
    var itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


});
app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("successfully deleted checked item")
                res.redirect("/");
            };
        });
    } else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }


})

app.get("/work", (req, res) => {
    res.render("list", {
        listTitles: "Work Items",
        newListItems: workItems
    });
});

app.post("/work", (req, res) => {
    var item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})




app.listen(1000, () => {
    console.log("server is running on 1000");
})