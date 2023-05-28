import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import { useEffect, useState } from 'react'
import type { User } from './api/user'
import { FaMobile } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { ImSwitch } from "react-icons/im"
import Swal from 'sweetalert2'
import { withIronSessionSsr } from "iron-session/next"
import { sessionOptions } from 'lib/session'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from "next/router";

type Props = {
    user?:object
}
type ErrorMessage = {
    message?:any
}
type AcctDts =  {
    accountDetails?:object
    data?:object
    account_details?:object
}

const Home: NextPage = (props:Props): JSX.Element => {  

    const {userkey, creditBalance } = props.user as User
    const router = useRouter()  
    const [resResult, setResResult] = useState(<></>)
    const [accountDetails, setAccountDetails] = useState<AcctDts>({})
    const [crdBalance , setCredbalance] = useState(creditBalance)
    const [isLoading,setLoadContent] = useState({mobile:false, email:false, content:false})
    const [payload, setPayload] = useState({
        email: '', 
        mobile:''       
      })
      const showError = (Error:ErrorMessage) => {
        Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,        
            icon: 'warning',
            title: 'Error !',
            text:Error.message
        }) 
    }
    const logout = async (e:any) => {
        e.preventDefault()
        const res = await axios
        .post(
            "/api/logout",
            { userkey },
            {
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                },
            }
        )
        return router.push("/")
    }

    const searchQuery = async (e:any) => {
        Swal.close()
        setResResult(<></>)
        e.preventDefault()
        const queryFor = e.target.id       
        let query = ''        
        try{
            if(queryFor == 'email'){
                query = payload.email
                if (!query) {
                    throw new Error("Email required")
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(query)) {
                    throw new Error("Invalid email address")
                }
                setLoadContent({...isLoading, email:true, mobile:false, content:true})
            }else if(queryFor == 'mobile'){
                // validate number
                query = payload.mobile
                setLoadContent({...isLoading, email:false, mobile:true, content:true})
            }else{
                setLoadContent({...isLoading, mobile:false, email:false, content:false})
                throw new Error("not a valid queryfor")                
            }
            
            await axios.post('/api/search',  { queryFor, query },
            {
                headers: {  
                    Accept: "application/json",         
                    "Content-Type": "application/json",
                }
            }).then(function (response) {  
                setAccountDetails(response.data)
                setCredbalance(crdBalance - 1 )
            })
            .catch(function (error) {
                setAccountDetails({})                            
               showError({message:error.response.data})
            });
        }catch(err){            
            showError({message:err})
        }
        setLoadContent({...isLoading, mobile:false, email:false, content:false})
    }

    useEffect(() => {
       
        const html:any = (Object.keys(accountDetails).length !== 0) ?                          
         Object.entries(accountDetails).map(([key, value]) => (
           Object.entries(value).map((k:any)=>(
            (k[0] == "registered" && k[1] == true) && (                                    
               <div className='flex flex-col shadow-md py-2 items-center justify-center rounded' key={key}>                                        
                { <Image
                src={("/"+key+".svg")}
                alt={key}
                width={30}
                height={30}
                priority
                />}
                {key}</div> 
            )
           ))          
        )) : <></>

        setResResult(html)                      
        
    },[accountDetails])

    return (
        <>
        <div>
            <Head>
                <title>Social Links</title>
            </Head>
        </div>
        <div>
            <div className="bg-white flex flex-col drop-shadow-md pt-4 pb-1 min-h-min">                
                <div className='flex items-center justify-between px-2'>
                    <div className='text-gray-700 uppercase text-sm font-bold md:text-lg'>Search Social-media Links</div>
                    <div><a className='button text-red-700 cursor-pointer' onClick={logout}><div className='flex items-center'>Logout<ImSwitch className='text-red-700'/></div></a></div>
                </div> 
                <div className='bg-blueGray-800 flex flex-col md:flex-row w-full text-blueGray-300 justify-between items-center p-4 mt-2'>
                    <div>Key : {userkey}</div>
                    <div><>CreditBalance : {crdBalance}</></div>
                </div>                                   
            </div>
            <div className='p-2 md:mt-4'>
                <div className='bg-white shadow-xl min-w-min p-4 rounded-md'>
                    <div className="grid grid-rows md:grid-cols-2 gap-1">
                        <div className='flex flex-col justify-center items-center md:flex-row'>
                            <div className="bg-gray-100 p-2 md:w-64 flex rounded-md">
                                <MdEmail className="h-4 w-4 text-gray-400 m-2" />
                                <input
                                onChange={({ target }) => setPayload({ ...payload, email: target.value })}
                                type="email" className="bg-gray-100 outline-none text-sm flex-1" name="email" placeholder="example@example.com" /> 
                            </div>
                            <div className='mt-2 md:ml-2 md:mt-0'> 
                            {(isLoading.email) ?
                                <button className="cursor-not-allowed disabled relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white  focus:outline-none focus:ring-pink-200 ">
                                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                                    Searching..
                                </span>
                                </button>:
                                <button onClick={searchQuery} className="relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white  focus:outline-none focus:ring-pink-200 ">
                                <span id="email" className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                                    Search
                                </span>
                                </button>
                            }
                            </div>
                        </div>
                        <div className='flex flex-col justify-center items-center md:flex-row'>
                            <div className="bg-gray-100 p-2 md:w-64 flex rounded-md">
                                <FaMobile className="h-4 w-4 text-gray-400 m-2" />
                                <input
                                onChange={({ target }) => setPayload({ ...payload, mobile: target.value })}
                                type="text" className="bg-gray-100 outline-none text-sm flex-1" name="mobile" placeholder="911234567890" />                             
                            </div>              
                            <div className='mt-2 md:ml-2 md:mt-0'> 
                            {(isLoading.mobile) ?
                                <button className="cursor-not-allowed disabled relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white  focus:outline-none focus:ring-pink-200 ">
                                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                                    Searching..
                                </span>
                                </button>:
                                <button  onClick={searchQuery} className="relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white  focus:outline-none focus:ring-pink-200 ">
                                <span id="mobile" className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                                    Search
                                </span>
                                </button>
                            }
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-2 md:p-4 rounded-2xl shadow-lg min-w-max select-none mt-4 grid grid-cols-3 md:grid-cols-6 gap-1 py-4">
                {(isLoading.content) ?
                    <>
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div>
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div>
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div>
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div>
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div> 
                     <div className="bg-gray-200 w-full animate-pulse h-3 md:h-52 rounded-2xl" ></div>  
                     </>
                     :  
                     <>
                        {resResult}
                     </> 
                    }
                </div>                
            </div>
        </div>
        </>
    )
}
export const getServerSideProps = withIronSessionSsr(async function ({
    req,
    res,
  }) {
    const user = req.session.user
  
    if (user === undefined) {
      res.setHeader('location', '/')
      res.statusCode = 302
      res.end()
      return {
        props: {
          user: { isLoggedIn: false, userkey:'', creditBalance:0 } as User,
        },
      }
    }
  
    return {
      props: { user: req.session.user },
    }
  },
  sessionOptions)
export default Home