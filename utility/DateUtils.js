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

module.exports = {
    getTimeZoneDate
}