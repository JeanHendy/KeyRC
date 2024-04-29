class Administrator {
    constructor(name, email, password){
        this.name=name
        this.email=email
        this.password=password
        this.created=new Date()
    }
}

class Lock {
    constructor(adminId, location, lastToken){
        this.adminId=adminId
        this.location=location
        this.lastToken=lastToken || ''
        this.created=new Date()
    }
}

class Token {
    constructor(adminId, token){
        this.adminId=adminId
        this.token=token || ''
        this.created=new Date()
    }
}

module.exports={Administrator, Lock, Token}