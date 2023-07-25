const Blood = require("../models/BloodModel");
const bcrypt = require('bcrypt');
// Blood Bank Schema
function BloodData(data) {
    
    this.name =data.name;
	this.address =data.address;
	this.email=data.email;
	this.password =data.password;
	this.phone=data.phone;
	this.city =data.city;
	this.time=data.time;
	this.BloodGroup=data.BloodGroup
}
//set the time whether its 24/7 or something else
function settime(open,close){
    if (open===''&&close===''){
        return '24/7'
    }
    else{
        return open+'-'+close
    }
}

//To get Blood Bank details
exports.BloodBankDetail = [

	async (req, res) => {
    console.log('this is recieve',req.body)
    try{
        await Blood.findOne({name:req.params.name , address:req.params.address}).then(blood=>{
                if(blood){
                        
                    var b=new BloodData(blood[0])

                    return res.status(200).send({org:b});
                }
                else{
                    return res.status(430).send({ null_data:"No such bloodbank found"});
                }    
            })
    }
    catch(err){
        console.log(err);
        return res.status(430).send({ error: err});
    }
    }
];

//Add a new Blood Bank 
exports.AddBloodBank = [

	(req, res) => {
    console.log('this is recieve',req.body)
    try{
        Blood.findOne({name:req.body.name , address:req.body.address}).then(bank=>{
                if(bank){
                    return res.status(430).send({error:"This Blood Bank already exist"});
                }
                else{
                    var blood=new Blood({
                        name:req.body.name,
	                    address:req.body.address,
	                    email:req.body.email,
	                    password :req.body.password,
	                    phone:req.body.phone,
	                    city:req.body.city,
	                    time:settime(req.body.time.open,req.body.time.close)

                    })
					blood.save()
                    return res.status(200).send({message:"Blood Bank added successfully"});
                }    
            })
    }
    catch(err){
        console.log(err);
        return res.status(420).send({ error: err});
    }
    }
];

//Update Blood Bank 
exports.UpdateBloodBank = [

	(req, res) => {
    console.log('this is recieve',req.body)
    try{
        var blood=new Blood({
            name:req.body.name,
            address:req.body.address,
            email:req.body.email,
            password :req.body.password,
            phone:req.body.phone,
            city:req.body.city,
            time:settime(req.body.time.open,req.body.time.close)

        })
        Blood.findOneAndUpdate(
				{name:req.body.old_name , address:req.body.old_address},
				blood
				).then(()=>{
                
                
                if(req.body.name!=req.body.old_name&&req.body.address!=req.body.old_address){
                    Note.update({org_name:req.body.old_name,org_address:req.body.old_address},
                    {org_name:req.body.name,org_address:req.body.address})

                    Order.update({org_name:req.body.old_name,org_address:req.body.old_address},
                    {org_name:req.body.name,org_address:req.body.address})

                    Transaction.update({org_name:req.body.old_name,org_address:req.body.old_address},
                    {org_name:req.body.name,org_address:req.body.address})


                }
                    return res.status(200).send({message:"Blood Bank added successfully"});
                }    
            )
    }
    catch(err){
        console.log(err);
        return res.status(430).send({ error: err});
    }
    }
];

//Delete Blood Bank
exports.DeleteBloodBank = [

	(req, res) => {
    console.log('this is recieve',req.body)
    try{
		
        Blood.deleteOne(
				{name:req.params.name , address:req.params.address},
				
				).then(()=>{
                
                    return res.status(200).send({message:"Blood Bank deleted successfully"});
                }    
            )
    }
    catch(err){
        console.log(err);
        return res.status(430).send({ error: err});
    }
    }
];

//function to display all Blood Bank branches
exports.BloodBankBranches = [
	
	async (req, res) => {
    console.log('this is recieve',req.body)
    try{
        Blood.find({name:req.params.name}).then(bb=>{
            if(bb.length){
                let branches_name=[]
                for (var b=0;b<bb.length;b++){
                    var branch=new BloodData(bb[b])
                    branches_name.push(branch.address)
                }
                return res.status(200).send({ branch:branches_name });
            }
            else{
                return res.status(430).send({ null_data:"No branches found"});
            }
            
        })
    }
    catch(err){
        console.log(err);
        return res.status(430).send({ error: err});
    }
    }
]

async function compare(a,b){
    let c=await bcrypt.hash(b, 8)
    return a=c
}

//function to login to a blood bank
exports.LoginBloodBank=[
    async (req,res)=>{
        console.log('this is recieved ',req.body)
        try{
            Blood.find({name:req.body.name,address:req.body.branch}).then(blood=>{
                if(blood.length){
                    let bb=new BloodData(blood[0])
                    if(compare(bb.password,req.body.password)){
                        return res.status(200).send({user:bb})
                    }
                    else{
                        return res.status(430).send({error:'Please enter correct password'})
                    }
                }
                else{
                    return res.status(420).send({error:"No such blood bank exist"})
                }
            })
        }
        catch(err){
            console.log(err)
        }
    }
]

//function to get all the blood groups
exports.AllBloodGroups=[
	
	async (req, res) => {
    console.log('this is recieve',req.params)
    try{
        await Blood.findOne({name:req.params.org_name , address:req.params.org_address}).then(bank=>{
          
                if(bank){
                        
                    var bloodgroups=bank.BloodGroup
                  console.log('bank is',bloodgroups)
                    return res.status(200).send({ bloodgroups:bloodgroups});
                }
                else{

                    return res.status(430).send({ error:"No such bloodbank found"});
                }    
            })
    }
    catch(err){
        console.log(err);
        return res.status(430).send({ error: err});
    }
    }
]

//function to update blood group
exports.updateBloodGroup = [
  async (req, res) => {
    console.log('this is received', req.body);

    try {
        const { name, address, blood_list } = req.body;
        const bank=await Blood.findOne({
            name: name, address 
        })  
      
      if (bank) {

        const Bloodtoupdate =bank.BloodGroup.find(m=>m.AvailableBloodGroup ===blood_list[0].oldtype )

        if(Bloodtoupdate){
            Bloodtoupdate.AvailableBloodGroup=blood_list[0].type;
            Bloodtoupdate.price=parseInt(blood_list[0].price);
            Bloodtoupdate.quantity=parseInt(blood_list[0].quantity);

            await bank.save();
            console.log("Blood Group updated successfully");
            return res.status(200).send({ message: "Blood Group updated successfully" });
        }


      } else {
        return res.status(422).send({ error: "No such blood bank exists" });
      }
    } catch (err) {
      console.log(err);
      return res.status(430).send({ error: err });
    }
  }
];

//function to delete selected blood groups
exports.deleteSelectedBlood = [
  async (req, res) => {
    console.log('this is received', req.params);

    try {
      const { name, address, fields } = req.params;

      const deletedBlood = fields.split(',');

      const bank = await Blood.findOne({ name: name, address });

      if (bank) {
        deletedBlood.forEach((deletedBloodgroup) => {
          bank.BloodGroup = bank.BloodGroup.filter(
            (BloodGroup) => BloodGroup.AvailableBloodGroup !== deletedBloodgroup
          );
        });

        await bank.save();

        console.log("Blood types deleted successfully");
        return res.status(200).send({ message: "Blood types deleted successfully" });
      } else {
        return res.status(422).send({ error: "No such blood bank exists" });
      }
    } catch (err) {
      console.log(err);
      return res.status(430).send({ error: err });
    }
  }
];

//function to add blood group 
exports.AddBloodGroup=[

  async (req, res) => {
    console.log('this is receive', req.body);

    try {
      const blood = await Blood.findOne({
        name: req.body.name,
        address: req.body.address
      });

      if (blood) {
        const bloodList = req.body.blood_list;

        for (let i = 0; i < bloodList.length; i++) {
          const b = bloodList[i];
          
          const existingBloodGroup = blood.BloodGroup.find(m => m.AvailableBloodGroup === b.type );

          if (existingBloodGroup) {
          
            if(b.price>0){
            existingBloodGroup.price = b.price;}
            existingBloodGroup.quantity =parseInt(existingBloodGroup.quantity)+ parseInt(b.quantity);
          } else {

            blood.BloodGroup.push({
              AvailableBloodGroup: b.type,
              price: b.price,
              quantity: b.quantity,
              
            });
          }
        }

        await blood.save();

        console.log("Blood Groups added successfully");
        return res.status(200).send({ message: "Blood Groups added successfully" });
      } else {
        return res.status(430).send({ error: "No such blood bank exists" });
      }
    } catch (err) {
      console.log("db error", err);
      return res.status(422).send({ error: err });
    }
  }
]