import { VerificationLevel, IDKitWidget } from "@worldcoin/idkit";
import { useEffect, useState } from "react"; // React hooks for managing state
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      '"Figtree"',
      'sans-serif',
    ].join(','),
  },
});

export default function Vote() {
  const [voteGrain, setVoteGrain] = useState(0);
  const [voteRice, setVoteRice] = useState(0);
  const [voteHygiene, setVoteHygiene] = useState(0);

  const signalObj = {
    voteGrain,
    voteRice,
    voteHygiene,
  }

  if (!process.env.NEXT_PUBLIC_WLD_APP_ID) {
    throw new Error("app_id is not set in environment variables!");
  }
  if (!process.env.NEXT_PUBLIC_WLD_ACTION) {
    throw new Error("app_id is not set in environment variables!");
  }

  const onSuccess = (result: ISuccessResult) => {
    // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
    window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit:\n", JSON.stringify(result)); // Log the proof from IDKit to the console for visibility
    const reqBody = {
      merkle_root: result.merkle_root,
      nullifier_hash: result.nullifier_hash,
      proof: result.proof,
      verification_level: result.verification_level,
      action: process.env.NEXT_PUBLIC_WLD_ACTION,
      signal: JSON.stringify(signalObj),
    };
    console.log("Sending proof to backend for verification:\n", JSON.stringify(reqBody)) // Log the proof being sent to our backend for visibility
    const res: Response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
    const data: VerifyReply = await res.json()
    if (res.status == 200) {
      console.log("Successful response from backend:\n", data); // Log the response from our backend for visibility
    } else {
      throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
    }
  };
  const remain = 100 - voteGrain - voteHygiene - voteRice;
  return (
    <div style={{ fontFamily: 'Figtree, sans-serif' }}>
      <div className="flex flex-col items-center justify-center align-middle h-screen">
        <div className="container-same-line">
        <img src={"https://noun-api.com/beta/pfp?head=101&glasses=14&size=50&r="+Math.random()} />
          <img src={"https://noun-api.com/beta/pfp?head=101&glasses=14&size=50&r="+Math.random()} />
          <p className="text-2xl mb-5">May 2024 Grain Distribution</p>
          <img src={"https://noun-api.com/beta/pfp?head=101&glasses=14&size=50&r="+Math.random()} />
          <img src={"https://noun-api.com/beta/pfp?head=101&glasses=14&size=50&r="+Math.random()} />
        </div>
        Vote for next aid package:<br />{remain} points remaining<br />
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <ThemeProvider theme={theme}>

            <div>
              <TextField
                required
                id="outlined-required"
                label="Grain"
                defaultValue="0"
                onChange={(e) => setVoteGrain(Number(e.target.value))}
              />
            </div>
            <div>
              <TextField
                required
                id="outlined-required"
                label="Rice"
                defaultValue="0"
                onChange={(e) => setVoteRice(Number(e.target.value))}
              />
            </div>
            <div>
              <TextField
                required
                id="outlined-required"
                label="Hygiene Products"
                defaultValue="0"
                onChange={(e) => setVoteHygiene(Number(e.target.value))}
              />
            </div>
          </ThemeProvider>

        </Box>
        <IDKitWidget
          action={process.env.NEXT_PUBLIC_WLD_ACTION!}
          app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
          onSuccess={onSuccess}
          signal={JSON.stringify(signalObj)}
          handleVerify={handleProof}
          verification_level={VerificationLevel.Orb} // Change this to VerificationLevel.Device to accept Orb- and Device-verified users
        >
          {({ open }) =>
            <button className="border border-black rounded-md" onClick={open}>
                      <div className="container-same-line">
                      <img src="/icons/check-circle-rounded.svg" />
              <div className="mx-3 my-1" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>Claim with World ID</div>
              <img src="/icons/check-circle-rounded.svg" />
              </div>
            </button>
          }
        </IDKitWidget>
      </div>
    </div>
  );
}
