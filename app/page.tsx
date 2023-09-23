"use client";

import { Box, Button, List, ListItem, ListItemButton, ListItemText, Modal, Stack, TextField, Typography } from "@mui/material"
import { isSameDay, nextMonday, nextThursday, parseISO } from "date-fns"
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

const getTimeSlots = (res: Date[]) => {
  return res.reduce((accumulated, curVal) => curVal.isAvailable ? [...accumulated, parseISO(curVal.slot)] : accumulated, [])
}

export default function Home() {
  const [slots, setSlots] = useState([])
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [slot, setSlot] = useState(new Date());

  const handleDateClick = (e, date: Date) => {
    console.log("handleDateClick()");
    e.preventDefault();

    setSlot(date);
    setOpenModal(true);
  }

  const handleCancel = (e) => {
    e.preventDefault();

    setOpenModal(false);
    setError("");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      slot,
      "interviewee_name": name,
      "interviewee_email": email
    }

    const url = "https://kpmgschedulerbackend-production.up.railway.app/api/booking"
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    }

    fetch(url, options)
      .then(res => res.json())
      .then(res => setError(res.message))
      .catch(err => setError(err.message))
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
        setError(error);
      });
  }, [])

  return (
    <main>
      <List>
        {slots.map((date, idx) => (
          <ListItem key={idx}>
            <ListItemButton onClick={(e) => handleDateClick(e, date)}>
              <ListItemText primary={date.toString()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

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
          {!!error && <Typography>{error}</Typography>}
        </Box>
      </Modal>
    </main>
  )
}
