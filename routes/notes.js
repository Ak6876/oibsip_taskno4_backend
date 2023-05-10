const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1: Get All the Notes using: GET "/api/notes/fetchallnotes"  require Auth  Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
});
//ROUTE 2: Add a new Note using: POST "/api/notes/fetchallnotes"  require Auth  Login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title").isLength({ min: 5 }).withMessage("Enter a valid title"),
    body("description").isLength({ min: 5 }).withMessage("Description must be atleast 5 characters"),
  ],
  async (req, res) => {
    try {
        const {title,description,tag} = req.body
        //if there are errors, return bad request and the errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
        return res.status(400).json({errors: error.array()});
        }
        const note = new Notes({
        title,description,tag,user:req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
  }
);

//ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote"  require Auth  Login Required
router.put(
    "/updatenote/:id",
    fetchUser,
    [
      body("title").isLength({ min: 5 }).withMessage("Enter a valid title"),
      body("description").isLength({ min: 5 }).withMessage("Description must be atleast 5 characters"),
    ],
    async (req, res) => {
        try {
            const {title,description,tag} = req.body
            const newNote = {}
            if(title){newNote.title = title}
            if(description){newNote.description = description}
            if(tag){newNote.tag = tag}

            //find the note to be updated and update it
            let note = await Notes.findById(req.params.id)
            if(!note){
                return res.status(404).send("Not Found")
            }
            if(note.user.toString() !== req.user.id){
                return res.status(401).send("Access Denied")
            }
            note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
            res.json({note})
        } catch (error) {
            console.error(error.message)
        res.status(500).send("Internal Server Error")
        }
    })
//ROUTE 4: Delete an existing Note using: DEL "/api/notes/deletenote"  require Auth  Login Required
router.delete(
    "/deletenote/:id",
    fetchUser,
    async (req, res) => {
        try {
            //find the note to be Deleted and Delete it
            let note = await Notes.findById(req.params.id)
            if(!note){
                return res.status(404).send("Not Found")
            }
            //Allow deletion only if user owns this Note
            if(note.user.toString() !== req.user.id){
                return res.status(401).send("Access Denied")
            }
            note = await Notes.findByIdAndDelete(req.params.id)
            res.json({"success":"Note has been deleted",note:note})
        } catch (error) {
            console.error(error.message)
        res.status(500).send("Internal Server Error")
        }
    })
module.exports = router;
