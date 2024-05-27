const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { auth } = require('./user');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');
const Mailjet = require('node-mailjet');

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'rentifyarun@hotmail.com',
        pass: 'Rentify@2001'
    }
});

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

router.post('/interest/:propertyId/:userId',  async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
       
        const seller = await User.findById(property.postedBy);
        const buyer = await User.findById(req.params.userId);

        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!buyer) {
            return res.status(404).json({ error: 'Buyer not found' });
        }

       
        const buyOpt = {
            from: "rentifyarun@hotmail.com",
            to: buyer.email,
            subject: "Interest in Property",
            text: `Dear ${buyer.firstName},\n\nYou have shown interest in the property with Name: ${property.title}.\nContact Details\nEmail:${seller.email}\nPhonenumber:${seller.phoneNumber}\n\nThank you,\nRentify Team`,
        };

     
        const sellOpt = {
            from: "rentifyarun@hotmail.com",
            to: seller.email,
            subject: "Property Interest Notification",
            text: `Dear ${seller.firstName},\n\nA buyer has shown interest in your property with Name: ${property._id}.
            \nContact Details\nEmail:${buyer.email}\nPhonenumber:${buyer.phoneNumber}
            \n\nThank you,\nRentify Team`,
        };

        
        transporter.sendMail(buyOpt, (err, info) => {
            if (err) {
                console.log('Error sending email to buyer:', err.message);
            } else {
                console.log('Email sent to buyer:', info.response);
            }
        });

        // Send email to the seller
        transporter.sendMail(sellOpt, (err, info) => {
            if (err) {
                console.log('Error sending email to seller:', err.message);
            } else {
                console.log('Email sent to seller:', info.response);
            }
        });

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
