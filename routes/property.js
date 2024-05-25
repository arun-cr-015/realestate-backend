const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { auth } = require('./user');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');
const Mailjet = require('node-mailjet');
// Setup nodemailer transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: '@gmail.com',
//         pass: ''
//     }
// });

// const mailjet = Mailjet.apiConnect(
//     '81b3aa4ad884e51f65da9d0093e3c258',
//     'eeec0f35b141d5c0194353828f3c76f9',
//         );


router.post('/', async (req, res) => {
    try {
        const newProperty = new Property(req.body);
        const property = await newProperty.save();
        res.status(201).json(property);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to add property' });
    }
});

router.get('/',async (req, res) => {
    
    const { page = 1, limit = 5 } = req.query;
    try {
        const properties = await Property.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await Property.countDocuments();
        res.status(200).json({
            properties,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/seller/:sellerId', async (req, res) => {
    const { sellerId } = req.params;
    try {
        const properties = await Property.find({ postedBy: sellerId });
        res.status(200).json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/:id/like', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        property.likes += 1;
        await property.save();
        res.status(200).json(property);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/interest/:propertyId',  async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        console.log(property)
        const seller = await User.findById(property.postedBy);
        const buyer = await User.findById(req.userId);

        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(200).json({ sellerEmail: seller.email, sellerPhoneNumber:seller.phoneNumber,sellerName:seller.firstName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.status(200).json(updatedProperty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deletedProperty = await Property.findByIdAndDelete(req.params.id);
        if (!deletedProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
