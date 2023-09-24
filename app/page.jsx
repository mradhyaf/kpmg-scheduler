"use client";

import { Box, Button, List, ListItem, ListItemButton, ListItemText, Modal, Stack, TextField, Typography } from "@mui/material"
import { format, getDay, getHours, getISODay, isSameDay, isWeekend, nextMonday, nextThursday, parseISO } from "date-fns"
import { useEffect, useRef, useState } from "react"

import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { StaticDateTimePicker } from "@mui/x-date-pickers";

const BOOKING_URL = "https://kpmgschedulerbackend-production.up.railway.app/api/booking"

// const MOCK_VALID_DATES = [
  //   parseISO("2023-09-22T10:04:15.325Z"),
  //   parseISO("2023-09-25T10:00:00.325Z"),
  //   parseISO("2023-09-22T11:00:00.325Z"),
  //   nextMonday(new Date()),
  //   nextThursday(new Date())
// ]

// const isInterviewerAvailable = (date: Date) => {
//   const res = MOCK_VALID_DATES.reduce((accumulated, currentValue) => accumulated || isSameDay(currentValue, date), false)
//   return !res
// }

const getTimeSlots = (res) => {
  return res.reduce((accumulated, curVal) => curVal.isAvailable ? [...accumulated, parseISO(curVal.slot)] : accumulated, [])
}

const splitToWeekdays = (dates) => {
  // Preventive measure to make sure only weekdays exist
  const weekdaysOnly = dates.filter((date) => !isWeekend(date))

  return weekdaysOnly.reduce((accumulated, curVal) => {
    accumulated[getDay(curVal) - 1].push(curVal)
    return accumulated
  }, [[], [], [], [], []])
}

function getDayString(dayNumber) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (dayNumber >= 0 && dayNumber < 7) {
    return daysOfWeek[dayNumber];
  } else {
    return 'Invalid day number';
  }
}

export default function Home() {
  const [slots, setSlots] = useState([])
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [slot, setSlot] = useState(new Date());

  const handleDateClick = (e, date) => {
    console.log("handleDateClick()");
    e.preventDefault();

    setSlot(date);
    setOpenModal(true);
  }

  const handleCancel = (e) => {
    e.preventDefault();

    setOpenModal(false);
    setMessage("");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      slot,
      "interviewee_name": name,
      "interviewee_email": email
    }

    setName("")
    setEmail("")

    const url = "https://kpmgschedulerbackend-production.up.railway.app/api/booking"
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    }

    fetch(url, options)
      .then(res => {
        console.log(res)
        return res.json()})
      .then(res => {
        setMessage("Booking successful")
        console.log(res)
        return res
      })
      .catch(err => setMessage(err.message))
  }

  useEffect(() => {
    fetch(BOOKING_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((responseData) => {
        setSlots(getTimeSlots(responseData))
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        setMessage(error);
      });
  }, [])

  return (
    <main
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box
        sx={{
          display: 'flex', 
          overflowX: 'auto'
        }}
      >
        {splitToWeekdays(slots).map((weekday, weekdayIdx) => (
          <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'auto'
          }}
          key={`box${weekdayIdx}`}>
            <Typography>{getDayString(weekdayIdx + 1)}</Typography>
            <List 
              sx={{
                border: '1px solid #ccc',
                padding: '10px',
                width: '200px',
                height: '500px',
                overflow: 'auto'
              }}
              key={weekdayIdx}
            >
              {weekday.map((slot, slotIdx) => (
                <ListItem key={`(${weekdayIdx}, ${slotIdx})`}>
                  <ListItemButton onClick={(e) => handleDateClick(e, slot)}>
                    <ListItemText primary={format(slot, "d LLLL, HH:mm")} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Modal open={openModal} >
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            p: 6,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <h2>Please input your credentials</h2>
          <form>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Stack>
            <Button sx={{ marginY: 2, marginRight: 2 }} variant="contained" onClick={handleCancel}>
              Cancel
            </Button>
            <Button sx={{ marginY: 2 }} variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </form>
          {!!message && <Typography>{message}</Typography>}
        </Box>
      </Modal>
    </main>
  )
}
