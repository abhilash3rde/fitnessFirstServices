async function getTimeZoneDate(tz) {
  let date;
  switch (tz) {
    case "IN":
      date = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
      break;
  }
  console.log("Time for " + tz + ": " + date);
  return new Date(date);
}

async function getDateBasedOnDay(dayNo) {
  let date;
  const now = await getTimeZoneDate("IN");
  const todayNo = now.getDay();

  if (todayNo > dayNo) {
    const futureDay = (7 - todayNo) + dayNo;
    date = new Date(now.setDate(now.getDate() + futureDay));
  } else {
    date = new Date(now.setDate(now.getDate() + dayNo));
  }
  console.log("Date based on day is :" + date);
  return date;
}

function getRelativeDate(dayCount) {
  // dayCount can be negative, yielding past dates
  const now = new Date();
  now.setDate(now.getDate() + dayCount);
  return now;
}
const convertdate = (date) => {

  // let now = new Date();
  let time = new Date(date);
  let ofset = time.getTimezoneOffset()
  // console.log(ofset,'ofset')
  let newmin = ofset % 60;
  let newhrs = ofset / 60;
  newhrs = time.getHours() - newhrs
  newmin = time.getMinutes() - newmin
  // console.log(date,"----------------------------",time.getDate(),"---------------------",ofset,'ofset')
  time.setDate(time.getDate())
  time.setHours(newhrs);
  time.setMinutes(newmin);
  // console.log(time,'now-------------')
  return time

}
const converteddate = () => {
  return convertdate(new Date())

}

module.exports = {
  getTimeZoneDate,
  getDateBasedOnDay,
  getRelativeDate,
  convertdate,
  converteddate
}