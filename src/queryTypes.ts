export interface User{
    id:number,
    nickname:string,
    email:string,
    password:string,
    user_avatar:Blob,
    description:string,
    gender:string,
    birthday:string,
    valorant_data:ValorantData,
    csgo_data:CsGoData,
    teams:Team[]
}

interface ValorantData{
userId:number
}

interface CsGoData{
userId:number
    
}

interface Team{
    ownerId:number
}

