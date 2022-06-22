const Admin = require("../models/admin");
const {Response} = require("../helpers");
const Joi = require('joi');


async function getAccounts(req, res) {
    const data = await Admin.find()
    res.json(Response.success(data))
}

async function getAccount(req, res) {
    const data = await Admin.findById(req.params.id)
    res.json(Response.success(data))
}

async function deleteAccount(req, res) {
    const admin = await Admin.findById(req.params.id)
    admin.isDeleted = true
    await admin.save()

    res.json(Response.success())
}

async function addAccounts(req,res){

    const schema=Joi.object({
        name:Joi.string().required(),
        email:Joi.string().required().lowercase(),
        mobile:Joi.string(),
        password:Joi.string().min(8),
        type:Joi.string().required()
    }).options({stripUnknown:true })


const{value,error}=schema.validate(req.body)

if (error) {
    return res
        .status(401)
        .json(Response.error('invalid request'))
}

if(await Admin.findOne({email:value.email}))
{
    return res
    .status(401)
    .json(res.error("Admin alredy exist"))
}


const Account=new Admin(value)
await Account.save()
return res.json(Response.success())
}

async function updateAccount(req,res) {

    const schema=Joi.object({
        name:Joi.string().required(),
        email:Joi.string().required().lowercase(),
        mobile:Joi.string(),
        type:Joi.string().required()
    }).options({ stripUnknown:true })


const{value,error}=schema.validate(req.body)

if (error) {
    return res
        .status(400)
        .json(Response.error('invalid request'))
}

const admin = await Admin.findById(req.params.id)

if (admin.email !== value.email) {
    if (await Admin.findOne({email: value.email})) {
        return res
        .status(400)
        .json(res.error("Admin already exist"))
    }
}

admin.set(value)
await admin.save()
return res.json(Response.success())
}


module.exports = {
    getAccounts,addAccounts,getAccount, deleteAccount, updateAccount
}
