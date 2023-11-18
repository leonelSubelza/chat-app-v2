import React, { useContext } from 'react'
import './MemberList.css'

const MembersList = ({setTab,tab,privateChats}) => {

    return (
        <>
            <ul className="nav-links">
                    <li onClick={()=>setTab("CHATROOM")} className={`member ${tab==="CHATROOM" && "active"} `}>
                        <a href="#">
                            <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon"/>
                            <span className="link_name">CHAT GENERAL</span>
                        </a>
                    </li>

                <div className="info-sidebar">
                    <p>CHAT PRIVATE</p>
                    <div className="separator-sidebar"></div>
                </div>

                {privateChats.size>0 && [...privateChats.keys()].map((name,index)=>(
                    <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>
                        <a href="#">
                            <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon"/>
                            <span className="link_name">{name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </>
    )
}
export default MembersList;