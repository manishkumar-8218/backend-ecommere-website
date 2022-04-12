class ApiFeatures{
    constructor(query,querystr){
        this.query=query;
        this.querystr=querystr;
    }
    search(){
        const keyword = this.querystr.keyword
        ?{
            name:{
                $regex:this.querystr.keyword,
                $options:"i",
            },
        }:{};
        this.query=this.query.find({...keyword});
        return this;
    }
    filter(){
        const queryCopy={...this.querystr};
        // reamoving some fileds for category
        const removeFields=["keyword","page","limit"];
        removeFields.forEach((key)=>delete queryCopy[key]);
         
        // filter for price and reating
        let querystr=JSON.stringify(queryCopy);
        querystr=querystr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`);
        this.query=this.query.find(JSON.parse(querystr));
        return this;
    }
    pagination(resultPerpage){
        const currentPage=Number(this.querystr.page)||1;
        const skip=resultPerpage*(currentPage-1);
        this.query=this.query.limit(resultPerpage).skip(skip);
        return this;
    }
};

module.exports=ApiFeatures