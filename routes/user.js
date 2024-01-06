const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
// User Routes
router.post('/signup', async (req, res) => {
    // Implement user signup logic
    const username = req.body.username;
     const password = req.body.password;
     
 
     await User.create({
         username:username,
         password:password
     })
      res.json({
         msg:"User create sucessfully"
      })
});

router.post('/signin', async (req, res) => {
    // Implement user signup logic
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.find({
        username,
        password
    })
    if(user){

        const token  = jwt.sign({
            username
        },JWT_SECRET);
        res.json({
            token
        });
    }else{
        res.status(411).json({
            msg:"invalid email or password"
        })
    }

});

router.get('/courses',  (req, res) => {
    // Implement listing all courses logic
     Course.find({})
     .then(function(resolve){
        res.json({
            courses:resolve
        })
     })
});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId;
    const username  = req.body.username;
    if(req.username===username){
        await User.updateOne({
            username: username
        }, {
            "$push": {
                purchasedCourses: courseId
            }
        })
        res.json({
            message: "Purchase complete!"
        })

    }else{
        res.status(411).json({
            msg:"wromg credentials"
        })
    }
    
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const user = await User.findOne({
        username: req.headers.username
    });

    console.log(user.purchasedCourses);
    const courses = await Course.find({
        _id: {
            "$in": user.purchasedCourses
        }
    });

    res.json({
        courses: courses
    })
});

module.exports = router