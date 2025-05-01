import React, { useState, useEffect } from 'react'
import Loader from '../../components/Loader/Loading.jsx';
import Error from "../../components/Error/Error.jsx";
import useGetProfile from '../../hooks/useFetchData.jsx'
import { BASE_URL, SOCKET_URL } from '../../config';
import Tabs from './Tabs';
import starIcon from '../../assets/images/Star.png'
import DoctorAbout from '../../pages/Docters/DoctorAbout.jsx';
import Profile from './Profile.jsx';
import Appointments from './Appointment.jsx';
import { io } from 'socket.io-client';

const socket = io(SOCKET_URL) // setting up socket connection

const DashBoard = () => {
  const {data,loading,error} = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const [emergencyMsg, setEmergencyMsg] = useState('')
  const [tab,setTab] = useState('overview')
  const [address, setAddress] = useState("");
  
  const getAddress = async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    setAddress(data.display_name);
  };
  

  //listen for incoming emergency messages
  useEffect(() => {
    console.log("In use effect");
    
    // Confirm socket connected
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });

    // Listen for emergency alerts
    socket.on('new_emergency_alert', (data) => {
      setEmergencyMsg(data);
      getAddress(data.location.latitude,data.location.longitude)
    });

    return () => {
      socket.off('new_emergency_alert');
      socket.off('connect');
    };
  }, []);
  
  return (
   <section>
    <div className='max-w-[1170px] px-5 mx-auto'>
      {loading && !error && <Loader/>}
      {error && !loading && <Error />}

      {
        !loading && !error && (
        <div> 
          {/* Emergency alert goes below */} {emergencyMsg!=="" &&
          <div className='flex p-4 mb-4 text-white bg-red-400 rounded-lg'>
          <svg
              aria-hidden="true"
              className="flex-shrink-0 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm0 8a1 1 0 102 0 1 1 0 00-2 0z"
                clipRule="evenodd"
              />
            </svg>

                  <span className='sr-only'>Emergency</span>
                  <div className='ml-3 text-sm font-medium'>
                  <div>Emergency! {emergencyMsg && emergencyMsg.name ? emergencyMsg.name : "Unknown" } has an emergency.</div>
                  {address && (
                    <div className='text-xs text-white mt-1'>
                      Location: {address}
                    </div>
                  )}
                                    
                  </div>
              </div> }
        <div className='grid lg:grid-cols-3 gap-[30px] lg:gap-[50px]'>
          <Tabs tab={tab} setTab={setTab}/>
          <div className='lg:col-span-2'>
            {data?.isApproved === "pending" && (
              <div className='flex p-4 mb-4 text-yellow-800 bg-yellow-50 rounded-lg'>
                <svg
                aria-hidden="true"
                className="flex-shrink-0 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001  1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                  ></path>
                  </svg>

                  <span className='sr-only'>Info</span>
                  <div className='ml-3 text-sm font-medium'>
                    To get approval please complete your profile. we&apos;ll
                    review manually annd approve within 3days.
                  </div>
              </div>
            )}

            <div className='mt-8'>
              {tab==='overview' && (
              <div>
                <div className='flex items-center gap-4 mb-10'>
                  <figure className='max-w-[200px] max-h-[200px]'>
                    <img src={data?.photo} alt="" className='w-full' />
                  </figure>

                  <div>
                    <span className='bg-[#CCF0F3] text-irisBlueColor py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-6 font-semibold'>
                     {data?.specialization}
                    </span>
                    <h3 className='text-[22px] leading-9 font-bold text-headingColor mt-3'>
                     {data?.name}
                    </h3>

                    <div className='flex items-center gap-[6px]'>
                      <span className='flex items-centergap-[6px] text-headingColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold '><img src={starIcon} alt="" />
                      {data?.averageRating}
                      </span>
                      <span className=' text-textColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold '> 
                      ({data?.totalRating})</span>
                    </div>

                    <p className='text_para font-[15px] lg:max-w-[390px] leading-6'>
                      {data?.bio}
                    </p>
                  </div>
                </div>
                <DoctorAbout name={data?.name} about={data?.about} qualifications={data?.qualifications} experiences={data?.experiences}/>
              </div>
              
              



              )}
              {tab==='appointments' && <Appointments appointments={data.appointments} /> }
              {tab==='settings' && <Profile doctorData={data} />  }

            </div>
          </div>
          </div>
          </div>
      )}
    </div>
   </section>
  )
}

export default DashBoard
