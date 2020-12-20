const express = require("express");
const bcrypt = require('bcrypt')
const _ = require('lodash')
const router = express.Router();
// var isBase64 = require('is-base64');
const fs = require('fs');
var path = require('path');
const {baseUrl}= require('../utils/url')
const {CreateNotification}  =  require('../utils/Notification')
const axios  = require('axios')
const { check, validationResult } = require('express-validator');
const config = require('config')
//model
const User = require('../models/User.model')
// const Review = require('../models/reviews.model')
//middleware 
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

//servcies
const { url } = require('../utils');
const checkObjectId = require("../middleware/checkobjectId");
const orderModel = require("../models/order.model");



// @route Get api/users (localhost:5000/api/users)
// @desc to getallusers 
// access Private


router.get('/pendingorder', [auth,admin], async (req, res) => {
    const {page,limit,fieldname,order} = req.query
    const currentpage = page?parseInt(page,10):1
    const per_page = limit?parseInt(limit,10):5
    const CurrentField = fieldname?fieldname:"createdAt"
    const currentOrder = order? parseInt(order,10):-1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] =currentOrder
    // return res.json(sort)
    


    try {
        let orders = await orderModel.find({status:"pending"}).limit(per_page).skip(offset).sort(sort)
        // console.log(users)
        if (!orders.length) {
            return res
                .status(400)
                .json({ message: 'no order exist' });
        }
    //   let totalorders =  await orderModel.aggregate(
    //     [
    //       {
    //         $group: {
    //           _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
    //           totalOrderReceived: {
    //             $sum: "$date"
    //           }
    //         }
    //       }
    //     ]
    //   )
   
        // let currentMonthOrders = orders.filter

     
            let Totalcount = await orderModel.find({status:"pending"}).count()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            // totalOrders : ,
            data: orders
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




  

module.exports = router






