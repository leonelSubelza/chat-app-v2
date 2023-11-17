import React, { useContext } from 'react'

const MembersList = ({setTab,tab,privateChats}) => {

    return (
        <>
            <ul>
                <li onClick={()=>setTab("CHATROOM")} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                {privateChats.size>0 && [...privateChats.keys()].map((name,index)=>(
                    <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                ))}
            </ul>
        </>
    )

}
export default MembersList;