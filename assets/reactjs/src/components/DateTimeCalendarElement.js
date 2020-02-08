import  React from 'react'

export default function DateTimeCalendarElement (props) {
    const date = <div className='dateTimeCalendar__date'>
      {moment(props.date).locale(Pard.Options.language()).format('D MMM YYYY')}
    </div>
    const time = <div className='dateTimeCalendar__time'>
      {moment(parseInt(props.time[0])).locale(Pard.Options.language()).format('HH:mm')}
      -
      {moment(parseInt(props.time[1])).locale(Pard.Options.language()).format('HH:mm')}
    </div>

    return <span className='dateTimeCalendar'>
      {date}
      {time}
    </span>  

}