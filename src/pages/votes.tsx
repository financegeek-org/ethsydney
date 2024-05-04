import { VerificationLevel, IDKitWidget } from "@worldcoin/idkit";
import { useEffect, useState } from "react"; // React hooks for managing state
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      '"Figtree"',
      'sans-serif',
    ].join(','),
  },
});

type TypeChoices = {
  grain: number,
  rice: number,
  hygiene: number,
};


const getVotes = async () => {
  const res: Response = await fetch("/api/votes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
  const data: VerifyReply = await res.json()
  if (res.status == 200) {
    console.log("Successful response from backend:\n", data); // Log the response from our backend for visibility
    return data;
  } else {
    throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
    return {};
  }
};


function createData(
  hash: string,
  time: number,
  choices: TypeChoices,
) {
  //console.log("Creating", choices)
  return { hash, time, grain: choices['voteGrain'], rice: choices['voteRice'], hygiene: choices['voteHygiene'] };
}


export default function Votes() {
  const [voteList, setVoteList] = useState([]);
  useEffect(() => {
    console.log("Getting votes");
    getVotes().then(arr => {
      console.log(arr)
      setVoteList(arr);
    })
  }, [])

  const rows = voteList.map(vote => {
    const choices = JSON.parse(vote['vote']);
    return createData(vote['nullifier_hash'], vote['time'], choices)
  });

  console.log(voteList);
  console.log(rows);
  return (
    <div style={{ fontFamily: 'Figtree, sans-serif' }}>
      <ThemeProvider theme={theme}>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell align="right">Hash</TableCell>
                <TableCell align="right">Grain</TableCell>
                <TableCell align="right">Rice</TableCell>
                <TableCell align="right">Hygiene</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.hash}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.time}
                  </TableCell>
                  <TableCell align="right">{row.hash}</TableCell>
                  <TableCell align="right">{row.grain}</TableCell>
                  <TableCell align="right">{row.rice}</TableCell>
                  <TableCell align="right">{row.hygiene}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>

    </div>
  );
}
