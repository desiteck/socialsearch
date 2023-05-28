import { connectToDatabase } from "../../lib/mongo"
import type { User } from './user'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios"

type Data = {
  message?: String
  data?:  Object
} 


const verifyRecaptcha = async (token:any) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  var verificationUrl =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secretKey +
    "&response=" +
    token;

  return await axios.post(verificationUrl);
};

async function loginRoute(req: NextApiRequest, res: NextApiResponse<Data>) {
  const token = req.body.token;
  const response = await verifyRecaptcha(token);

    if (!response.data.success && response.data.score < 0.5) { 
        res.status(500).end("Something went wrong, please try again!!!")
    } 
    const { db } = await connectToDatabase()  
    let { userkey } = req.body
    try{
      switch (req.method) {
        case 'POST':          
          return fetchClient()    
        default:
            return res.status(500).end(`Method ${req.method} Not Allowed`)
      }   
    }catch(err){
      res.status(500).end( "Something Worng")
    }

    async function fetchClient() {      
        
      if(userkey && userkey != ""){
        const clientData = await db.collection("clients").findOne({
          userkey
            
        })
        if(clientData){
          const { crbalance } = clientData       
          if(crbalance > 0){
            const user = { isLoggedIn: true, userkey, creditBalance: crbalance } as User
            req.session.user = user
            await req.session.save()
            res.status(200).json({data:"Ok"})
          }else{
            res.status(500).end("Credit balance is finished contact admin")
          }       
        }else{
          res.status(500).end("Not a valid user key")
        }
      }else{
        res.status(500).end("Not a valid user key")
      }
    }  
  
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)