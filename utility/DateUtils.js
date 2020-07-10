async function getTimeZoneDate(tz){
    let date;
    switch(tz){
        case "IN":
            date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            break;
    }
    console.log("Time for "+tz+": "+ date );
    return new Date(date);
}

async function getDateBasedOnDay(dayNo){
    let date;
    const now = new Date();
    const todayNo = now.getDay();

    if(todayNo > dayNo){
        const futureDay = (7 - todayNo) + dayNo;
        date = new Date(now.setDate(now.getDate() + futureDay));
    }
    else{
        date = new Date(now.setDate(now.getDate() + dayNo));
    }
    console.log("Date based on day is :"+ date );
    return date;
}

module.exports = {
    getTimeZoneDate,
    getDateBasedOnDay
}