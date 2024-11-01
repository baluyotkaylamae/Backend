const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mongoose = require('mongoose');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    console.log(userList)

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})

// router.get('/:id', async (req, res) => {
//     const user = await User.findById(req.params.id).select('-passwordHash');

//     if (!user) {
//         res.status(500).json({ message: 'The user with the given ID was not found.' })
//     }
//     res.status(200).send(user);
// })
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Log the incoming ID
        console.log(`Fetching user with ID: ${userId}`);

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid ID format');
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        // Fetch user from the database
        const user = await User.findById(userId).select('-passwordHash');

        // Log the found user or lack thereof
        if (!user) {
            console.log(`User not found for ID: ${userId}`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('User found:', user);
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message || error });
    }
});



router.post('/', async (req, res) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    let password = await bcrypt.hashSync(req.body.password, salt);

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: password,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// router.put('/:id', async (req, res) => {
//     try {
//         const userExist = await User.findById(req.params.id);
//         if (!userExist) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         let newPassword;
//         if (req.body.password) {
//             newPassword = bcrypt.hashSync(req.body.password, 10);
//         } else {
//             newPassword = userExist.passwordHash;
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             req.params.id,
//             {
//                 name: req.body.name,
//                 email: req.body.email,
//                 passwordHash: newPassword,
//                 phone: req.body.phone,
//                 isAdmin: req.body.isAdmin,
//                 street: req.body.street,
//                 apartment: req.body.apartment,
//                 zip: req.body.zip,
//                 city: req.body.city,
//                 country: req.body.country,
//             },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(400).json({ success: false, message: 'User update failed' });
//         }

//         return res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        const userExist = await User.findById(req.params.id);
        if (!userExist) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newPassword = req.body.password ? bcrypt.hashSync(req.body.password, 10) : userExist.passwordHash;

        const updateData = {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        };


        if (req.file) {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            updateData.image = `${basePath}${fileName}`;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(400).json({ success: false, message: 'User update failed' });
        }

        return res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});


router.post('/login', async (req, res) => {
    console.log(req.body.email);
    const user = await User.findOne({ email: req.body.email });

    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        );
        console.log('Generated Token:', token);

        const decoded = jwt.verify(token, secret);
        console.log('Decoded token:', decoded); 

        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send('password is wrong!');
    }
});

router.post('/register', uploadOptions.single('image'), async (req, res) => {
    console.log("Incoming registration request:", req.body); // Check if req.body has the data
    console.log("Uploaded file:", req.file); // Should log the uploaded file details

    if (!req.file) {
        return res.status(400).send('No image in the request');
    }

    const file = req.file;
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        image: `${basePath}${fileName}`,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });

    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            return res.status(200).json({ success: true, message: 'The user is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();

    if (!userCount) {
        return res.status(500).json({ success: false });
    }
    res.send({
        userCount: userCount
    });
});

router.post('/googlelogin', async (req, res) => {
    const { response } = req.body;
    console.log(response);

    try {
        let user = await User.findOne({ googleId: response.id });

        if (!user) {
            user = await User.create({
                name: response.name,
                email: response.email,
                password: '',
                avatar: {
                    public_id: 'avatars/avatar-default',
                    url: response.picture,
                },
                googleId: response.id
            });
        }

        sendToken(user, 200, res);
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).send('Google login failed');
    }
});

// Helper function to send JWT token
function sendToken(user, statusCode, res) {
    const secret = process.env.secret;
    const token = jwt.sign(
        {
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        { expiresIn: '1d' }
    );
    res.status(statusCode).send({ user: user.email, token });
}

module.exports = router;
