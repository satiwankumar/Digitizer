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


// const Appid = config.get('appid')
// const Secretkey = config.get('secret_key')










// @route Get api/users (localhost:5000/api/users)
// @desc to getallusers 
// access Private


router.get('/', [auth,admin], async (req, res) => {
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
        let orders = await orderModel.find().limit(per_page).skip(offset).sort(sort)
        // console.log(users)
        if (!orders.length) {
            return res
                .status(400)
                .json({ message: 'no order exist' });
        }
     
            let Totalcount = await orderModel.find().count()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            data: orders
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});






router.post('/edit/:orderid',
    [
        auth,
        admin
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }

        

        const {
            date,
            design_name,
            client,
            design_type,
            order_type,
            priority,
            price ,
            remarks,
            delivery_date,
            width,
            height,
            po_number,
            placement,
            unit,
            digitizer,
            file

        } = req.body;

     
        try {
console.log("params",req.params.orderid)

            let order = await orderModel.findOne({ _id: req.params.orderid })
            // console.log(user)
            if (!order) {
                return res
                    .status(400)
                    .json({ message: 'Order doesnot exist' });
            }

            const OrderFields = {};
            OrderFields.client= client ?client :order.client;
            OrderFields.date = date?date:order.date;
            OrderFields.design_name = design_name?design_name:order.design_name
            OrderFields.design_type = design_type?design_type:order.design_type
            OrderFields.order_type = order_type?order_type:order.order_type
            OrderFields.priority = priority?priority:order.priority
            OrderFields.price = price?price:order.price      
            OrderFields.remarks = remarks?remarks:order.remarks
            OrderFields.delivery_date = delivery_date?delivery_date:order.delivery_date
            OrderFields.width = width?width:order.width
            OrderFields.height = height?height:order.height
            OrderFields.po_number = po_number?po_number:order.po_number
            OrderFields.placement = placement?placement:order.placement
            OrderFields.unit = unit?unit:order.unit
            OrderFields.file = file?file:order.file0
            OrderFields.digitizer = digitizer?digitizer:order.digitizer
    
                order = await orderModel.updateOne(
                  { _id:req.params.orderid },
                  { $set: OrderFields },
                );
           
            


            res.status(200).json({
                message: "Order Updated Successfully",
                data: order
            });
        } catch (err) {
          
           
                const errors =[]
                errors.push({msg : err.message}) 
                res.status(500).json({ errors: errors });
            
        }
    }
);










// @route Post api/users (localhost:5000/api/users)
// @desc to Add/Register user
// access public

router.post('/',[auth,admin], async (req, res, next) => {

    try {
        let error = []
        const errors = validationResult(req);
        const url =   baseUrl(req)  

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            date,
            design_name,
            client,
            design_type,
            order_type,
            priority,
            price ,
            remarks,
            delivery_date,
            width,
            height,
            po_number,
            placement,
            unit,
            digitizer,
            file
            
          } = req.body;
      console.log("file",file)
      return res.json(file)
          //build profile objects
          const OrderFields = {};
           OrderFields.client= client ?client :null
           OrderFields.date = date?date:""
           OrderFields.design_name = design_name?design_name:""
           OrderFields.design_type = design_type?design_type:""
           OrderFields.order_type = order_type?order_type:""
           OrderFields.priority = priority?priority:""
           OrderFields.price = price?price:""      
           OrderFields.remarks = remarks?remarks:""
           OrderFields.delivery_date = delivery_date?delivery_date:""
           OrderFields.width = width?width:""
           OrderFields.height = height?height:""
           OrderFields.po_number = po_number?po_number:""
           OrderFields.placement = placement?placement:""
           OrderFields.unit = unit?unit:""
           OrderFields.file = file?file:""
           OrderFields.digitizer = digitizer?digitizer:null
           order = new orderModel( OrderFields)



        await order.save()
        // const notification = {
        //     user :null,
        //     notificationType:"Admin",
        //     notificationId:user._id,
        //     title: "Order is created",
        //     body:"user a has been created"

            
        // }
        // CreateNotification(notification)

        

        
        res.status(200).json({
            message: "Order  Created Successfully",
            Order:order,
            //  data: JSON.stringify(response1.data) 
        });
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }


})




// @route Post api/order/status
// @desc to status
// access public


router.post('/status', [auth,admin], async (req, res) => {

 

  //   console.log(status)
  try {
    const status =["PENDING","ASSIGNED","RTS(READY TO SEND)","COMPLETED"]
    const {order_id,order_status} = req.body
    if(!status.includes(order_status.toUpperCase())){
        return res.status(400).json({ message: 'Invalid status ' })
    }
    
    let order = await orderModel.findOne({ _id: order_id });
          // console.log(user)
    if (!order)
     { return res.status(400).json({ message: 'order doesnot exist ' });}

    
      order.status = status[status.indexOf(order_status.toUpperCase())];
      await order.save();
      return res.status(200).json({ message: 'Order status Updated Successfully' })
  
   
      
  } catch (error) {
  //   console.error(error.message);
    res.status(500).json({error:error.message});
  }

});




  

module.exports = router






