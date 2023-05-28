import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from "../../lib/mongo"
import {emailData} from "../../models/dummy"
import type { User } from './user'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'


async function searchSocial(req: NextApiRequest, res: NextApiResponse) {
    const  userkey = req.session.user?.userkey
    let finaldata:object
    const { db } = await connectToDatabase();
    const { queryFor, query } = req.body
    const emailApiUrl = "https://api.seon.io/SeonRestService/email-api/v2.2/"    
    const mobileApiUrl = "https://api.seon.io/SeonRestService/phone-api/v1.4/"
   
    if(req.session.user){
        try{
            switch (req.method) {
                case 'POST':          
                    return fetchSocialMedia()    
                default:
                    return res.status(405).end(`Method ${req.method} Not Allowed`)
            }
        }catch(error){
            res.status(500).end("Something Worng" )
        }
    }else{
        res.status(503).end("Unauthorized access")
    }
    async function updateCreditFun (option:object, updateCredit:object) {
        await db.collection("clients").updateOne(option, updateCredit)
        if(req.session.user){
            req.session.user.creditBalance = req.session.user.creditBalance - 1
            await req.session.save()
        } 
    }
    // Chanage to await
    async function fetchSocialMedia () {
        
        if(userkey && userkey != ""){
            const clientData = await db.collection("clients").findOne({
              userkey
            })  
            if(clientData){
                const { crbalance } = clientData       
                if(crbalance > 0){
                    let URL = null
                    let option = {}
                    let updateCredit = {}
                    if(queryFor == 'email'){
                        URL = emailApiUrl+query
                    }else if (queryFor == 'mobile'){
                        URL = mobileApiUrl+query
                    }
                    // For Dummy test over rule the url
                    //URL = "http://localhost:3000/api/dummy"
                    if(URL){                                                   
                        option = {
                            userkey,
                            crbalance : {$gte:0}
                        }
                        updateCredit = {                               
                            $inc :{ "crbalance":-1}                               
                        }
                        const response = await fetch(
                            URL,
                            {
                                method: 'GET',
                                headers: {
                                    'X-API-KEY': clientData.apikey,
                                    'Content-Type':'application/json'
                                },
                            }
                        )
                       
                        .then(async (response) => (                            
                            await response.json()
                        ))                        
                        .then((result) => {     
                            finaldata = result.data['account_details']
                        })
                        .catch((error) => {                           
                            return res.status(500).end("Some thing went woring during data fetch please try again after sometime") 
                        });
                       
                        if(req.session.user){
                            req.session.user.creditBalance = req.session.user.creditBalance - 1
                            await req.session.save()
                            const uDate = await db.collection("clients").updateOne(option, updateCredit) 
                        }else{
                            return res.status(503).end("Access denied")
                        }                        
                        return res.status(200).json(finaldata)    
                    }else{                        
                        return res.status(500).end("Not valid request")
                    }                    
                }else{
                    return res.status(500).end("Credit balance is low contact 'care.bytesec@gmail.com'")
                }
            }else{                
                return res.status(503).end("Unauthrize access")
            }         
        }else{
            return res.status(500).end("Not a valid user key")
        }
    }  
        
}
export default withIronSessionApiRoute(searchSocial, sessionOptions)