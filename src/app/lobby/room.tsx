"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../context/SocketProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
const { v4: uuidv4 } = require("uuid");

export default function Room() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data: any) => {
      const { email, room } = data;
      // router.push(`/`);
      router.push(`/${room}`);
    },
    [router]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  function generateRoomCode() {
    // Generate a random 6-digit integer
    const roomCode = Math.floor(100000 + Math.random() * 900000);

    setRoom(roomCode.toString());
  }

  return (
    <Sheet open={isOpen}>
      <SheetContent className="bg-black border-transparent">
        <SheetHeader>
          <SheetTitle>
            <Image
              src="/interface.png"
              width={500}
              height={500}
              alt="Picture of the author"
            />
          </SheetTitle>

          <SheetDescription>
            <Select>
              <SelectTrigger className="w-full bg-gradient-to-r from-purple-700 to-blue-500 border-none outline-none">
                <div className="text-center w-full text-slate-100 text-base">
                  Join a meet
                </div>
              </SelectTrigger>
              <SelectContent className="">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button className="w-full mb-2" onClick={generateRoomCode}>
                      <FontAwesomeIcon icon={faVideo} className="mr-8" />
                      <span>New Meeting</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Enter your EmailID to create a new room
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <Input
                          type="email"
                          placeholder="Email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-purple-700 hover:bg-blue-500"
                        onClick={handleSubmitForm}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button className="w-full">
                      <FontAwesomeIcon icon={faUserFriends} className="mr-8" />
                      <span>Join a Room</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Enter Room ID to join the space
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <InputOTP
                          onChange={(e) => setRoom(e)}
                          maxLength={6}
                          className=" my-0 mx-auto"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-purple-700 hover:bg-blue-500"
                        onClick={handleSubmitForm}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SelectContent>
            </Select>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
