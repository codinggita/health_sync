import React, { useState, useContext } from 'react'
import { Link , useNavigate} from 'react-router-dom';
import { BASE_URL } from '../config';
import { authContext } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader.js';
import { auth, googleProvider, facebookProvider } from '../pages/firebase.js';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {

  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()
  const {dispatch} = useContext(authContext)

  const handleInpuutChnage = e => {
    setFormData({ ...FormData, [e.target.name]: e.target.value});
  };

  const submitHandler = async event => {
        event.preventDefault();
        setLoading(true);
        try{
          const res = await fetch(`${BASE_URL}/auth/login`,{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body: JSON.stringify(FormData)
          })
          const result = await res.json()
          if(!res.ok) {
            throw new Error(result.message || "Registration Failed")
          }

          dispatch( {
            type:"LOGIN_SUCCESS",
            payload: {
              user:result.data,
              token:result.token,
              role:result.role
            }
          });

          console.log(result, "login data")

          setLoading(false)
          toast.success("Registration successful!" || result.message)
          navigate('/home')
        }catch(err){
          toast.error(err.message || "Something went wrong!");
          setLoading(false)
        }
      }

      const handleGoogleLogin = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          console.log('Google Login Success:', user);
      
          // Store Firebase user data in localStorage (or state)
          localStorage.setItem('firebaseUser', JSON.stringify(user));
          toast.success('Google Login Successful!');
          navigate('/home'); // Redirect to home page
        } catch (error) {
          toast.error(error.message || 'Google Login Failed');
        }
      };

      const handleFacebookLogin = async () => {
        try {
          const result = await signInWithPopup(auth, facebookProvider);
          const user = result.user;
          console.log('Facebook Login Success:', user);
      
          // Store Firebase user data in localStorage (or state)
          localStorage.setItem('firebaseUser', JSON.stringify(user));
          toast.success('Facebook Login Successful!');
          navigate('/home'); // Redirect to home page
        } catch (error) {
          toast.error(error.message || 'Facebook Login Failed');
        }
      };

      

  return (
    <section className='px-5 lg:px-0'>

      <div className='w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10'>
        <h3 className='text-headingColor text-[27px] leading-9 font-bold mb-10'>
          Hello! <span className='text-primaryColor'> Welcome</span> Back 🎉
        </h3>

        <form className='py-4 md:py-0' onSubmit={submitHandler}>
          <div className='mb-5'>
            <input 
            type="email"
            placeholder='Enter Your Email' 
            name='email'
            value={FormData.email}
            onChange={handleInpuutChnage}
            className='w-full  py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor  cursor-pointer'
            required
            />
          </div>
          <div className='mb-5'>
            <input 
            type="password"
            placeholder='Password' 
            name='password'
            value={FormData.password}
            onChange={handleInpuutChnage}
            className='w-full  py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor  cursor-pointer'
            required
            />
          </div>


          <div className=''>
            <button type='submit' className='w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3'>{loading ? <HashLoader size={25} color='#ffffff'/> : 'Login'}</button>
          </div>
          <p className='mt-5 text-textColor text-center'>Don&apos;t have an account? <Link to='/register' className="text-primaryColor font-medium ml-1">Register</Link></p>
        </form>
        <div className='mt-5 flex items-center justify-center space-x-4 bg-white p-6 rounded-lg shadow-md'>
  <button
    type='button'
    onClick={handleGoogleLogin}
    className='flex items-center justify-center bg-white text-gray-700 text-[16px] font-medium rounded-lg px-8 py-4 border border-gray-300 hover:bg-gray-100 transition-all duration-200 shadow-md w-1/2'
  >
    <img
      src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
      alt='Google Logo'
      className='w-7 h-7 mr-3'
    />
    Google
  </button>
  <button
    type='button'
    onClick={handleFacebookLogin}
    className='flex items-center justify-center bg-[#1877F2] text-white text-[16px] font-medium rounded-lg px-8 py-4 hover:bg-[#166FE5] transition-all duration-200 shadow-md w-1/2'
  >
    <img
      src='https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
      alt='Facebook Logo'
      className='w-7 h-7 mr-3 bg-white p-1 rounded-full'
    />
    Facebook
  </button>
</div>


      </div>
    </section>
    
  )
}

export default Login
