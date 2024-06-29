"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CodeEditor from "./CodeEditor";
import RoomPage from "./Video";
import Whiteboard from "./Whiteboard";

const RoomID = () => {
  const params = useParams();
  return (
    <section className="bg-black w-screen h-screen overflow-hidden">
      {/* This is room ID Welcome to the hell fuck off {params.room} */}
      {/* <RoomPage /> */}
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full border-none"
      >
        <ResizablePanel defaultSize={30}>
          <RoomPage />
        </ResizablePanel>
        <ResizableHandle className="w-1 border-slate-800" />
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <CodeEditor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <Whiteboard />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
};

export default RoomID;
