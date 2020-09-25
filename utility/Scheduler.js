const ScheduledMeetings = require('../models/meetings')
const liveStreamFuntions = require('../models/LiveStream')

const endMeeting = ( ) =>{
    ScheduledMeetings.model.find().exec().then(meetings => {
  
        meetings.map((meet,index)=>{
          const now = new Date()
          const endTime = new Date(meet.endTime)
          if(now > endTime && meet.status === "LIVE" && meet.meetingNumber){
            liveStreamFuntions.setFinished(meet.meetingNumber)
            ScheduledMeetings.edit(meet.meetingNumber)
          }
        })
      }).catch(err=>{
        console.log(err);
      })
}

module.exports = {
    endMeeting
}