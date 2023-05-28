import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from "../../lib/mongo"
import {emailData} from "../../models/dummy"
import type { User } from './user'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import axios from 'axios'

async function dummyData(req: NextApiRequest, res: NextApiResponse) {
     const data = emailData           
        
        res.status(200).json(data)
}

export default dummyData