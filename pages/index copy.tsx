import type { NextPage } from 'next'
import Head from 'next/head'
import axios from 'axios'
import Swal from 'sweetalert2'
import { FaKey } from "react-icons/fa"
import { FormEventHandler, useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { withIronSessionSsr } from "iron-session/next"
import { sessionOptions } from 'lib/session'

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";


type PayloadData = {
    userkey?:String
}
type ErrorMessage = {
    message?:any
}

const Home: NextPage = (): JSX.Element => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [payload, setPayload] = useState<PayloadData>({})
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()   
    let {userkey} = payload
    userkey = userkey?.trim()

    const showError = (Error:ErrorMessage) => {
        Swal.fire({
            toast: true,           
            showConfirmButton: false,        
            icon: 'warning',
            title: 'Login Validation !',
            text:Error.message
        }) 
    }

   
    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        Swal.close()
        e.preventDefault()      
           
        if (!executeRecaptcha) {
        return;
        }
      
        try {
            const token = await executeRecaptcha();
            if (!token) {
                showError({ message: "Failed to Send!!!" });
                return;
            } 
            setIsLoading(true)
            if(userkey?.length === 19){  
                
                await axios.post('/api/login',  { userkey },
                {
                    headers: {  
                        Accept: "application/json",         
                        "Content-Type": "application/json",
                    }
                }).then(async function (response) {  
                    await Swal.fire({                       
                        icon: 'success',
                        width: 400,
                        title: 'You are successfully logged in',
                        showConfirmButton: false,
                        timer: 1500
                      })
                    return router.push("/home")
                })
                .catch(function (error) {                                         
                   showError({message:error.response.data})
                });
      
            }else{
                showError({message:"Not a valid Key"})
            }
        }catch(err){
            showError({message:err})
        }
        setIsLoading(false)
    }    
    return(
    <>
    <div>
        <Head>
            <title>Social Links</title>
        </Head>
    </div>
    <div className='flex justify-center items-center h-screen'>
        <div className='flex bg-white shadow-2xl md:h-80 rounded-2xl min-w-min md:w-8/12 max-w-3xl flex-col w-8/12 md:flex-row overflow-hidden'>
            <div className='grid grid-rows md:grid-cols-2 w-full'>
                <div className='text-center p-8'>
                    <div>
                        <h2 className="font-bold text-slate-800 mb-2 uppercase md:text-2xl">Login </h2>
                        <hr className='border-slate-800 h-1 w-24 md:w-28 mx-auto '></hr>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-row gap-2 mt-4'>                            
                            <div className="bg-gray-100 p-2 md:w-full flex rounded-md">
                                <FaKey className="h-4 w-4 text-gray-400 m-2" />
                                <input
                                onChange={({ target }) => setPayload({ ...payload, userkey: target.value })}
                                type="string" className="bg-gray-100 w-16 outline-none text-sm flex-1" name="userkey" placeholder="1234-abcd-23cd-39bd" /> 
                            </div>
                            <div className='mt-5'>
                             {(isLoading)?
                             <button type="submit" className="disabled cursor-not-allowed border-2 border-slate-800 text-slate-800 rounded-full px-8 py-2 inline-block font-semibold hover:bg-slate-800 hover:text-white">Wait...</button>
                             :
                             <button type="submit" className="border-2 border-slate-800 text-slate-800 rounded-full px-8 py-2 inline-block font-semibold hover:bg-slate-800 hover:text-white">Login</button>
                            }                               
                            </div>                            
                        </div>
                    </form>
                </div>
                <div className='text-center bg-slate-800 p-8'>
                    <div>
                        <h2 className="font-bold text-white mb-2 uppercase md:text-2xl">Social Links </h2>
                        <hr className='border-white h-1 w-24 md:w-28 mx-auto '></hr>
                    </div>
                    <div className='mt-4'>
                    <p className="text-blueGray-400">This tools help you to get social medial profile by email and mobile number for demo and price contact at <span className="text-white font-bold mt-1 block">care.bytesec@gmail.com</span></p>
                    </div>
                </div>
            </div>
        </div> 
    </div>
    </>
    )
}
export const getServerSideProps = withIronSessionSsr(
    async ({req, res}) => {
        let user = req.session.user 
        if(user){       
            if(user?.isLoggedIn == true){
                return {
                    redirect: {
                    permanent: false,
                    destination: "/home"
                    }
                }
            }
        }else{
            user = {isLoggedIn: false, userkey: '', creditBalance: 0}
        }
        return {
            props: { user }
        }
    }
,sessionOptions);
export default Home