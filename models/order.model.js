const mongoose = require('mongoose');
const user  = require('./User.model')

const orderSchema = new mongoose.Schema({
    date: {
        type: Date,
        
    },
    design_name: {
        type: String,
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: user
    },
    design_type: {
        type: String
    },
    order_type:{
    type:String
    },
    priority:{
        type:String
    },
    price :{
        type:String
    },
    remarks:{
        type:String
    },
    delivery_date:{
        type: Date,
        
    },
    width:{
        type:String
    },
    height:{
        type:String
    },
    po_number:{
        type:String
    },
    placement:{
        type:String
    },
    unit:{
        type:String
    },
    file:{
        type:String
    },
    status :{
        type:String,
        default:"pending"
    },
    digitizer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: user
    }


  

});

orderSchema.set('timestamps',true)




module.exports=  order = mongoose.model('order', orderSchema);
