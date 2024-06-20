// components/RoomPage.tsx
"use client";

import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useRouter } from "next/navigation";
import peer from "../../peer/peer"; // Assuming this imports the PeerService instance
import { socket } from "../../context/SocketProvider";

interface IncommingCallPayload {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAcceptedPayload {
  from: string;
  ans: RTCSessionDescriptionInit;
}

interface NegoNeededPayload {
  offer: RTCSessionDescriptionInit;
  to: string;
}

interface NegoNeedIncommingPayload {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface NegoNeedFinalPayload {
  ans: RTCSessionDescriptionInit;
}

interface UserJoinedPayload {
  email: string;
  id: string;
}

const RoomPage: React.FC = () => {
  const router = useRouter();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleUserJoined = useCallback(({ email, id }: UserJoinedPayload) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }: IncommingCallPayload) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    []
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }: CallAcceptedPayload) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }: NegoNeedIncommingPayload) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    []
  );

  const handleNegoNeedFinal = useCallback(
    async ({ ans }: NegoNeedFinalPayload) => {
      await peer.setLocalDescription(ans);
    },
    []
  );

  useEffect(() => {
    peer.peer.addEventListener("track", (ev: RTCTrackEvent) => {
      const remoteStream = ev.streams[0];
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (remoteSocketId) {
      handleCallUser();
      if (myStream) {
        sendStreams();
      }
    }
  }, [remoteSocketId]);

  const handleEndCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    peer.peer.close();
    router.push("/lobby");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="w-full h-[40vh] bg-slate-700 p-2">
        {myStream && (
          <ReactPlayer playing height="100%" width="100%" url={myStream} />
        )}
      </div>
      <div className="w-full h-[40vh] bg-slate-700 p-2 mt-4">
        {remoteStream && (
          <ReactPlayer playing height="100%" width="100%" url={remoteStream} />
        )}
      </div>

      {remoteStream && (
        <button
          onClick={handleEndCall}
          className="mx-0 my-auto bg-red-500 text-white"
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default RoomPage;
