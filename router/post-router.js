const router = require("express").Router();

const db = require("../data/db");

// ALL ENDPOINTS BEGIN WITH /api/posts

// GET ALL POSTS
router.get("/", (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json({
        message: "There was an error retrieving posts from the database."
      });
    });
});

// ADD POST
router.post("/", (req, res) => {
  const newPost = req.body;
  if (!newPost.title || !newPost.contents) {
    res.status(400).json({
      message: "Bad Request. Please include both title and contents."
    });
  } else {
    db.insert(req.body)
      .then(post => {
        res.status(201).json(post);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message: "There was an error adding the post to the database."
        });
      });
  }
});

// GET POST BY ID
router.get("/:id", (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post.length > 0) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: "There was no post with that ID found in the database."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "There was an error retrieving that post from the database"
      });
    });
});

// DELETE POST BY ID
router.delete("/:id", (req, res) => {
  db.findById(req.params.id)
    .then(post => {
      if (post.length > 0) {
        res.status(200);
      } else {
        res
          .status(404)
          .json({ message: "No post was found with specified ID." });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "There was an error deleting the post from the database."
      });
    });
  db.remove(req.params.id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ message: "Failed to delete the post by that ID." });
    });
});

//EDIT POST BY ID
router.put("/:id", (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({
      message:
        "Please include both a title and contents for updating this post."
    });
  }
  db.findById(req.params.id)
    .then(post => {
      if (post.length === 0) {
        res.status(404).json({ message: "Post with that id was not found." });
      } else {
        db.update(req.params.id, req.body)
          .then(post => {
            res.status(200).json(post);
          })
          .catch(err =>
            res
              .status(500)
              .json({ message: "There was an error updating the post." })
          );
      }
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ message: "There was an error updating the post." });
    });
});

// ADD COMMENT TO POST WITH THAT ID
router.post("/:id/comments", (req, res) => {
    const { id } = req.params
    const { text } = req.body
    if (!text){
        res.status(400).json({"message": "Please include text for your comment"})
    } else {
        db.findById(id)
        .then(post => {
            if (post.length < 1){
                res.status(404).json({"message" : "There is no post by that ID."})
            }
            return db.insertComment({text, post_id:id})
        })
        .then(data => {
            db.findCommentById(data.id)
            .then(comment => {
                res.status(201).json(comment)
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({"message" : "Error retrieving comment that was created."})
            })
        })
        .catch(err =>{
            console.log(err)
            res.status(500).json({"message": "Error saving comment to the database"})
        })
    }
})

// GET COMMENTS BY POST!
router.get('/:id/comments', (req, res) => {
    db.findById(req.params.id)
    .then(post => {
        if(post.length === 0){
            res.status(404).json({
                "message": "There is no post by that ID."
            })
        } else {
           return db.findPostComments(req.params.id)
        }
    })
    .then(data => {
        console.log(data)
        res.status(200).json(data)
    })
    .catch(err => {
        console.log(err)
    })
    
})


module.exports = router;
