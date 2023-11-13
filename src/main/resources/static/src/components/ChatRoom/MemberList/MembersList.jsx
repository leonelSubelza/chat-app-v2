import React, { useContext } from 'react'

const MembersList = ({setTab,tab,privateChats,userData,disconnectChat}) => {

    return (
        <div className="member-list">
            <ul>
                <li onClick={()=>setTab("CHATROOM")} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                {privateChats.size>0 && [...privateChats.keys()].map((name,index)=>(
                    <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                ))}
            </ul>
            <div className='user-info-container'>
                <div className="user-info">
                    <img src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon"/>
                    <p>{userData.username}</p>
                </div>
                <button type="button" className="leave-button" onClick={disconnectChat}>Leave</button>
            </div>

        </div>
    )

}
export default MembersList;