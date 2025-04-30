import React from 'react'
import { useEffect,useRef, useContext } from 'react'
import Logo from "../../assets/images/logo.png"
import {BiMenu} from "react-icons/bi"
import {NavLink,Link} from 'react-router-dom'
import "../../App.css"
import useGetProfile from '../../hooks/useFetchData.jsx';
import { BASE_URL } from '../../config';
import { authContext } from '../../context/AuthContext'
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const navLinks = [
  {
    path:'/home',
    display: 'Home'
  },
  {
    path:'/doctors',
    display: 'Find a Doctor'
  },
  {
    path:'/services',
    display: 'services'
  },
  {
    path:'/contact',
    display: 'contact'
  },
]





const Header = () => {
    const headerRef = useRef(null)
    const menuRef = useRef(null)
    const {user,role,token} = useContext(authContext)
  
  const handleStickyHeader = () => {
    if (!headerRef.current) return;
    window.addEventListener('scroll', () => {
      if(document.body.scrollTop > 80 || document.documentElement.scrollTop > 80){
        headerRef.current.classList.add('sticky_header')
      }else{
        headerRef.current.classList.remove('sticky_header')
      }
    })
  }
  
  useEffect(() => {
    handleStickyHeader();
    
    return () => window.removeEventListener('scroll',handleStickyHeader);
  });

  const toggleMenu = () => menuRef.current.classList.toggle('show_menu')

  const handleEmergency = () => {
    const confirmed = window.confirm("Are you sure you want to send an emergency alert?");
    if (!confirmed) {
      console.log("Emergency alert cancelled!");
      return;
    } 
    //fetch the location of the user
    navigator.geolocation.getCurrentPosition((position)=>{
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      sendEmergencyData(location);
    },
    (error) => {
      console.log("Location access denied or unavaiable", error.message);
      sendEmergencyData(null);
    }
  )
  }

  const { data: userData, loading, error } = useGetProfile(`${BASE_URL}/users/profile/me`);

  const sendEmergencyData = (location) => {
    //all the data that is necessary bundled into an object
    const emergencyData = {
      patientId: userData._id,
      name: userData.name,
      location: location,
      time: new Date().toISOString
    }
    socket.emit("emergency_alert", alertData)
    alert("Emergency alert sent")
  }

  return (
    <header className=" header flex items-center" ref={headerRef}>
      <div className='container'>
        <div className='flex items-center justify-between'>
          {/* logo */}
          <div>
            <img src={Logo} alt="" />
          </div>

          {/* menu */}

          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className='menu flex items-center gap-[2.7rem]'>
              {
                navLinks.map((link,index)=>
                <li key={index}>
                  <NavLink to={link.path} 
                  className={navClass => navClass.isActive ? 'text-primaryColor text-[16px] leading-7 font-[600]' : 'text-textColor text-[16px] leading-7 font-[500] hover:text-[#0067FF]'}>
                  {link.display}
                  </NavLink>  
                </li>)
              }
            </ul>
          </div>

          {/* nav-right */}

          <div className='flex items-center gap-4'>
            {token && user ? (
              <div className="flex items-center gap-3">
              {role==="patient" && (<button className="bg-red-600 text-white px-3 py-2 rounded-md text-sm leading-none hover:bg-red-700 transition" onClick={handleEmergency}>
                Emergency
              </button>)}
            
              <Link to={`${role === 'doctor' ? '/doctors/profile/me' : 'users/profile/me'}`}>
                <figure className="w-[35px] h-[35px] rounded-full overflow-hidden cursor-pointer">
                  <img src={user?.photo} className="w-full h-full object-cover" alt="Profile" />
                </figure>
              </Link>
            </div>
             ) : ( 
             <Link to='/login'>
            <button className='bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]'>Login</button>
            </Link>
            )}
            
           

            <span className='md:hidden' onClick={toggleMenu}>
              <BiMenu className='w-6 h-6 cursor-pointer' />
            </span>


          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
